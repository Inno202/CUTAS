from datetime import datetime

from django.db.models import Count, Q
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, parsers, status, viewsets
from rest_framework.decorators import action, api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from cutas_app.models import (
    AuditLog, Award, Challenge, FundingOpportunity, GrowthSuggestion, InstitutionalContent,
    Publication, PublishStatus, ScholarProfile, StudyDetails, User, Workshop,
)
from . import serializers as S
from .audit import record
from .pdf import build_pdf
from .permissions import IsAdminRole, IsSuperAdmin, PublicReadAdminWrite


def _name(u):
    return u.get_full_name() or u.username


# ================================================================ AUTH
class LoginView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        resp = super().post(request, *args, **kwargs)
        if resp.status_code == 200:
            user = User.objects.filter(username__iexact=request.data.get('username', '')).first()
            record(request, 'LOGIN', details='Successful login', user=user)
            resp.data['user'] = S.UserSerializer(user, context={'request': request}).data
        else:
            record(request, 'LOGIN_FAILED', target=str(request.data.get('username', ''))[:100])
        return resp


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def post(self, request):
        ser = S.RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        record(request, 'REGISTER', details='Registered postgraduate scholar', user=user)
        return Response(S.UserSerializer(user, context={'request': request}).data, status=201)


class LogoutView(APIView):
    def post(self, request):
        try:
            RefreshToken(request.data.get('refresh', '')).blacklist()
        except TokenError:
            return Response({'detail': 'Invalid or expired refresh token.'}, status=400)
        record(request, 'LOGOUT')
        return Response(status=204)


