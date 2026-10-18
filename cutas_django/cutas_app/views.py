import io
from datetime import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden, Http404, JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from django.db.models import Count, Q
from django.utils import timezone
from django.core.serializers import serialize

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from .models import (
    User, ScholarProfile, StudyDetails, Publication, Challenge,
    GrowthSuggestion, FundingOpportunity, Award, Workshop,
    InstitutionalContent, AuditLog
)
from .forms import (
    ScholarRegistrationForm, ScholarProfileForm, StudyDetailsForm,
    PublicationForm, ChallengeForm, ChallengeResolutionForm,
    GrowthSuggestionForm, AwardForm, FundingOpportunityForm,
    WorkshopForm, InstitutionalContentForm, AccountDeletionForm
)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

def record_audit(action, actor_username, actor_role, details="", target="", request=None):
    ip = get_client_ip(request) if request else None
    AuditLog.objects.create(
        action=action,
        actor_username=actor_username,
        actor_role=actor_role,
        target_object=target,
        details=details,
        ip_address=ip
    )

def admin_required(view_func):
    """Enforce Administrator or Super Administrator role."""
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('cutas:login')
        if not (request.user.is_cut_admin or request.user.is_superuser):
            messages.error(request, "Access denied. Administrative privileges required.")
            return redirect('cutas:landing')
        return view_func(request, *args, **kwargs)
    return _wrapped


# ---------------------------------------------------------------------------
# LANDING & INSTITUTIONAL VIEWS
# ---------------------------------------------------------------------------

def landing_view(request):
    featured_funding = FundingOpportunity.objects.filter(is_active=True, featured_on_landing=True)[:4]
    upcoming_workshops = Workshop.objects.filter(event_date__gte=timezone.now().date())[:3]
    intro = InstitutionalContent.objects.filter(key='landing_intro').first()
    
    # Statistical highlights for the portal
    stats = {
        'scholars_count': ScholarProfile.objects.count(),
        'publications_count': Publication.objects.count(),
        'resolved_challenges': Challenge.objects.filter(status=Challenge.Status.RESOLVED).count(),
        'funding_opps_count': FundingOpportunity.objects.filter(is_active=True).count(),
    }
    
    return render(request, 'cutas_app/landing.html', {
        'featured_funding': featured_funding,
        'upcoming_workshops': upcoming_workshops,
        'intro': intro,
        'stats': stats,
    })


def about_view(request):
    about_content = InstitutionalContent.objects.filter(key='about_us').first()
    if not about_content:
        about_content = InstitutionalContent.objects.create(
            key='about_us',
            title='About CUT Academic Society',
            headline='Advancing Intellectual Inquiry and Scholarly Rigor across Universities of Technology',
            body='The Central University of Technology Academic Society (CUTAS) was founded to revitalize rigorous intellectual culture, interdisciplinary inquiry, and scholarly publication output among postgraduate scholars. Operating across the Bloemfontein and Welkom campuses, the society champions scholar-led development, peer mentorship, research ethics, and national grant competitiveness.'
        )
    return render(request, 'cutas_app/about.html', {'content': about_content})


def leaders_view(request):
    leaders_content = InstitutionalContent.objects.filter(key='project_leaders').first()
    if not leaders_content:
        leaders_content = InstitutionalContent.objects.create(
            key='project_leaders',
            title='Project Leaders & Society Executive',
            headline='Academic Stewards and Research Mentors',
            body='CUTAS is governed by experienced academic leads, research directors, and student advisory committee chairs committed to nurturing postgraduate excellence.'
        )
    admin_users = User.objects.filter(
        Q(role=User.Role.ADMINISTRATOR) | Q(role=User.Role.SUPER_ADMIN)
    ).select_related('profile')
    return render(request, 'cutas_app/leaders.html', {
        'content': leaders_content,
        'administrators': admin_users
    })


# ---------------------------------------------------------------------------
# AUTHENTICATION & ACCOUNT VIEWS
# ---------------------------------------------------------------------------

def login_view(request):
    if request.user.is_authenticated:
        return redirect('cutas:landing')
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            record_audit('LOGIN', user.username, user.get_role_display(), "Successful credential login", request=request)
            messages.success(request, f"Welcome back, {user.get_full_name() or user.username}!")
            return redirect('cutas:landing')
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, 'cutas_app/auth/login.html', {'form': form})


