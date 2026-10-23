from django.contrib.auth import password_validation
from django.db import transaction
from rest_framework import serializers

from cutas_app.models import (
    Award, AuditLog, Challenge, FundingOpportunity, GrowthSuggestion, InstitutionalContent,
    Publication, ScholarProfile, StudyDetails, User, Workshop,
)

FACULTIES = [
    'Faculty of Engineering, Built Environment & Information Technology',
    'Faculty of Health & Environmental Sciences',
    'Faculty of Management Sciences',
    'Faculty of Humanities',
]


# ---------------------------------------------------------------- auth / users
class RegisterSerializer(serializers.Serializer):
    username = serializers.RegexField(r'^[\w.@+-]+$', max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True)
    student_number = serializers.CharField(max_length=30, required=False, allow_blank=True)
    faculty = serializers.ChoiceField(choices=FACULTIES, default=FACULTIES[0])
    agree_terms = serializers.BooleanField()
    # NOTE: no role / category field on purpose. Role is always SCHOLAR; category is assigned by admins.

    def validate_username(self, v):
        if User.objects.filter(username__iexact=v).exists():
            raise serializers.ValidationError('Username is already registered.')
        return v

    def validate_email(self, v):
        if User.objects.filter(email__iexact=v).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return v

    def validate_agree_terms(self, v):
        if not v:
            raise serializers.ValidationError('You must accept the terms and data policy.')
        return v

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        probe = User(username=data['username'], email=data['email'],
                     first_name=data['first_name'], last_name=data['last_name'])
        try:
            password_validation.validate_password(data['password'], probe)
        except Exception as e:  # DjangoValidationError
            raise serializers.ValidationError({'password': list(getattr(e, 'messages', [str(e)]))})
        return data

    @transaction.atomic
    def create(self, v):
        user = User.objects.create_user(
            username=v['username'], email=v['email'], password=v['password'],
            first_name=v['first_name'], last_name=v['last_name'], role=User.Role.SCHOLAR,
        )
        ScholarProfile.objects.create(user=user, student_number=v.get('student_number', ''), faculty=v['faculty'])
        StudyDetails.objects.create(
            user=user, programme='Postgraduate Degree', supervisor='To be updated',
            research_topic='Research Topic', research_abstract='Abstract in formulation',
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    """Own profile. `category` is read-only: scholars cannot promote themselves."""
    has_picture = serializers.SerializerMethodField()
    has_cv_file = serializers.SerializerMethodField()

    class Meta:
        model = ScholarProfile
        fields = ['title', 'category', 'student_number', 'faculty', 'department', 'bio',
                  'cv_summary_text', 'phone_number', 'profile_picture', 'cv_file',
                  'has_picture', 'has_cv_file', 'updated_at']
        read_only_fields = ['category', 'updated_at']
        extra_kwargs = {'profile_picture': {'write_only': True, 'required': False},
                        'cv_file': {'write_only': True, 'required': False}}

    def get_has_picture(self, o):
        return bool(o.profile_picture)

    def get_has_cv_file(self, o):
        return bool(o.cv_file)

    def validate_profile_picture(self, f):
        # Extension is checked by the model validator; here we verify the bytes really are an image.
        from PIL import Image
        try:
            Image.open(f).verify()
        except Exception:
            raise serializers.ValidationError('File is not a valid image.')
        f.seek(0)
        return f

    def validate_cv_file(self, f):
        head = f.read(5)
        f.seek(0)
        if f.name.lower().endswith('.pdf') and head != b'%PDF-':
            raise serializers.ValidationError('File is not a valid PDF.')
        return f


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display',
                  'is_active', 'date_joined', 'profile']
        read_only_fields = fields


class MeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

    def validate_email(self, v):
        if User.objects.filter(email__iexact=v).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return v


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, v):
        if not self.context['request'].user.check_password(v):
            raise serializers.ValidationError('Current password is incorrect.')
        return v

    def validate_new_password(self, v):
        try:
            password_validation.validate_password(v, self.context['request'].user)
        except Exception as e:
            raise serializers.ValidationError(list(getattr(e, 'messages', [str(e)])))
        return v


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    confirmation = serializers.CharField()

    def validate_confirmation(self, v):
        if v.strip() != 'DELETE':
            raise serializers.ValidationError("Type exactly 'DELETE' to confirm.")
        return v

    def validate_password(self, v):
        if not self.context['request'].user.check_password(v):
            raise serializers.ValidationError('Password is incorrect.')
        return v


class DirectorySerializer(serializers.ModelSerializer):
    """Scholars Directory. Phone is never listed; student number only for admins."""
    id = serializers.IntegerField(source='user_id')
    name = serializers.SerializerMethodField()
    has_picture = serializers.SerializerMethodField()

    class Meta:
        model = ScholarProfile
        fields = ['id', 'name', 'title', 'category', 'faculty', 'department', 'bio',
                  'cv_summary_text', 'has_picture']

    def get_name(self, o):
        return o.user.get_full_name() or o.user.username

    def get_has_picture(self, o):
        return bool(o.profile_picture)

    def to_representation(self, o):
        data = super().to_representation(o)
        req = self.context.get('request')
        if req and req.user.is_authenticated and req.user.is_cut_admin:
            data['student_number'] = o.student_number
            data['email'] = o.user.email
        return data


class LeaderSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    title = serializers.CharField(source='profile.title', default='')
    faculty = serializers.CharField(source='profile.faculty', default='')
    department = serializers.CharField(source='profile.department', default='')
    bio = serializers.CharField(source='profile.bio', default='')

    class Meta:
        model = User
        fields = ['id', 'name', 'title', 'role', 'email', 'faculty', 'department', 'bio']

    def get_name(self, o):
        return o.get_full_name() or o.username


class AdminUserSerializer(serializers.ModelSerializer):
    """Super admin creates / manages Administrator accounts."""
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'password']

    def validate_role(self, v):
        if v not in (User.Role.SCHOLAR, User.Role.ADMINISTRATOR, User.Role.SUPER_ADMIN):
            raise serializers.ValidationError('Invalid role.')
        return v

    def validate_password(self, v):
        try:
            password_validation.validate_password(v)
        except Exception as e:
            raise serializers.ValidationError(list(getattr(e, 'messages', [str(e)])))
        return v

    def create(self, v):
        if 'password' not in v:
            raise serializers.ValidationError({'password': 'This field is required.'})
        pw = v.pop('password')
        user = User(**v, is_staff=v.get('role') in (User.Role.ADMINISTRATOR, User.Role.SUPER_ADMIN))
        user.set_password(pw)
        user.save()
        ScholarProfile.objects.get_or_create(user=user)
        return user

    def update(self, inst, v):
        pw = v.pop('password', None)
        for k, val in v.items():
            setattr(inst, k, val)
        if 'role' in v:
            inst.is_staff = inst.role in (User.Role.ADMINISTRATOR, User.Role.SUPER_ADMIN)
        if pw:
            inst.set_password(pw)
        inst.save()
        return inst


class CategoryAssignSerializer(serializers.Serializer):
    category = serializers.ChoiceField(choices=ScholarProfile.Category.choices)


# ---------------------------------------------------------------- scholar-owned records
class StudyDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyDetails
        exclude = ['user']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, d):
        start = d.get('year_of_starting', getattr(self.instance, 'year_of_starting', None))
        end = d.get('anticipated_year_of_completion', getattr(self.instance, 'anticipated_year_of_completion', None))
        if start and end and end < start:
            raise serializers.ValidationError({'anticipated_year_of_completion': 'Cannot be before the starting year.'})
        return d


class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        exclude = ['user']
        read_only_fields = ['created_at', 'updated_at']

    def validate_year(self, v):
        if v < 1950 or v > 2100:
            raise serializers.ValidationError('Enter a valid year.')
        return v

    def validate_doi_or_url(self, v):
        # blocks javascript: and similar schemes being rendered as links on the front end
        if v and not (v.lower().startswith(('http://', 'https://', '10.'))):
            raise serializers.ValidationError('Must be an http(s) link or a DOI starting with 10.')
        return v


class ChallengeSerializer(serializers.ModelSerializer):
    scholar_name = serializers.SerializerMethodField()
    scholar_category = serializers.CharField(source='user.profile.category', read_only=True, default=None)
    resolved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = ['id', 'category', 'title', 'description', 'status', 'resolution_notes',
                  'resolved_by_name', 'resolved_at', 'created_at', 'updated_at',
                  'scholar_name', 'scholar_category']
        read_only_fields = ['status', 'resolution_notes', 'resolved_at', 'created_at', 'updated_at']

    def get_scholar_name(self, o):
        return o.user.get_full_name() or o.user.username

    def get_resolved_by_name(self, o):
        return (o.resolved_by.get_full_name() or o.resolved_by.username) if o.resolved_by else None


class ChallengeReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ['status', 'resolution_notes']

    def validate(self, d):
        status = d.get('status', self.instance.status)
        notes = d.get('resolution_notes', self.instance.resolution_notes)
        if status == Challenge.Status.RESOLVED and not (notes or '').strip():
            raise serializers.ValidationError({'resolution_notes': 'Required when marking a challenge as resolved.'})
        return d


class GrowthSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrowthSuggestion
        exclude = ['user']
        read_only_fields = ['mentor_notes', 'created_at', 'updated_at']


class MentorNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrowthSuggestion
        fields = ['mentor_notes']


class AwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Award
        exclude = ['user']
        read_only_fields = ['created_at']


# ---------------------------------------------------------------- admin-managed content
class FundingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundingOpportunity
        exclude = ['created_by']
        read_only_fields = ['created_at', 'updated_at']

    def validate_portal_url(self, v):
        if v and not v.lower().startswith(('http://', 'https://')):
            raise serializers.ValidationError('Must be an http(s) URL.')
        return v


class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        exclude = ['created_by']
        read_only_fields = ['created_at']


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionalContent
        fields = ['key', 'title', 'headline', 'body', 'status', 'updated_at']
        read_only_fields = ['key', 'updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
