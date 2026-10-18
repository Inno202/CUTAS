import json
from django.core.management.base import BaseCommand
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone
from cutas_app.models import (
    User, ScholarProfile, StudyDetails, Publication,
    Challenge, GrowthSuggestion, FundingOpportunity,
    Award, Workshop, AuditLog
)

class Command(BaseCommand):
    help = 'Exports complete CUTAS academic database to formatted JSON for Super Administrator'

    def add_arguments(self, parser):
        parser.add_argument('--output', type=str, default='cutas_export.json', help='Output JSON file path')

    def handle(self, *args, **options):
        output_path = options['output']
        self.stdout.write(f'Exporting data to {output_path}...')

        payload = {
            'metadata': {
                'system': 'Central University of Technology Academic Society (CUTAS)',
                'export_timestamp': timezone.now().isoformat(),
                'export_format': 'v1.0-relational',
            },
            'users': list(User.objects.values('id', 'username', 'email', 'role', 'first_name', 'last_name', 'date_joined')),
            'profiles': list(ScholarProfile.objects.values('user__username', 'category', 'student_number', 'faculty', 'department', 'bio')),
            'study_details': list(StudyDetails.objects.values('user__username', 'programme', 'university', 'year_of_starting', 'anticipated_year_of_completion', 'supervisor', 'funding', 'research_topic')),
            'publications': list(Publication.objects.values('id', 'user__username', 'publication_type', 'title', 'authors', 'outlet_name', 'year', 'status', 'doi_or_url')),
            'challenges': list(Challenge.objects.values('id', 'user__username', 'category', 'title', 'description', 'status', 'resolution_notes', 'created_at', 'resolved_at')),
            'growth_suggestions': list(GrowthSuggestion.objects.values('user__username', 'area', 'growth_objective', 'target_quarter', 'is_completed')),
            'funding_opportunities': list(FundingOpportunity.objects.values('title', 'funder', 'amount_range', 'deadline', 'eligibility', 'is_active')),
            'awards': list(Award.objects.values('user__username', 'title', 'awarding_body', 'year', 'description')),
            'workshops': list(Workshop.objects.values('title', 'facilitator', 'event_date', 'event_time', 'venue_or_link', 'category')),
            'audit_logs': list(AuditLog.objects.values('timestamp', 'action', 'actor_username', 'actor_role', 'target_object', 'details')),
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(payload, f, indent=2, cls=DjangoJSONEncoder)

        self.stdout.write(self.style.SUCCESS(f'Successfully exported CUTAS dataset to {output_path}!'))