def register_view(request):
    if request.user.is_authenticated:
        return redirect('cutas:landing')
    if request.method == 'POST':
        form = ScholarRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            record_audit('REGISTER', user.username, 'Scholar', "Registered postgraduate scholar", request=request)
            messages.success(request, "Account created successfully. Welcome to CUTAS!")
            return redirect('cutas:study_details')
    else:
        form = ScholarRegistrationForm()
    return render(request, 'cutas_app/auth/register.html', {'form': form})


@login_required
def logout_view(request):
    record_audit('LOGOUT', request.user.username, request.user.get_role_display(), "User logged out", request=request)
    logout(request)
    messages.info(request, "You have been logged out of the CUTAS portal.")
    return redirect('cutas:landing')


@login_required
def password_change_view(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            record_audit('PASSWORD_CHANGE', user.username, user.get_role_display(), "Password updated", request=request)
            messages.success(request, "Your password was successfully updated!")
            return redirect('cutas:landing')
        else:
            messages.error(request, "Please correct the error below.")
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'cutas_app/auth/change_password.html', {'form': form})


@login_required
def delete_account_view(request):
    """Scholars can permanently delete their own account and all data with confirmation."""
    if request.user.is_superuser or request.user.is_cut_admin:
        messages.warning(request, "Administrative accounts cannot be self-deleted via this interface. Contact lead systems engineer.")
        return redirect('cutas:landing')

    if request.method == 'POST':
        form = AccountDeletionForm(request.POST)
        if form.is_valid():
            username = request.user.username
            record_audit('ACCOUNT_DELETED', username, 'Scholar', "Scholar initiated full account and record purge", request=request)
            request.user.delete()
            logout(request)
            messages.success(request, "Your CUTAS account and associated records have been permanently deleted.")
            return redirect('cutas:landing')
    else:
        form = AccountDeletionForm()
    return render(request, 'cutas_app/auth/delete_account.html', {'form': form})


# ---------------------------------------------------------------------------
# TAB 3: SCHOLARS DIRECTORY (A, B, C) & PROTECTED CV VIEWER
# ---------------------------------------------------------------------------

@login_required
def scholars_list_view(request):
    category_filter = request.GET.get('category', 'ALL')
    profiles = ScholarProfile.objects.select_related('user').all()
    if category_filter in ['CAT_A', 'CAT_B', 'CAT_C']:
        profiles = profiles.filter(category=category_filter)
    
    cat_a = ScholarProfile.objects.filter(category='CAT_A')
    cat_b = ScholarProfile.objects.filter(category='CAT_B')
    cat_c = ScholarProfile.objects.filter(category='CAT_C')
    
    return render(request, 'cutas_app/scholars.html', {
        'profiles': profiles,
        'current_category': category_filter,
        'cat_a_count': cat_a.count(),
        'cat_b_count': cat_b.count(),
        'cat_c_count': cat_c.count(),
    })


@login_required
def view_scholar_cv(request, profile_id):
    """
    Renders CV content in an in-portal viewer strictly for authenticated users.
    No direct download link is served to prevent unauthorized distribution.
    """
    profile = get_object_or_404(ScholarProfile, id=profile_id)
    return render(request, 'cutas_app/profile_cv_view.html', {
        'scholar': profile,
    })


@login_required
def update_profile_view(request):
    profile, _ = ScholarProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        form = ScholarProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Scholar profile updated successfully.")
            return redirect('cutas:scholars_list')
    else:
        form = ScholarProfileForm(instance=profile)
    return render(request, 'cutas_app/profile_edit.html', {'form': form})


# ---------------------------------------------------------------------------
# TAB 4: DETAILS ON YOUR STUDIES & PDF
# ---------------------------------------------------------------------------

@login_required
def study_details_view(request):
    study_details, _ = StudyDetails.objects.get_or_create(
        user=request.user,
        defaults={
            'programme': 'Doctor / Master of Technology',
            'supervisor': 'Central University of Technology Supervisor',
            'research_topic': 'Intellectual Investigation in Higher Education',
            'research_abstract': 'Scholarly overview of postgraduate research.'
        }
    )
    if request.method == 'POST':
        form = StudyDetailsForm(request.POST, instance=study_details)
        if form.is_valid():
            form.save()
            messages.success(request, "Your study details have been updated successfully.")
            return redirect('cutas:study_details')
    else:
        form = StudyDetailsForm(instance=study_details)
    
    return render(request, 'cutas_app/study_details.html', {
        'study': study_details,
        'form': form
    })


