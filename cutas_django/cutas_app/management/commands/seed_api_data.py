"""Seed demo data for API testing. Passwords come from env vars; defaults only work with DJANGO_DEBUG=true."""
import os
from datetime import date, time, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from cutas_app.models import (
    Award, Challenge, FundingOpportunity, GrowthSuggestion, InstitutionalContent,
    Publication, ScholarProfile, StudyDetails, User, Workshop,
)


class Command(BaseCommand):
    help = 'Seeds CUTAS demo users and content (idempotent).'

    def handle(self, *a, **o):
        admin_pw = os.environ.get('SEED_ADMIN_PASSWORD') or ('AdminPass123!' if settings.DEBUG else None)
        scholar_pw = os.environ.get('SEED_SCHOLAR_PASSWORD') or ('ScholarPass123!' if settings.DEBUG else None)
        if not (admin_pw and scholar_pw):
            raise CommandError('Set SEED_ADMIN_PASSWORD and SEED_SCHOLAR_PASSWORD (no default passwords outside DEBUG).')

        def mk(username, first, last, role, pw, **kw):
            u, new = User.objects.get_or_create(username=username, defaults=dict(
                email=f'{username}@cut.ac.za', first_name=first, last_name=last, role=role,
                is_staff=role != User.Role.SCHOLAR, is_superuser=role == User.Role.SUPER_ADMIN))
            if new:
                u.set_password(pw)
                u.save()
            return u

        sup = mk('dev_superadmin', 'Thembile', 'Innocent', User.Role.SUPER_ADMIN, admin_pw)
        adm = mk('prof_mthembu', 'Khanyisile', 'Mthembu', User.Role.ADMINISTRATOR, admin_pw)
        ScholarProfile.objects.get_or_create(user=adm, defaults=dict(
            title='Prof.', category='CAT_A', bio='Project Leader and Convenor of CUTAS.',
            faculty='Faculty of Engineering, Built Environment & Information Technology'))

        people = [('naledi_dlamini', 'Naledi', 'Dlamini', 'CAT_A', 'Dr.', 'Doctor of Health Sciences'),
                  ('sipho_molefe', 'Sipho', 'Molefe', 'CAT_B', 'Mr.', 'Master of Engineering'),
                  ('thabo_motloung', 'Thabo', 'Motloung', 'CAT_C', 'Mr.', 'BMS Honours')]
        scholars = {}
        for un, f, l, cat, t, prog in people:
            u = mk(un, f, l, User.Role.SCHOLAR, scholar_pw)
            ScholarProfile.objects.get_or_create(user=u, defaults=dict(
                category=cat, title=t, bio=f'{prog} candidate at CUT.', cv_summary_text=f'{prog}, CUT.'))
            StudyDetails.objects.get_or_create(user=u, defaults=dict(
                programme=prog, supervisor='Prof. K. Mthembu', research_topic='Sample research topic',
                research_abstract='Sample abstract.'))
            scholars[un] = u

        n = scholars['naledi_dlamini']
        Publication.objects.get_or_create(user=n, title='Green Synthesis of Silver Nanoparticles', defaults=dict(
            authors='Dlamini, N.', outlet_name='Journal of Applied Nanobiotechnology', year=2025))
        Award.objects.get_or_create(user=n, title='VC Postdoctoral Excellence Award', defaults=dict(
            awarding_body='CUT Research Directorate', year=2025))
        GrowthSuggestion.objects.get_or_create(user=n, growth_objective='Secure NRF Y-rated grant', defaults=dict(
            area='GRANTS', milestone_actions='Draft proposal; peer review'))
        Challenge.objects.get_or_create(user=n, title='HR-TEM beamtime delays', defaults=dict(
            category='LAB_ACCESS', description='6-week turnaround.', status='RESOLVED',
            resolution_notes='Reciprocal booking agreement with UFS.', resolved_by=adm, resolved_at=timezone.now()))
        Challenge.objects.get_or_create(user=scholars['thabo_motloung'], title='Literature review structure', defaults=dict(
            category='WRITING', description='Need help with a synthesis matrix.'))

        InstitutionalContent.objects.get_or_create(key='about_us', defaults=dict(
            title='About CUT Academic Society (CUTAS)', headline='Revitalizing intellectualism across UoTs', body='About text.'))
        InstitutionalContent.objects.get_or_create(key='project_leaders', defaults=dict(
            title='Project Leaders and Society Administrators', headline='Academic stewards', body='Leaders text.'))
        InstitutionalContent.objects.get_or_create(key='landing_intro', defaults=dict(
            title='Welcome', headline='', body='A scholar-led academic society.'))

        today = date.today()
        FundingOpportunity.objects.get_or_create(title='NRF Postgraduate Scholarships', defaults=dict(
            funder='NRF', amount_range='R140,000 - R180,000 p.a.', deadline=today + timedelta(days=60),
            eligibility='SA citizens, 65% aggregate.', application_process='Apply on NRF Connect.',
            portal_url='https://nrfconnect.nrf.ac.za', created_by=adm))
        Workshop.objects.get_or_create(title='Scopus & WoS Article Structuring', defaults=dict(
            facilitator='Prof. K. Mthembu', event_date=today + timedelta(days=14), event_time=time(10, 0),
            venue_or_link='Library Seminar Room 204', description='IMRAD masterclass.', created_by=adm))
        self.stdout.write(self.style.SUCCESS('Seeded.'))