class MeView(APIView):
    def get(self, request):
        return Response(S.UserSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        ser = S.MeUpdateSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        record(request, 'ACCOUNT_UPDATE')
        return Response(S.UserSerializer(request.user, context={'request': request}).data)

    def delete(self, request):
        """Scholars can permanently delete their own account and all their data."""
        u = request.user
        if u.is_cut_admin:
            return Response({'detail': 'Administrative accounts cannot be self-deleted.'}, status=403)
        ser = S.DeleteAccountSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        prof = getattr(u, 'profile', None)
        if prof:
            for f in (prof.profile_picture, prof.cv_file):
                if f:
                    f.delete(save=False)
        record(request, 'ACCOUNT_DELETED', target=u.username, details='Scholar purged account and records')
        u.delete()
        return Response(status=204)


class ChangePasswordView(APIView):
    def post(self, request):
        ser = S.ChangePasswordSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        request.user.set_password(ser.validated_data['new_password'])
        request.user.save()
        record(request, 'PASSWORD_CHANGE')
        return Response({'detail': 'Password updated. Please sign in again.'})


# ================================================================ PROFILE & DIRECTORY
class MyProfileView(APIView):
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def get(self, request):
        prof, _ = ScholarProfile.objects.get_or_create(user=request.user)
        return Response(S.ProfileSerializer(prof).data)

    def patch(self, request):
        prof, _ = ScholarProfile.objects.get_or_create(user=request.user)
        ser = S.ProfileSerializer(prof, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        record(request, 'PROFILE_UPDATE')
        return Response(S.ProfileSerializer(prof).data)

    put = patch


class ScholarListView(APIView):
    def get(self, request):
        qs = ScholarProfile.objects.select_related('user').filter(user__role=User.Role.SCHOLAR, user__is_active=True)
        cat = request.query_params.get('category')
        if cat in ('CAT_A', 'CAT_B', 'CAT_C'):
            qs = qs.filter(category=cat)
        q = request.query_params.get('search')
        if q:
            qs = qs.filter(Q(user__first_name__icontains=q) | Q(user__last_name__icontains=q) |
                           Q(faculty__icontains=q) | Q(department__icontains=q))
        counts = dict(ScholarProfile.objects.filter(user__role=User.Role.SCHOLAR)
                      .values_list('category').annotate(n=Count('id')))
        return Response({
            'counts': {'CAT_A': counts.get('CAT_A', 0), 'CAT_B': counts.get('CAT_B', 0), 'CAT_C': counts.get('CAT_C', 0)},
            'results': S.DirectorySerializer(qs, many=True, context={'request': request}).data,
        })


class ScholarDetailView(APIView):
    """In-portal CV view (text only). No file download for other users' CVs."""
    def get(self, request, pk):
        prof = get_object_or_404(ScholarProfile.objects.select_related('user'), user_id=pk, user__role=User.Role.SCHOLAR)
        return Response(S.DirectorySerializer(prof, context={'request': request}).data)


class ScholarPictureView(APIView):
    def get(self, request, pk):
        prof = get_object_or_404(ScholarProfile, user_id=pk)
        if not prof.profile_picture:
            raise Http404
        return FileResponse(prof.profile_picture.open('rb'))


class MyCvFileView(APIView):
    """Owner can retrieve their own uploaded CV file; nobody else can."""
    def get(self, request):
        prof = get_object_or_404(ScholarProfile, user=request.user)
        if not prof.cv_file:
            raise Http404
        return FileResponse(prof.cv_file.open('rb'), as_attachment=True)


class LeadersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = User.objects.filter(role__in=[User.Role.ADMINISTRATOR, User.Role.SUPER_ADMIN], is_active=True).select_related('profile')
        return Response(S.LeaderSerializer(qs, many=True).data)


# ================================================================ OWNER-SCOPED CRUD (+PDF)
class OwnedViewSet(viewsets.ModelViewSet):
    """Each scholar only ever sees and changes their own rows."""
    pdf_name = 'records'
    pagination_class = None

    def get_queryset(self):
        return self.queryset.model.objects.filter(user=self.request.user)

    def perform_create(self, ser):
        obj = ser.save(user=self.request.user)
        record(self.request, f'{self.audit}_ADD', target=obj.pk)

    def perform_update(self, ser):
        obj = ser.save()
        record(self.request, f'{self.audit}_EDIT', target=obj.pk)

    def perform_destroy(self, obj):
        record(self.request, f'{self.audit}_DELETE', target=obj.pk)
        obj.delete()


class PublicationViewSet(OwnedViewSet):
    queryset = Publication.objects.all()
    serializer_class = S.PublicationSerializer
    audit = 'PUB'

    @action(detail=False, methods=['get'])
    def pdf(self, request):
        rows = [[i, p.get_publication_type_display(), f'{p.title}\n{p.authors}', p.outlet_name, p.year, p.get_status_display()]
                for i, p in enumerate(self.get_queryset(), 1)]
        return build_pdf(f'CUTAS_Publications_{request.user.username}.pdf', 'Official Publication Record', _name(request.user),
                         [{'table': {'headers': ['#', 'Type', 'Title / Authors', 'Outlet', 'Year', 'Status'], 'rows': rows}}])


class GrowthViewSet(OwnedViewSet):
    queryset = GrowthSuggestion.objects.all()
    serializer_class = S.GrowthSerializer
    audit = 'GROWTH'

    @action(detail=False, methods=['get'])
    def pdf(self, request):
        rows = [[g.get_area_display(), g.growth_objective, g.target_quarter, g.milestone_actions,
                 'Achieved' if g.is_completed else 'In progress', g.mentor_notes] for g in self.get_queryset()]
        return build_pdf(f'CUTAS_Growth_Plan_{request.user.username}.pdf', 'Scholarly Growth & Competency Plan', _name(request.user),
                         [{'table': {'headers': ['Area', 'Objective', 'Target', 'Milestones', 'Status', 'Mentor notes'], 'rows': rows}}])


class AwardViewSet(OwnedViewSet):
    queryset = Award.objects.all()
    serializer_class = S.AwardSerializer
    audit = 'AWARD'

    @action(detail=False, methods=['get'])
    def pdf(self, request):
        rows = [[a.year, a.title, a.awarding_body, a.description] for a in self.get_queryset()]
        return build_pdf(f'CUTAS_Awards_{request.user.username}.pdf', 'Scholarly Honours & Awards', _name(request.user),
                         [{'table': {'headers': ['Year', 'Award', 'Conferred by', 'Description'], 'rows': rows}}])


class StudyView(APIView):
    def _obj(self, request):
        obj, _ = StudyDetails.objects.get_or_create(user=request.user, defaults={
            'programme': 'Postgraduate Degree', 'supervisor': 'To be updated',
            'research_topic': 'Research Topic', 'research_abstract': 'Abstract in formulation'})
        return obj

    def get(self, request):
        return Response(S.StudyDetailsSerializer(self._obj(request)).data)

    def patch(self, request):
        ser = S.StudyDetailsSerializer(self._obj(request), data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        record(request, 'STUDY_UPDATE')
        return Response(ser.data)

    put = patch


class StudyPdfView(APIView):
    def get(self, request):
        s = get_object_or_404(StudyDetails, user=request.user)
        return build_pdf(f'CUTAS_Study_Details_{request.user.username}.pdf', 'Official Postgraduate Study Dossier',
                         f'{_name(request.user)} ({request.user.username})', [
            {'fields': [('Programme', s.programme), ('University', s.university),
                        ('Commencement', s.year_of_starting), ('Anticipated completion', s.anticipated_year_of_completion),
                        ('Supervisor', s.supervisor), ('Co-supervisor', s.co_supervisor), ('Funding', s.funding)]},
            {'heading': 'Research Topic', 'text': s.research_topic},
            {'heading': 'Research Abstract', 'text': s.research_abstract}])


# ================================================================ CHALLENGES
class ChallengeViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Scholars: own challenges only. Admins: ?scope=all to see everyone's, and PATCH .../review."""
    serializer_class = S.ChallengeSerializer
    queryset = Challenge.objects.select_related('user', 'user__profile', 'resolved_by')
    pagination_class = None

    def _all(self):
        u = self.request.user
        return u.is_cut_admin and self.request.query_params.get('scope') == 'all'

    def get_queryset(self):
        qs = self.queryset
        if not self._all() and not (self.action == 'retrieve' and self.request.user.is_cut_admin):
            qs = qs.filter(user=self.request.user)
        st = self.request.query_params.get('status')
        if st in Challenge.Status.values:
            qs = qs.filter(status=st)
        return qs

    def perform_create(self, ser):
        ch = ser.save(user=self.request.user, status=Challenge.Status.OPEN)
        record(self.request, 'CHALLENGE_SUBMIT', target=f'Challenge #{ch.id}', details=ch.title)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole])
    def review(self, request, pk=None):
        ch = get_object_or_404(Challenge, pk=pk)
        ser = S.ChallengeReviewSerializer(ch, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ch = ser.save()
        if ch.status == Challenge.Status.RESOLVED and not ch.resolved_at:
            ch.resolved_at, ch.resolved_by = timezone.now(), request.user
            ch.save(update_fields=['resolved_at', 'resolved_by'])
        elif ch.status != Challenge.Status.RESOLVED:
            ch.resolved_at = None
            ch.save(update_fields=['resolved_at'])
        record(request, 'CHALLENGE_REVIEW', target=f'Challenge #{ch.id}', details=f'Status -> {ch.status}')
        return Response(S.ChallengeSerializer(ch).data)

    @action(detail=False, methods=['get'])
    def pdf(self, request):
        own = Challenge.objects.filter(user=request.user)
        rows = [[f'#{c.id}', c.get_category_display(), c.title + '\n' + c.description, c.get_status_display(),
                 c.resolution_notes or 'Pending review'] for c in own]
        return build_pdf(f'CUTAS_Challenges_{request.user.username}.pdf', 'Research Challenges & Resolution Log', _name(request.user),
                         [{'table': {'headers': ['Ref', 'Category', 'Challenge', 'Status', 'Resolution'], 'rows': rows}}])


class MentorNoteView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        g = get_object_or_404(GrowthSuggestion, pk=pk)
        ser = S.MentorNoteSerializer(g, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        record(request, 'GROWTH_MENTOR_NOTE', target=pk)
        return Response(ser.data)


# ================================================================ ADMIN-MANAGED CONTENT
class AdminManagedViewSet(viewsets.ModelViewSet):
    permission_classes = [PublicReadAdminWrite]
    pagination_class = None
    audit = 'ITEM'

    def get_queryset(self):
        qs = self.queryset.all()
        u = self.request.user
        if not (u.is_authenticated and u.is_cut_admin):
            qs = qs.filter(status=PublishStatus.PUBLISHED)
        return qs

    def perform_create(self, ser):
        o = ser.save(created_by=self.request.user)
        record(self.request, f'{self.audit}_CREATE', target=o.pk, details=getattr(o, 'title', ''))

    def perform_update(self, ser):
        o = ser.save()
        record(self.request, f'{self.audit}_EDIT', target=o.pk, details=getattr(o, 'title', ''))

    def perform_destroy(self, o):
        record(self.request, f'{self.audit}_DELETE', target=o.pk, details=getattr(o, 'title', ''))
        o.delete()


class FundingViewSet(AdminManagedViewSet):
    queryset = FundingOpportunity.objects.all()
    serializer_class = S.FundingSerializer
    audit = 'FUNDING'

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        if not (u.is_authenticated and u.is_cut_admin):
            qs = qs.filter(is_active=True)
        return qs


class WorkshopViewSet(AdminManagedViewSet):
    queryset = Workshop.objects.all()
    serializer_class = S.WorkshopSerializer
    audit = 'WORKSHOP'

    def get_queryset(self):
        qs = super().get_queryset()
        when = self.request.query_params.get('when')
        today = timezone.localdate()
        if when == 'upcoming':
            qs = qs.filter(event_date__gte=today)
        elif when == 'past':
            qs = qs.filter(event_date__lt=today).order_by('-event_date')
        return qs


class ContentView(APIView):
    permission_classes = [PublicReadAdminWrite]
    KEYS = ('about_us', 'project_leaders', 'landing_intro')

    def _get(self, key):
        if key not in self.KEYS:
            raise Http404
        return get_object_or_404(InstitutionalContent, key=key)

    def get(self, request, key):
        c = self._get(key)
        u = request.user
        if c.status != PublishStatus.PUBLISHED and not (u.is_authenticated and u.is_cut_admin):
            raise Http404
        return Response(S.ContentSerializer(c).data)

    def put(self, request, key):
        if key not in self.KEYS:
            raise Http404
        c = InstitutionalContent.objects.filter(key=key).first() or InstitutionalContent(key=key)
        ser = S.ContentSerializer(c, data=request.data, partial=c.pk is not None)
        ser.is_valid(raise_exception=True)
        ser.save(last_updated_by=request.user)
        record(request, 'CONTENT_EDIT', target=key)
        return Response(ser.data)

    patch = put


@api_view(['GET'])
@permission_classes([AllowAny])
def landing(request):
    today = timezone.localdate()
    pub = PublishStatus.PUBLISHED
    intro = InstitutionalContent.objects.filter(key='landing_intro', status=pub).first()
    return Response({
        'society': 'Central University of Technology Academic Society',
        'theme': 'Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs',
        'intro': S.ContentSerializer(intro).data if intro else None,
        'stats': {
            'scholars': ScholarProfile.objects.filter(user__role=User.Role.SCHOLAR).count(),
            'publications': Publication.objects.count(),
            'resolved_challenges': Challenge.objects.filter(status=Challenge.Status.RESOLVED).count(),
            'active_funding_calls': FundingOpportunity.objects.filter(is_active=True, status=pub).count(),
        },
        'featured_funding': S.FundingSerializer(
            FundingOpportunity.objects.filter(is_active=True, featured_on_landing=True, status=pub)[:4], many=True).data,
        'upcoming_workshops': S.WorkshopSerializer(
            Workshop.objects.filter(event_date__gte=today, status=pub)[:3], many=True).data,
    })


# ================================================================ ADMIN CONSOLE
class AdminScholarCategoryView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        prof = get_object_or_404(ScholarProfile, user_id=pk, user__role=User.Role.SCHOLAR)
        ser = S.CategoryAssignSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        old = prof.category
        prof.category = ser.validated_data['category']
        prof.save(update_fields=['category', 'updated_at'])
        record(request, 'SCHOLAR_CATEGORY_CHANGE', target=prof.user.username, details=f'{old} -> {prof.category}')
        return Response({'id': pk, 'category': prof.category})


class AdminUserViewSet(viewsets.ModelViewSet):
    """Super admin only: create administrators, change roles, deactivate accounts."""
    permission_classes = [IsSuperAdmin]
    serializer_class = S.AdminUserSerializer
    queryset = User.objects.all().order_by('id')
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def perform_create(self, ser):
        u = ser.save()
        record(self.request, 'USER_CREATE', target=u.username, details=f'role={u.role}')

    def perform_update(self, ser):
        # a super admin cannot lock themselves out
        if ser.instance.pk == self.request.user.pk and (
                ser.validated_data.get('is_active') is False or
                ser.validated_data.get('role', ser.instance.role) != ser.instance.role):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You cannot deactivate or change the role of your own account.')
        u = ser.save()
        record(self.request, 'USER_UPDATE', target=u.username, details=f'role={u.role} active={u.is_active}')


def _annual_data(year):
    qs = Challenge.objects.filter(created_at__year=year)
    breakdown = []
    for row in qs.values('category').annotate(
            total=Count('id'), open=Count('id', filter=Q(status='OPEN')),
            in_review=Count('id', filter=Q(status='IN_REVIEW')), resolved=Count('id', filter=Q(status='RESOLVED'))):
        row['label'] = dict(Challenge.Category.choices).get(row['category'], row['category'])
        row['resolution_rate'] = round(row['resolved'] / row['total'] * 100, 1) if row['total'] else 0
        breakdown.append(row)
    resolved = [{'id': c.id, 'category': c.get_category_display(), 'title': c.title,
                 'scholar': _name(c.user), 'resolution_notes': c.resolution_notes,
                 'resolved_at': c.resolved_at} for c in qs.filter(status='RESOLVED').select_related('user')]
    return {'year': year, 'total': qs.count(), 'breakdown': breakdown, 'resolved_items': resolved}


def _year(request):
    try:
        y = int(request.query_params.get('year', datetime.now().year))
        if not 2000 <= y <= 2100:
            raise ValueError
        return y
    except ValueError:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({'year': 'Enter a valid year.'})


class AnnualReportView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        return Response(_annual_data(_year(request)))


class AnnualReportPdfView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        d = _annual_data(_year(request))
        record(request, 'REPORT_EXPORT', details=f"Annual challenges report {d['year']}")
        return build_pdf(f"CUTAS_Annual_Challenges_Report_{d['year']}.pdf",
                         f"Annual Report: Research Challenges & Resolutions ({d['year']})",
                         'Prepared for the Directorate of Research Development and Postgraduate Studies, CUT', [
            {'heading': 'Category breakdown', 'table': {
                'headers': ['Category', 'Total', 'Open', 'In review', 'Resolved', 'Rate'],
                'rows': [[b['label'], b['total'], b['open'], b['in_review'], b['resolved'], f"{b['resolution_rate']}%"]
                         for b in d['breakdown']]}},
            {'heading': 'Resolved items and interventions', 'table': {
                'headers': ['Ref', 'Category', 'Challenge', 'Resolution'],
                'rows': [[f"#{r['id']}", r['category'], r['title'], r['resolution_notes']] for r in d['resolved_items']]}}])


class AuditLogView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = AuditLog.objects.all()
        if a := request.query_params.get('action'):
            qs = qs.filter(action=a)
        if u := request.query_params.get('actor'):
            qs = qs.filter(actor_username=u)
        limit = min(int(request.query_params.get('limit', 100) or 100), 500)
        return Response(S.AuditLogSerializer(qs[:limit], many=True).data)


class ExportView(APIView):
    """Super admin data retrieval. Password hashes are never included."""
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        record(request, 'DATA_EXPORT', details='Full database JSON export')
        v = lambda m, *f: list(m.objects.values(*f))
        return Response({
            'export_timestamp': timezone.now().isoformat(),
            'users': v(User, 'id', 'username', 'email', 'role', 'first_name', 'last_name', 'is_active', 'date_joined'),
            'profiles': v(ScholarProfile, 'user__username', 'title', 'category', 'student_number', 'faculty', 'department', 'bio', 'cv_summary_text'),
            'study_details': v(StudyDetails, 'user__username', 'programme', 'university', 'year_of_starting',
                               'anticipated_year_of_completion', 'supervisor', 'co_supervisor', 'funding', 'research_topic', 'research_abstract'),
            'publications': v(Publication, 'user__username', 'publication_type', 'title', 'authors', 'outlet_name', 'year', 'volume_issue_pages', 'doi_or_url', 'status'),
            'challenges': v(Challenge, 'id', 'user__username', 'category', 'title', 'description', 'status', 'resolution_notes', 'created_at', 'resolved_at'),
            'growth': v(GrowthSuggestion, 'user__username', 'area', 'growth_objective', 'milestone_actions', 'target_quarter', 'mentor_notes', 'is_completed'),
            'awards': v(Award, 'user__username', 'title', 'awarding_body', 'year', 'description'),
            'funding': v(FundingOpportunity, 'title', 'funder', 'amount_range', 'deadline', 'eligibility', 'application_process', 'portal_url', 'is_active', 'status'),
            'workshops': v(Workshop, 'title', 'facilitator', 'event_date', 'event_time', 'venue_or_link', 'category', 'status'),
            'content': v(InstitutionalContent, 'key', 'title', 'headline', 'body', 'status'),
            'audit_logs': v(AuditLog, 'timestamp', 'action', 'actor_username', 'actor_role', 'target_object', 'details', 'ip_address'),
        })