@login_required
def study_details_pdf(request):
    study = get_object_or_404(StudyDetails, user=request.user)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    navy_color = colors.HexColor('#003261')
    gold_color = colors.HexColor('#FBB927')
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=navy_color,
        spaceAfter=6
    )
    sub_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )
    section_head = ParagraphStyle(
        'SecHead',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=navy_color,
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle('DocBody', parent=styles['Normal'], fontSize=10, leading=14)
    
    story = [
        Paragraph("<b>CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY</b>", title_style),
        Paragraph("Official Postgraduate Study Dossier · Generated on " + datetime.now().strftime("%d %B %Y"), sub_style),
        HRFlowable(width="100%", thickness=2, color=gold_color, spaceBefore=8, spaceAfter=14),
        Paragraph(f"<b>Scholar:</b> {request.user.get_full_name()} ({request.user.username})", body_style),
        Paragraph(f"<b>Programme:</b> {study.programme}", body_style),
        Paragraph(f"<b>University:</b> {study.university}", body_style),
        Paragraph(f"<b>Commencement:</b> {study.year_of_starting} · <b>Anticipated Completion:</b> {study.anticipated_year_of_completion}", body_style),
        Paragraph(f"<b>Supervisor(s):</b> {study.supervisor}" + (f" | Co-Supervisor: {study.co_supervisor}" if study.co_supervisor else ""), body_style),
        Paragraph(f"<b>Funding Mechanism:</b> {study.funding}", body_style),
        Spacer(1, 12),
        Paragraph("<b>Research Topic:</b>", section_head),
        Paragraph(study.research_topic, body_style),
        Spacer(1, 8),
        Paragraph("<b>Research Abstract & Methodological Outline:</b>", section_head),
        Paragraph(study.research_abstract.replace('\n', '<br/>'), body_style),
        Spacer(1, 20),
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceBefore=10, spaceAfter=8),
        Paragraph("<i>CUTAS Academic Verification Stamp · Central University of Technology Free State</i>", sub_style),
    ]
    doc.build(story)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="CUTAS_Study_Details_{request.user.username}.pdf"'
    return response


# ---------------------------------------------------------------------------
# TAB 5: PUBLICATION RECORD & PDF
# ---------------------------------------------------------------------------

@login_required
def publications_view(request):
    publications = Publication.objects.filter(user=request.user)
    if request.method == 'POST':
        form = PublicationForm(request.POST)
        if form.is_valid():
            pub = form.save(commit=False)
            pub.user = request.user
            pub.save()
            messages.success(request, "Publication added to your scholarly dossier.")
            return redirect('cutas:publications')
    else:
        form = PublicationForm()
    return render(request, 'cutas_app/publications.html', {
        'publications': publications,
        'form': form
    })


@login_required
def edit_publication_view(request, pub_id):
    pub = get_object_or_404(Publication, id=pub_id, user=request.user)
    if request.method == 'POST':
        form = PublicationForm(request.POST, instance=pub)
        if form.is_valid():
            form.save()
            messages.success(request, "Publication updated.")
            return redirect('cutas:publications')
    else:
        form = PublicationForm(instance=pub)
    return render(request, 'cutas_app/publication_edit.html', {'form': form, 'publication': pub})


@login_required
def delete_publication_view(request, pub_id):
    pub = get_object_or_404(Publication, id=pub_id, user=request.user)
    if request.method == 'POST':
        pub.delete()
        messages.success(request, "Publication removed from dossier.")
    return redirect('cutas:publications')


@login_required
def publications_pdf(request):
    publications = Publication.objects.filter(user=request.user)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    navy = colors.HexColor('#003261')
    gold = colors.HexColor('#FBB927')

    story = [
        Paragraph("<b>CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY</b>", ParagraphStyle('H1', parent=styles['Heading1'], fontSize=16, textColor=navy)),
        Paragraph(f"Official Publication Record for {request.user.get_full_name()} · Generated {datetime.now().strftime('%d %B %Y')}", ParagraphStyle('sub', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#64748b'))),
        HRFlowable(width="100%", thickness=2, color=gold, spaceBefore=6, spaceAfter=14),
    ]

    if not publications.exists():
        story.append(Paragraph("No publications currently recorded.", styles['Normal']))
    else:
        data = [["#", "Type", "Title / Authors", "Outlet", "Year", "Status"]]
        for i, p in enumerate(publications, 1):
            data.append([
                str(i),
                p.get_publication_type_display(),
                Paragraph(f"<b>{p.title}</b><br/><font color='#475569'>{p.authors}</font>", styles['Normal']),
                p.outlet_name,
                str(p.year),
                p.get_status_display()
            ])
        t = Table(data, colWidths=[20, 80, 220, 100, 40, 60])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), navy),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(t)

    doc.build(story)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="CUTAS_Publications_{request.user.username}.pdf"'
    return response


