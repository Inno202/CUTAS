import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_image_extension_and_size(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported file format. Only JPEG, PNG, or WebP images are permitted.")
    if value.size > 5 * 1024 * 1024:
        raise ValidationError("File size exceeds maximum permitted limit (5MB).")

def validate_cv_extension_and_size(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.pdf', '.txt']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported document format. Only PDF or TXT CVs are permitted.")
    if value.size > 5 * 1024 * 1024:
        raise ValidationError("CV file size exceeds maximum permitted limit (5MB).")

class PublishStatus(models.TextChoices):
    DRAFT = 'DRAFT', _('Draft')
    PUBLISHED = 'PUBLISHED', _('Published')


class User(AbstractUser):
    class Role(models.TextChoices):
        SCHOLAR = 'SCHOLAR', _('Postgraduate Scholar')
        ADMINISTRATOR = 'ADMIN', _('Administrator / Project Leader')
        SUPER_ADMIN = 'SUPERADMIN', _('Super Administrator (Developer/Lead)')

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SCHOLAR,
        help_text=_("System access tier for this user")
    )

    @property
    def is_scholar(self):
        return self.role == self.Role.SCHOLAR

    @property
    def is_cut_admin(self):
        return self.role in [self.Role.ADMINISTRATOR, self.Role.SUPER_ADMIN] or self.is_superuser

    @property
    def is_super_administrator(self):
        return self.role == self.Role.SUPER_ADMIN or self.is_superuser

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"


class ScholarProfile(models.Model):
    class Category(models.TextChoices):
        CATEGORY_A = 'CAT_A', _('Category A: Doctoral Candidates / Senior Fellows')
        CATEGORY_B = 'CAT_B', _('Category B: Master’s Scholars / Researchers')
        CATEGORY_C = 'CAT_C', _('Category C: Honours & Early Postgraduate Scholars')

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    category = models.CharField(
        max_length=10,
        choices=Category.choices,
        default=Category.CATEGORY_B
    )
    title = models.CharField(max_length=20, default='Mr.', choices=[
        ('Dr.', 'Dr.'),
        ('Prof.', 'Prof.'),
        ('Mr.', 'Mr.'),
        ('Ms.', 'Ms.'),
        ('Mrs.', 'Mrs.'),
    ])
    student_number = models.CharField(max_length=30, blank=True)
    faculty = models.CharField(
        max_length=150,
        default='Faculty of Engineering, Built Environment & Information Technology'
    )
    department = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True, help_text="Short scholarly biography")
    profile_picture = models.FileField(
        upload_to='profiles/%Y/%m/',
        blank=True,
        null=True,
        validators=[validate_image_extension_and_size],
        help_text="Secure upload, max 5MB. Formats: JPG, PNG, WebP"
    )
    cv_file = models.FileField(
        upload_to='cv_docs/%Y/%m/',
        blank=True,
        null=True,
        validators=[validate_cv_extension_and_size],
        help_text="Upload CV in PDF format. Strictly protected; viewable only in-portal."
    )
    cv_summary_text = models.TextField(
        blank=True,
        help_text="Inline formatted curriculum vitae summary text"
    )
    phone_number = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} {self.user.get_full_name()} [{self.get_category_display()}]"


class StudyDetails(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='study_details')
    programme = models.CharField(max_length=255, help_text="e.g. Doctor of Engineering in Mechanical Engineering")
    university = models.CharField(max_length=255, default='Central University of Technology, Free State')
    year_of_starting = models.PositiveIntegerField(default=2023)
    anticipated_year_of_completion = models.PositiveIntegerField(default=2026)
    supervisor = models.CharField(max_length=255, help_text="Primary Supervisor name and title")
    co_supervisor = models.CharField(max_length=255, blank=True, help_text="Co-Supervisor (if applicable)")
    funding = models.CharField(
        max_length=255,
        default='CUT Postgraduate Research Grant',
        help_text="Primary funding mechanism or bursary"
    )
    research_topic = models.CharField(max_length=400)
    research_abstract = models.TextField(help_text="Abstract, objective, and methodological summary")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Study Details: {self.user.username} - {self.programme}"


class Publication(models.Model):
    class PubType(models.TextChoices):
        ARTICLE = 'ARTICLE', _('Peer-Reviewed Journal Article')
        BOOK_CHAPTER = 'BOOK_CHAPTER', _('Book Chapter')
        CONFERENCE = 'CONFERENCE', _('Conference Proceeding')

    class Status(models.TextChoices):
        PUBLISHED = 'PUBLISHED', _('Published')
        ACCEPTED = 'ACCEPTED', _('Accepted / In Press')
        UNDER_REVIEW = 'UNDER_REVIEW', _('Submitted / Under Review')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='publications')
    publication_type = models.CharField(max_length=20, choices=PubType.choices, default=PubType.ARTICLE)
    title = models.CharField(max_length=400)
    authors = models.CharField(max_length=400, help_text="e.g. Dlamini, N., Mthembu, K., & Sithole, P.")
    outlet_name = models.CharField(max_length=300, help_text="Journal name, Book title, or Conference name")
    year = models.PositiveIntegerField(default=2025)
    volume_issue_pages = models.CharField(max_length=150, blank=True, help_text="e.g. Vol. 14, No. 2, pp. 110-128")
    doi_or_url = models.CharField(max_length=255, blank=True, help_text="DOI link or publisher repository URL")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.year})"


