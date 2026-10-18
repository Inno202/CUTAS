import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Database, Terminal, Shield, BookOpen } from 'lucide-react';

interface DjangoCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DjangoCodeViewer: React.FC<DjangoCodeViewerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<string>('models.py');
  const [copied, setCopied] = useState<boolean>(false);

  const files: Record<string, { desc: string; code: string }> = {
    'settings.py': {
      desc: 'CUTAS Django Settings with PostgreSQL via Environment Variables & Security Hardening',
      code: `"""
Django settings for CUTAS project.
Central University of Technology Academic Society portal.
"""
from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'cutas-production-secret-key-2026')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1')
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cutas_app.apps.CutasAppConfig',
]

# Database Configuration: PostgreSQL via Environment Variables
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600)}
elif os.environ.get('DB_NAME'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'cutas_db'),
            'USER': os.environ.get('DB_USER', 'cutas_user'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
        }
    }
else:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'cutas_db.sqlite3'}}

AUTH_USER_MODEL = 'cutas_app.User'

# Password Security: Salted PBKDF2 Hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
]

SESSION_COOKIE_AGE = 3600  # 1 hour session timeout
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
MEDIA_ROOT = BASE_DIR / 'protected_media'  # Files stored outside web root`
    },
    'models.py': {
      desc: 'CUTAS Data Models: User Roles, Scholar Categories (A/B/C), Studies, Publications, Challenges',
      code: `from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        SCHOLAR = 'SCHOLAR', 'Postgraduate Scholar'
        ADMINISTRATOR = 'ADMIN', 'Administrator / Project Leader'
        SUPER_ADMIN = 'SUPERADMIN', 'Super Administrator (Developer/Lead)'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SCHOLAR)

    @property
    def is_scholar(self):
        return self.role == self.Role.SCHOLAR

    @property
    def is_cut_admin(self):
        return self.role in [self.Role.ADMINISTRATOR, self.Role.SUPER_ADMIN] or self.is_superuser


class ScholarProfile(models.Model):
    class Category(models.TextChoices):
        CATEGORY_A = 'CAT_A', 'Category A: Doctoral Candidates / Senior Fellows'
        CATEGORY_B = 'CAT_B', 'Category B: Master’s Scholars / Researchers'
        CATEGORY_C = 'CAT_C', 'Category C: Honours & Early Postgraduate Scholars'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    category = models.CharField(max_length=10, choices=Category.choices, default=Category.CATEGORY_B)
    faculty = models.CharField(max_length=150)
    student_number = models.CharField(max_length=30)
    bio = models.TextField(blank=True)
    cv_summary_text = models.TextField(blank=True)
    profile_picture = models.FileField(upload_to='profiles/%Y/%m/', blank=True, null=True)
    cv_file = models.FileField(upload_to='cv_docs/%Y/%m/', blank=True, null=True)


class StudyDetails(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='study_details')
    programme = models.CharField(max_length=255)
    university = models.CharField(max_length=255, default='Central University of Technology, Free State')
    year_of_starting = models.PositiveIntegerField(default=2023)
    anticipated_year_of_completion = models.PositiveIntegerField(default=2026)
    supervisor = models.CharField(max_length=255)
    funding = models.CharField(max_length=255)
    research_topic = models.CharField(max_length=400)
    research_abstract = models.TextField()


class Publication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='publications')
    publication_type = models.CharField(max_length=20, choices=[('ARTICLE', 'Article'), ('BOOK_CHAPTER', 'Book Chapter'), ('CONFERENCE', 'Conference')])
    title = models.CharField(max_length=400)
    authors = models.CharField(max_length=400)
    outlet_name = models.CharField(max_length=300)
    year = models.PositiveIntegerField(default=2025)
    status = models.CharField(max_length=20, default='PUBLISHED')


class Challenge(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        RESOLVED = 'RESOLVED', 'Resolved'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenges')
    category = models.CharField(max_length=30)  # FUNDING, TURNITIN, WRITING, LAB_ACCESS, ETHICS...
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)


class AuditLog(models.Model):
    action = models.CharField(max_length=30)  # LOGIN, LOGOUT, ACCOUNT_DELETED, CHALLENGE_REVIEW...
    actor_username = models.CharField(max_length=150)
    actor_role = models.CharField(max_length=30)
    target_object = models.CharField(max_length=255, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)`
    },
    'views.py': {
      desc: 'Django MVC Controllers: Role-Based Authorization, PDF ReportLab Generation & Admin Workflows',
      code: `@login_required
def study_details_pdf(request):
    study = get_object_or_404(StudyDetails, user=request.user)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36)
    
    story = [
        Paragraph("<b>CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY</b>", title_style),
        Paragraph(f"Official Postgraduate Study Dossier · {request.user.get_full_name()}", sub_style),
        HRFlowable(width="100%", thickness=2, color=colors.HexColor('#FBB927')),
        Paragraph(f"<b>Programme:</b> {study.programme}", body_style),
        Paragraph(f"<b>University:</b> {study.university}", body_style),
        Paragraph(f"<b>Supervisor:</b> {study.supervisor}", body_style),
        Paragraph(f"<b>Funding:</b> {study.funding}", body_style),
        Paragraph(f"<b>Research Topic:</b> {study.research_topic}", body_style),
        Paragraph(f"<b>Abstract:</b> {study.research_abstract}", body_style),
    ]
    doc.build(story)
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')


@login_required
@admin_required
def review_challenge_view(request, challenge_id):
    challenge = get_object_or_404(Challenge, id=challenge_id)
    if request.method == 'POST':
        form = ChallengeResolutionForm(request.POST, instance=challenge)
        if form.is_valid():
            ch = form.save(commit=False)
            if ch.status == Challenge.Status.RESOLVED:
                ch.resolved_at = timezone.now()
                ch.resolved_by = request.user
            ch.save()
            record_audit('CHALLENGE_REVIEW', request.user.username, 'Admin', f"Status: {ch.status}")
            return redirect('cutas:admin_dashboard')
    ...`
    },
    'README.md': {
      desc: 'Run Instructions: PostgreSQL Setup, Migrations, and Seeding',
      code: `# Run Instructions for CUTAS

1. Setup environment:
   cd cutas_django
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

2. Configure PostgreSQL:
   export DATABASE_URL="postgresql://cutas_user:password@localhost:5432/cutas_db"

3. Execute migrations:
   python manage.py migrate

4. Seed database with Category A, B, C scholars & content:
   python manage.py seed_data

5. Start the server:
   python manage.py runserver 0.0.0.0:8000`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 w-full max-w-5xl rounded-xl shadow-2xl border border-slate-700 flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-500/30">
              <FileCode className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                CUTAS Django Source Code & Architecture
                <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Django 5.0 + PostgreSQL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete MVC implementation located in <code className="text-amber-300">/cutas_django/</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy File'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="bg-slate-950 px-6 pt-2 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs">
          {Object.keys(files).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveTab(fileName)}
              className={`px-4 py-2 font-mono font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                activeTab === fileName
                  ? 'bg-slate-900 text-amber-300 border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-slate-900">
          <div className="text-slate-400 mb-3 text-[11px] italic border-b border-slate-800 pb-2">
            // {files[activeTab].desc}
          </div>
          <pre className="text-slate-200 whitespace-pre-wrap selection:bg-blue-600 selection:text-white">
            {files[activeTab].code}
          </pre>
        </div>

        {/* Footer info strip */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-400" /> PostgreSQL 14+ via env vars
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> PBKDF2 Password Hashing
            </span>
          </div>
          <div>Files ready in workspace folder: <code>cutas_django/</code></div>
        </div>
      </div>
    </div>
  );
};