# ---------------------------------------------------------------------------
# TAB 6: CHALLENGES & SOLUTIONS (SCHOLAR & ADMIN LIFECYCLE) & PDF
# ---------------------------------------------------------------------------

@login_required
def challenges_view(request):
    # Scholar sees only their own challenges
    user_challenges = Challenge.objects.filter(user=request.user)
    if request.method == 'POST':
        form = ChallengeForm(request.POST)
        if form.is_valid():
            ch = form.save(commit=False)
            ch.user = request.user
            ch.status = Challenge.Status.OPEN
            ch.save()
            record_audit('CHALLENGE_SUBMIT', request.user.username, 'Scholar', f"Submitted: {ch.title}", target=f"Challenge #{ch.id}", request=request)
            messages.success(request, "Research problem submitted. Society administrators and mentors have been notified.")
            return redirect('cutas:challenges')
    else:
        form = ChallengeForm()

    return render(request, 'cutas_app/challenges.html', {
        'challenges': user_challenges,
        'form': form
    })


@login_required
@admin_required
def review_challenge_view(request, challenge_id):
    challenge = get_object_or_404(Challenge, id=challenge_id)
    if request.method == 'POST':
        form = ChallengeResolutionForm(request.POST, instance=challenge)
        if form.is_valid():
            ch = form.save(commit=False)
            if ch.status == Challenge.Status.RESOLVED and not ch.resolved_at:
                ch.resolved_at = timezone.now()
                ch.resolved_by = request.user
            ch.save()
            record_audit('CHALLENGE_REVIEW', request.user.username, request.user.get_role_display(), f"Status changed to {ch.status}. Notes added.", target=f"Challenge #{ch.id}", request=request)
            messages.success(request, f"Challenge #{challenge.id} updated with status: {challenge.get_status_display()}.")
            return redirect('cutas:admin_dashboard')
    else:
        form = ChallengeResolutionForm(instance=challenge)
    return render(request, 'cutas_app/challenge_review.html', {
        'challenge': challenge,
        'form': form
    })


@login_required
def challenges_pdf(request):
    challenges = Challenge.objects.filter(user=request.user)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    navy = colors.HexColor('#003261')
    gold = colors.HexColor('#FBB927')

    story = [
        Paragraph("<b>CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY</b>", ParagraphStyle('H1', parent=styles['Heading1'], fontSize=16, textColor=navy)),
        Paragraph(f"Research Challenges & Resolution Log for {request.user.get_full_name()} · Generated {datetime.now().strftime('%d %B %Y')}", styles['Normal']),
        HRFlowable(width="100%", thickness=2, color=gold, spaceBefore=6, spaceAfter=14),
    ]

    for ch in challenges:
        story.append(Paragraph(f"<b>[{ch.get_status_display().upper()}] {ch.title}</b>", ParagraphStyle('title', parent=styles['Heading2'], fontSize=12, textColor=navy)))
        story.append(Paragraph(f"<b>Category:</b> {ch.get_category_display()} · <b>Submitted:</b> {ch.created_at.strftime('%d %b %Y')}", styles['Normal']))
        story.append(Paragraph(f"<b>Problem Description:</b> {ch.description}", styles['Normal']))
        if ch.resolution_notes:
            story.append(Paragraph(f"<b>Resolution / Intervention:</b> <font color='#166534'>{ch.resolution_notes}</font>", styles['Normal']))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceBefore=4, spaceAfter=8))

    doc.build(story)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="CUTAS_Challenges_{request.user.username}.pdf"'
    return response


# ---------------------------------------------------------------------------
# TAB 7: SUGGESTIONS FOR YOUR GROWTH & PDF
# ---------------------------------------------------------------------------