class Challenge(models.Model):
    class Category(models.TextChoices):
        FUNDING = 'FUNDING', _('Funding & Research Grants')
        TURNITIN = 'TURNITIN', _('Turnitin / Plagiarism Similarity Index')
        WRITING = 'WRITING', _('Academic Writing & Thesis Structure')
        SUPERVISION = 'SUPERVISION', _('Supervision & Advisory Support')
        LAB_ACCESS = 'LAB_ACCESS', _('Laboratory Access & Equipment')
        ETHICS = 'ETHICS', _('Faculty Ethics Committee Clearance')
        DATA_ANALYSIS = 'DATA_ANALYSIS', _('Methodology & Statistical Software')
        OTHER = 'OTHER', _('Other Academic Challenge')

    class Status(models.TextChoices):
        OPEN = 'OPEN', _('Open')
        IN_REVIEW = 'IN_REVIEW', _('In Review')
        RESOLVED = 'RESOLVED', _('Resolved')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenges')
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.WRITING)
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Detailed problem description and scholarly impact")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    resolution_notes = models.TextField(
        blank=True,
        help_text="Resolution guidance or intervention recorded by Administrator"
    )
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_challenges'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_status_display()}] {self.title} ({self.user.username})"


class GrowthSuggestion(models.Model):
    class CompetencyArea(models.TextChoices):
        HIGH_IMPACT_WRITING = 'WRITING', _('High-Impact Academic Writing')
        GRANT_PROPOSALS = 'GRANTS', _('Competitive Grant & NRF Proposal Drafting')
        DATA_ANALYTICS = 'ANALYTICS', _('Data Analytics & Quantitative Modeling')
        NETWORKING = 'NETWORKING', _('International Scholarly Networking & Dissemination')
        PEDAGOGY = 'PEDAGOGY', _('Undergraduate Tutoring & Higher Education Pedagogy')
        CAREER = 'CAREER', _('Postdoctoral & Industry Placement')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='growth_suggestions')
    area = models.CharField(max_length=20, choices=CompetencyArea.choices, default=CompetencyArea.HIGH_IMPACT_WRITING)
    growth_objective = models.CharField(max_length=300, help_text="e.g. Master Structural Equation Modeling in R")
    milestone_actions = models.TextField(help_text="Step-by-step actions and targets")
    target_quarter = models.CharField(max_length=50, default='Q3 2026', help_text="e.g. Q3 2026")
    mentor_notes = models.TextField(blank=True, help_text="Optional advisor or peer feedback")
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.growth_objective}"


class FundingOpportunity(models.Model):
    title = models.CharField(max_length=300)
    funder = models.CharField(max_length=200, help_text="e.g. National Research Foundation (NRF)")
    amount_range = models.CharField(max_length=150, help_text="e.g. R90,000 - R140,000 p.a.")
    deadline = models.DateField()
    eligibility = models.TextField(help_text="Eligibility constraints and qualifications required")
    application_process = models.TextField(help_text="Step-by-step application instructions and required docs")
    portal_url = models.URLField(blank=True, help_text="External link to funding application portal")
    featured_on_landing = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=10, choices=PublishStatus.choices, default=PublishStatus.PUBLISHED)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['deadline', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.funder})"


class Award(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='awards')
    title = models.CharField(max_length=300, help_text="e.g. Best Oral Presentation Award - SAIP Conference")
    awarding_body = models.CharField(max_length=200, help_text="e.g. South African Institute of Physics / CUT Research Office")
    year = models.PositiveIntegerField(default=2025)
    description = models.TextField(blank=True, help_text="Brief background regarding the achievement")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username} ({self.year})"


class Workshop(models.Model):
    title = models.CharField(max_length=300)
    facilitator = models.CharField(max_length=200, help_text="Speaker name, title, and institutional affiliation")
    event_date = models.DateField()
    event_time = models.TimeField()
    venue_or_link = models.CharField(
        max_length=300,
        help_text="Physical venue (e.g. CUT Library Auditorium) or virtual link (e.g. MS Teams meeting)"
    )
    description = models.TextField()
    category = models.CharField(max_length=100, default='Methodology & Writing')
    status = models.CharField(max_length=10, choices=PublishStatus.choices, default=PublishStatus.PUBLISHED)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event_date', 'event_time']

    def __str__(self):
        return f"{self.title} on {self.event_date}"


class InstitutionalContent(models.Model):
    """Admin-editable institutional pages: About Us, Project Leaders, Landing Intro"""
    key = models.SlugField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    headline = models.CharField(max_length=350, blank=True)
    body = models.TextField()
    status = models.CharField(max_length=10, choices=PublishStatus.choices, default=PublishStatus.PUBLISHED)
    last_updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Page Content: {self.key}"


class AuditLog(models.Model):
    action = models.CharField(max_length=40, db_index=True)
    actor_username = models.CharField(max_length=150)
    actor_role = models.CharField(max_length=60)
    target_object = models.CharField(max_length=255, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.action} by {self.actor_username}"
