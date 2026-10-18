# Generated migration for CUTAS project
from django.conf import settings
import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import cutas_app.models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('role', models.CharField(choices=[('SCHOLAR', 'Postgraduate Scholar'), ('ADMIN', 'Administrator / Project Leader'), ('SUPERADMIN', 'Super Administrator (Developer/Lead)')], default='SCHOLAR', max_length=20)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('LOGIN', 'User Login'), ('LOGOUT', 'User Logout'), ('REGISTER', 'New Scholar Registration'), ('ACCOUNT_DELETED', 'Scholar Account Deleted'), ('PASSWORD_CHANGE', 'Password Changed'), ('CONTENT_EDIT', 'Institutional Content Edited'), ('CHALLENGE_REVIEW', 'Challenge Status/Resolution Updated'), ('WORKSHOP_CREATE', 'Workshop Added'), ('FUNDING_CREATE', 'Funding Opportunity Added')], max_length=30)),
                ('actor_username', models.CharField(max_length=150)),
                ('actor_role', models.CharField(max_length=30)),
                ('target_object', models.CharField(blank=True, max_length=255)),
                ('details', models.TextField(blank=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='Award',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=300)),
                ('awarding_body', models.CharField(max_length=200)),
                ('year', models.PositiveIntegerField(default=2025)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='awards', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-year', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Challenge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('FUNDING', 'Funding & Research Grants'), ('TURNITIN', 'Turnitin / Plagiarism Similarity Index'), ('WRITING', 'Academic Writing & Thesis Structure'), ('SUPERVISION', 'Supervision & Advisory Support'), ('LAB_ACCESS', 'Laboratory Access & Equipment'), ('ETHICS', 'Faculty Ethics Committee Clearance'), ('DATA_ANALYSIS', 'Methodology & Statistical Software'), ('OTHER', 'Other Academic Challenge')], default='WRITING', max_length=30)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('status', models.CharField(choices=[('OPEN', 'Open'), ('IN_REVIEW', 'In Review'), ('RESOLVED', 'Resolved')], default='OPEN', max_length=20)),
                ('resolution_notes', models.TextField(blank=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resolved_challenges', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='challenges', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='FundingOpportunity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=300)),
                ('funder', models.CharField(max_length=200)),
                ('amount_range', models.CharField(max_length=150)),
                ('deadline', models.DateField()),
                ('eligibility', models.TextField()),
                ('application_process', models.TextField()),
                ('portal_url', models.URLField(blank=True)),
                ('featured_on_landing', models.BooleanField(default=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['deadline', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='GrowthSuggestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('area', models.CharField(choices=[('WRITING', 'High-Impact Academic Writing'), ('GRANTS', 'Competitive Grant & NRF Proposal Drafting'), ('ANALYTICS', 'Data Analytics & Quantitative Modeling'), ('NETWORKING', 'International Scholarly Networking & Dissemination'), ('PEDAGOGY', 'Undergraduate Tutoring & Higher Education Pedagogy'), ('CAREER', 'Postdoctoral & Industry Placement')], default='WRITING', max_length=20)),
                ('growth_objective', models.CharField(max_length=300)),
                ('milestone_actions', models.TextField()),
                ('target_quarter', models.CharField(default='Q3 2026', max_length=50)),
                ('mentor_notes', models.TextField(blank=True)),
                ('is_completed', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='growth_suggestions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='InstitutionalContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.SlugField(unique=True)),
                ('title', models.CharField(max_length=255)),
                ('headline', models.CharField(blank=True, max_length=350)),
                ('body', models.TextField()),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Publication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('publication_type', models.CharField(choices=[('ARTICLE', 'Peer-Reviewed Journal Article'), ('BOOK_CHAPTER', 'Book Chapter'), ('CONFERENCE', 'Conference Proceeding')], default='ARTICLE', max_length=20)),
                ('title', models.CharField(max_length=400)),
                ('authors', models.CharField(max_length=400)),
                ('outlet_name', models.CharField(max_length=300)),
                ('year', models.PositiveIntegerField(default=2025)),
                ('volume_issue_pages', models.CharField(blank=True, max_length=150)),
                ('doi_or_url', models.CharField(blank=True, max_length=255)),
                ('status', models.CharField(choices=[('PUBLISHED', 'Published'), ('ACCEPTED', 'Accepted / In Press'), ('UNDER_REVIEW', 'Submitted / Under Review')], default='PUBLISHED', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='publications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-year', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ScholarProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('CAT_A', 'Category A: Doctoral Candidates / Senior Fellows'), ('CAT_B', 'Category B: Master’s Scholars / Researchers'), ('CAT_C', 'Category C: Honours & Early Postgraduate Scholars')], default='CAT_B', max_length=10)),
                ('title', models.CharField(choices=[('Dr.', 'Dr.'), ('Prof.', 'Prof.'), ('Mr.', 'Mr.'), ('Ms.', 'Ms.'), ('Mrs.', 'Mrs.')], default='Mr.', max_length=20)),
                ('student_number', models.CharField(blank=True, max_length=30)),
                ('faculty', models.CharField(default='Faculty of Engineering, Built Environment & Information Technology', max_length=150)),
                ('department', models.CharField(blank=True, max_length=150)),
                ('bio', models.TextField(blank=True)),
                ('profile_picture', models.FileField(blank=True, null=True, upload_to='profiles/%Y/%m/', validators=[cutas_app.models.validate_image_extension_and_size])),
                ('cv_file', models.FileField(blank=True, null=True, upload_to='cv_docs/%Y/%m/', validators=[cutas_app.models.validate_cv_extension_and_size])),
                ('cv_summary_text', models.TextField(blank=True)),
                ('phone_number', models.CharField(blank=True, max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='StudyDetails',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('programme', models.CharField(max_length=255)),
                ('university', models.CharField(default='Central University of Technology, Free State', max_length=255)),
                ('year_of_starting', models.PositiveIntegerField(default=2023)),
                ('anticipated_year_of_completion', models.PositiveIntegerField(default=2026)),
                ('supervisor', models.CharField(max_length=255)),
                ('co_supervisor', models.CharField(blank=True, max_length=255)),
                ('funding', models.CharField(default='CUT Postgraduate Research Grant', max_length=255)),
                ('research_topic', models.CharField(max_length=400)),
                ('research_abstract', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='study_details', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Workshop',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=300)),
                ('facilitator', models.CharField(max_length=200)),
                ('event_date', models.DateField()),
                ('event_time', models.TimeField()),
                ('venue_or_link', models.CharField(max_length=300)),
                ('description', models.TextField()),
                ('category', models.CharField(default='Methodology & Writing', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['event_date', 'event_time'],
            },
        ),
    ]