@login_required
def growth_view(request):
    suggestions = GrowthSuggestion.objects.filter(user=request.user)
    if request.method == 'POST':
        form = GrowthSuggestionForm(request.POST)
        if form.is_valid():
            g = form.save(commit=False)
            g.user = request.user
            g.save()
            messages.success(request, "Growth target recorded.")
            return redirect('cutas:growth')
    else:
        form = GrowthSuggestionForm()
    return render(request, 'cutas_app/growth.html', {
        'suggestions': suggestions,
        'form': form
    })


@login_required
def growth_pdf(request):
    suggestions = GrowthSuggestion.objects.filter(user=request.user)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    navy = colors.HexColor('#003261')
    gold = colors.HexColor('#FBB927')

    story = [
        Paragraph("<b>CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY</b>", ParagraphStyle('H1', parent=styles['Heading1'], fontSize=16, textColor=navy)),
        Paragraph(f"Personal Scholarly Growth & Competency Plan: {request.user.get_full_name()}", styles['Normal']),
        HRFlowable(width="100%", thickness=2, color=gold, spaceBefore=6, spaceAfter=14),
    ]

    for s in suggestions:
        story.append(Paragraph(f"<b>{s.growth_objective}</b> ({s.get_area_display()})", ParagraphStyle('t', parent=styles['Heading2'], fontSize=12, textColor=navy)))
        story.append(Paragraph(f"Target Timeline: {s.target_quarter} · Status: {'Achieved' if s.is_completed else 'Active'}", styles['Normal']))
        story.append(Paragraph(f"<b>Milestone Steps:</b> {s.milestone_actions}", styles['Normal']))
        if s.mentor_notes:
            story.append(Paragraph(f"<b>Mentor Notes:</b> {s.mentor_notes}", styles['Normal']))
        story.append(Spacer(1, 10))

    doc.build(story)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="CUTAS_Growth_Plan_{request.user.username}.pdf"'
    return response


# ---------------------------------------------------------------------------
# TAB 8: FUNDING AVAILABLE & APPLICATION PROCESSES (ADMIN EDITED)
# ---------------------------------------------------------------------------

def funding_view(request):
    opportunities = FundingOpportunity.objects.filter(is_active=True)
    return render(request, 'cutas_app/funding.html', {
        'opportunities': opportunities
    })


@login_required
@admin_required
def add_funding_view(request):
    if request.method == 'POST':
        form = FundingOpportunityForm(request.POST)
        if form.is_valid():
            f = form.save(commit=False)
            f.created_by = request.user
            f.save()
            record_audit('FUNDING_CREATE', request.user.username, request.user.get_role_display(), f"Created funding: {f.title}", request=request)
            messages.success(request, "Funding opportunity published.")
            return redirect('cutas:funding')
    else:
        form = FundingOpportunityForm()
    return render(request, 'cutas_app/funding_edit.html', {'form': form, 'title': 'Publish New Funding Opportunity'})


@login_required
@admin_required
def edit_funding_view(request, funding_id):
    funding = get_object_or_404(FundingOpportunity, id=funding_id)
    if request.method == 'POST':
        form = FundingOpportunityForm(request.POST, instance=funding)
        if form.is_valid():
            form.save()
            messages.success(request, "Funding opportunity updated.")
            return redirect('cutas:funding')
    else:
        form = FundingOpportunityForm(instance=funding)
    return render(request, 'cutas_app/funding_edit.html', {'form': form, 'title': f'Edit Funding: {funding.title}'})


# ---------------------------------------------------------------------------
# TAB 9: AWARDS & RECOGNITIONS & PDF
# ---------------------------------------------------------------------------

@login_required
def awards_view(request):
    awards = Award.objects.filter(user=request.user)
    if request.method == 'POST':
        form = AwardForm(request.POST)
        if form.is_valid():
            a = form.save(commit=False)
            a.user = request.user
            a.save()
            messages.success(request, "Award added to your scholarly record.")
            return redirect('cutas:awards')
    else:
        form = AwardForm()
    return render(request, 'cutas_app/awards.html', {
        'awards': awards,
        'form': form
    })


@login_required
def awards_pdf(request):
    awards = Award.objects.filter(user=request.user)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    navy = colors.HexColor('#003261')
    gold = colors.HexColor('#FBB927')

    story = [
        Paragraph("<b>CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY</b>", ParagraphStyle('H1', parent=styles['Heading1'], fontSize=16, textColor=navy)),
        Paragraph(f"Scholarly Honors & Awards: {request.user.get_full_name()} · Generated {datetime.now().strftime('%d %B %Y')}", styles['Normal']),
        HRFlowable(width="100%", thickness=2, color=gold, spaceBefore=6, spaceAfter=14),
    ]

    for a in awards:
        story.append(Paragraph(f"<b>{a.title} ({a.year})</b>", ParagraphStyle('h', parent=styles['Heading2'], fontSize=12, textColor=navy)))
        story.append(Paragraph(f"Conferred by: <i>{a.awarding_body}</i>", styles['Normal']))
        if a.description:
            story.append(Paragraph(a.description, styles['Normal']))
        story.append(Spacer(1, 8))

    doc.build(story)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="CUTAS_Awards_{request.user.username}.pdf"'
    return response


# ---------------------------------------------------------------------------
# TAB 10: UPCOMING WORKSHOPS & SEMINARS (ADMIN EDITED)
# ---------------------------------------------------------------------------

def workshops_view(request):
    upcoming = Workshop.objects.filter(event_date__gte=timezone.now().date()).order_by('event_date', 'event_time')
    past = Workshop.objects.filter(event_date__lt=timezone.now().date()).order_by('-event_date')
    return render(request, 'cutas_app/workshops.html', {
        'upcoming_workshops': upcoming,
        'past_workshops': past,
    })


@login_required
@admin_required
def add_workshop_view(request):
    if request.method == 'POST':
        form = WorkshopForm(request.POST)
        if form.is_valid():
            w = form.save(commit=False)
            w.created_by = request.user
            w.save()
            record_audit('WORKSHOP_CREATE', request.user.username, request.user.get_role_display(), f"Created workshop: {w.title}", request=request)
            messages.success(request, "Workshop scheduled and published.")
            return redirect('cutas:workshops')
    else:
        form = WorkshopForm()
    return render(request, 'cutas_app/workshop_edit.html', {'form': form, 'title': 'Schedule New Academic Workshop'})


@login_required
@admin_required
def edit_workshop_view(request, workshop_id):
    workshop = get_object_or_404(Workshop, id=workshop_id)
    if request.method == 'POST':
        form = WorkshopForm(request.POST, instance=workshop)
        if form.is_valid():
            form.save()
            messages.success(request, "Workshop updated.")
            return redirect('cutas:workshops')
    else:
        form = WorkshopForm(instance=workshop)
    return render(request, 'cutas_app/workshop_edit.html', {'form': form, 'title': f'Edit Workshop: {workshop.title}'})


# ---------------------------------------------------------------------------
# ADMIN DASHBOARD & ANNUAL REPORT
# ---------------------------------------------------------------------------

@login_required
@admin_required
def admin_dashboard_view(request):
    open_challenges = Challenge.objects.filter(status=Challenge.Status.OPEN).select_related('user')
    in_review_challenges = Challenge.objects.filter(status=Challenge.Status.IN_REVIEW).select_related('user')
    resolved_challenges = Challenge.objects.filter(status=Challenge.Status.RESOLVED).select_related('user')[:10]
    
    # Category aggregation for analytics
    category_breakdown = Challenge.objects.values('category').annotate(
        total=Count('id'),
        open_count=Count('id', filter=Q(status=Challenge.Status.OPEN)),
        resolved_count=Count('id', filter=Q(status=Challenge.Status.RESOLVED))
    )

    audit_logs = AuditLog.objects.all()[:20]

    return render(request, 'cutas_app/admin_dashboard.html', {
        'open_challenges': open_challenges,
        'in_review_challenges': in_review_challenges,
        'resolved_challenges': resolved_challenges,
        'category_breakdown': category_breakdown,
        'audit_logs': audit_logs,
        'scholars_count': ScholarProfile.objects.count(),
        'active_funding_count': FundingOpportunity.objects.filter(is_active=True).count(),
        'workshops_count': Workshop.objects.count(),
    })


@login_required
@admin_required
def edit_page_content_view(request, key):
    content = get_object_or_404(InstitutionalContent, key=key)
    if request.method == 'POST':
        form = InstitutionalContentForm(request.POST, instance=content)
        if form.is_valid():
            c = form.save(commit=False)
            c.last_updated_by = request.user
            c.save()
            record_audit('CONTENT_EDIT', request.user.username, request.user.get_role_display(), f"Edited content page: {key}", request=request)
            messages.success(request, f"'{content.title}' content saved successfully.")
            return redirect('cutas:admin_dashboard')
    else:
        form = InstitutionalContentForm(instance=content)
    return render(request, 'cutas_app/content_edit.html', {'form': form, 'content_key': key, 'title': content.title})


@login_required
@admin_required
def annual_challenges_report_pdf(request):
    """
    Generates a yearly report summarising challenges by category and status, exportable as PDF.
    """
    year = request.GET.get('year', datetime.now().year)
    challenges = Challenge.objects.all()
    
    breakdown = Challenge.objects.values('category').annotate(
        total=Count('id'),
        open=Count('id', filter=Q(status=Challenge.Status.OPEN)),
        in_review=Count('id', filter=Q(status=Challenge.Status.IN_REVIEW)),
        resolved=Count('id', filter=Q(status=Challenge.Status.RESOLVED)),
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    navy = colors.HexColor('#003261')
    gold = colors.HexColor('#FBB927')

    story = [
        Paragraph("<b>CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY</b>", ParagraphStyle('H1', parent=styles['Heading1'], fontSize=16, textColor=navy)),
        Paragraph(f"<b>Annual Institutional Report: Postgraduate Research Challenges & Resolutions ({year})</b>", ParagraphStyle('H2', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#334155'))),
        Paragraph("Prepared for: Deanery, Directorate of Research Development and Postgraduate Studies, CUT", styles['Normal']),
        HRFlowable(width="100%", thickness=2, color=gold, spaceBefore=6, spaceAfter=14),
        Paragraph("<b>Executive Summary & Challenge Categorisation</b>", ParagraphStyle('H3', parent=styles['Heading3'], fontSize=11, textColor=navy)),
        Spacer(1, 6),
    ]

    table_data = [["Category", "Total Submitted", "Open", "In Review", "Resolved", "Resolution Rate"]]
    for item in breakdown:
        rate = round((item['resolved'] / item['total'] * 100), 1) if item['total'] else 0
        cat_label = dict(Challenge.Category.choices).get(item['category'], item['category'])
        table_data.append([
            cat_label,
            str(item['total']),
            str(item['open']),
            str(item['in_review']),
            str(item['resolved']),
            f"{rate}%"
        ])

    summary_table = Table(table_data, colWidths=[180, 70, 50, 60, 60, 80])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), navy),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("<b>Recent Interventions & Action Items Recorded</b>", ParagraphStyle('H3', parent=styles['Heading3'], fontSize=11, textColor=navy)))
    for ch in challenges.filter(status=Challenge.Status.RESOLVED)[:6]:
        story.append(Paragraph(f"• <b>{ch.title}</b> ({ch.get_category_display()}) — Resolved: {ch.resolution_notes}", styles['Normal']))

    doc.build(story)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="CUTAS_Annual_Challenges_Report_{year}.pdf"'
    return response


# ---------------------------------------------------------------------------
# SUPER ADMINISTRATOR DATA EXPORT
# ---------------------------------------------------------------------------

@login_required
def export_cutas_data_view(request):
    """Super Administrator data retrieval command / export interface."""
    if not request.user.is_super_administrator:
        return HttpResponseForbidden("Super Administrator privilege required to export data.")

    data = {
        'export_timestamp': timezone.now().isoformat(),
        'users': list(User.objects.values('id', 'username', 'email', 'role', 'first_name', 'last_name')),
        'profiles': list(ScholarProfile.objects.values('user__username', 'category', 'student_number', 'faculty')),
        'study_details': list(StudyDetails.objects.values('user__username', 'programme', 'supervisor', 'funding', 'research_topic')),
        'publications': list(Publication.objects.values('user__username', 'title', 'publication_type', 'outlet_name', 'year', 'status')),
        'challenges': list(Challenge.objects.values('id', 'user__username', 'category', 'title', 'status', 'resolution_notes')),
        'workshops': list(Workshop.objects.values('title', 'event_date', 'event_time', 'venue_or_link', 'facilitator')),
        'funding_opportunities': list(FundingOpportunity.objects.values('title', 'funder', 'amount_range', 'deadline', 'portal_url')),
    }
    return JsonResponse(data, json_dumps_params={'indent': 2})
