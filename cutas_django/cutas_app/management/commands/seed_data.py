from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from cutas_app.models import (
    ScholarProfile, StudyDetails, Publication, Challenge,
    GrowthSuggestion, FundingOpportunity, Award, Workshop,
    InstitutionalContent, AuditLog
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic CUTAS scholars, publications, workshops, challenges, and content'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding CUTAS database...'))

        # 1. Super Administrator (Developer / Lead)
        super_admin, created = User.objects.get_or_create(
            username='dev_superadmin',
            defaults={
                'email': 'developer@cutas.cut.ac.za',
                'first_name': 'Thembile',
                'last_name': 'Innocent',
                'role': User.Role.SUPER_ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            super_admin.set_password('AdminPass123!')
            super_admin.save()
            self.stdout.write(self.style.SUCCESS('Created Super Administrator: dev_superadmin'))

        # 2. Administrator / Project Leader
        admin_user, created = User.objects.get_or_create(
            username='prof_mthembu',
            defaults={
                'email': 'kmthembu@cut.ac.za',
                'first_name': 'Khanyisile',
                'last_name': 'Mthembu',
                'role': User.Role.ADMINISTRATOR,
                'is_staff': True,
            }
        )
        if created:
            admin_user.set_password('AdminPass123!')
            admin_user.save()
            ScholarProfile.objects.create(
                user=admin_user,
                title='Prof.',
                category=ScholarProfile.Category.CATEGORY_A,
                faculty='Faculty of Engineering, Built Environment & Information Technology',
                department='Department of Civil & Mechanical Engineering',
                bio='Professor of Structural Systems and Founding Project Leader of the Central University of Technology Academic Society. Passionate about empowering postgraduate research across African Universities of Technology.',
                cv_summary_text='BSc Eng (Natal), MSc (Wits), PhD (UCT). Pr.Eng, FSAAE, NRF B-rated researcher. Over 85 Scopus-indexed journal papers and 12 PhD completions supervised.'
            )
            self.stdout.write(self.style.SUCCESS('Created Administrator: prof_mthembu'))

        # 3. Category A Scholar (Doctoral Candidate / Senior Fellow)
        cat_a_user, created = User.objects.get_or_create(
            username='naledi_dlamini',
            defaults={
                'email': 'naledi.dlamini@postgrad.cut.ac.za',
                'first_name': 'Naledi',
                'last_name': 'Dlamini',
                'role': User.Role.SCHOLAR,
            }
        )
        if created:
            cat_a_user.set_password('ScholarPass123!')
            cat_a_user.save()
            ScholarProfile.objects.create(
                user=cat_a_user,
                title='Dr.',
                category=ScholarProfile.Category.CATEGORY_A,
                student_number='201984210',
                faculty='Faculty of Health & Environmental Sciences',
                department='Department of Life Sciences & Biotechnology',
                bio='Postdoctoral Senior Fellow researching indigenous phytomedicines and antimicrobial nanomaterials against drug-resistant clinical pathogens.',
                cv_summary_text='PhD in Health Sciences (CUT, 2024), MTech Biomedical Tech (CUT, 2021). Recipient of the South African Medical Research Council Doctoral Fellowship. 6 peer-reviewed journal articles, 2 provisional patents filed.'
            )
            StudyDetails.objects.create(
                user=cat_a_user,
                programme='Doctor of Health Sciences in Biomedical Technology',
                university='Central University of Technology, Free State',
                year_of_starting=2021,
                anticipated_year_of_completion=2024,
                supervisor='Prof. S. R. Ramaphosa',
                co_supervisor='Dr. M. Van der Merwe',
                funding='SAMRC Precision Medicine Grant & NRF SARChI Chair',
                research_topic='Synthesis of Silver Nanoparticles using Free State Flora for Multi-Drug Resistant Strains',
                research_abstract='Investigating biogenic green synthesis of noble metal nanoparticles utilizing endemic highveld flora extracts. Characterization conducted through XRD, FTIR, HR-TEM and in vitro cytotoxicity assays against ESKAPE pathogens.'
            )
            Publication.objects.create(
                user=cat_a_user,
                publication_type=Publication.PubType.ARTICLE,
                title='Green Synthesis and Antimicrobial Evaluation of Endemic Botanical Nanoparticles',
                authors='Dlamini, N., Ramaphosa, S. R., & Mthembu, K.',
                outlet_name='Journal of Applied Nanobiotechnology',
                year=2025,
                volume_issue_pages='Vol. 18, pp. 204-219',
                doi_or_url='https://doi.org/10.1016/j.nanobio.2025.04.012',
                status=Publication.Status.PUBLISHED
            )
            Publication.objects.create(
                user=cat_a_user,
                publication_type=Publication.PubType.BOOK_CHAPTER,
                title='Nanotechnology Interventions for Primary Healthcare in Sub-Saharan Africa',
                authors='Dlamini, N. & Ramaphosa, S. R.',
                outlet_name='Innovations in African Biotechnology, Springer Nature',
                year=2024,
                volume_issue_pages='Chapter 7, pp. 145-178',
                status=Publication.Status.PUBLISHED
            )
            Challenge.objects.create(
                user=cat_a_user,
                category=Challenge.Category.LAB_ACCESS,
                title='High-Resolution Transmission Electron Microscopy (HR-TEM) Beamtime Access',
                description='Experiencing 6-week turnaround delay in gaining beamtime bookings at the regional instrumentation centre for high-magnification crystal lattice analysis.',
                status=Challenge.Status.RESOLVED,
                resolution_notes='CUTAS liaison established formal collaborative inter-institutional agreement with UFS Center for Microscopy, granting our scholars dedicated Friday beam slots.',
                resolved_by=admin_user,
                resolved_at=timezone.now()
            )
            GrowthSuggestion.objects.create(
                user=cat_a_user,
                area=GrowthSuggestion.CompetencyArea.GRANT_PROPOSALS,
                growth_objective='Secure NRF Y-Rated Emerging Researcher Grant Application',
                milestone_actions='1. Finalize literature synthesis on highveld biosafety. 2. Attend CUT grant drafting bootcamp. 3. Submit proposal draft to CUTAS internal peer-review panel by June.',
                target_quarter='Q3 2026',
                mentor_notes='Excellent track record. Focus on demonstrating independent international collaboration linkages.'
            )
            Award.objects.create(
                user=cat_a_user,
                title='CUT Vice-Chancellor Postdoctoral Excellence Award',
                awarding_body='Central University of Technology Research Directorate',
                year=2025,
                description='Awarded for achieving top citation impact factor and research translation in health biotechnology.'
            )

        # 4. Category B Scholar (Master's Scholar / Researcher)
        cat_b_user, created = User.objects.get_or_create(
            username='sipho_molefe',
            defaults={
                'email': 'smolefe@postgrad.cut.ac.za',
                'first_name': 'Sipho',
                'last_name': 'Molefe',
                'role': User.Role.SCHOLAR,
            }
        )
        if created:
            cat_b_user.set_password('ScholarPass123!')
            cat_b_user.save()
            ScholarProfile.objects.create(
                user=cat_b_user,
                title='Mr.',
                category=ScholarProfile.Category.CATEGORY_B,
                student_number='202119044',
                faculty='Faculty of Engineering, Built Environment & Information Technology',
                department='Department of Electrical & Computer Systems Engineering',
                bio='Master of Engineering candidate designing decentralized microgrid energy storage controls and IoT edge telemetry for rural farming communities in the Free State.',
                cv_summary_text='BEng Tech Hons (Electrical Engineering, CUT, 2022). Certified Energy Manager Associate. Author of 1 IEEE AfricaCon proceeding.'
            )
            StudyDetails.objects.create(
                user=cat_b_user,
                programme='Master of Engineering in Electrical Engineering',
                university='Central University of Technology, Free State',
                year_of_starting=2023,
                anticipated_year_of_completion=2025,
                supervisor='Prof. K. Mthembu',
                funding='CUT Innovation & Technology Transfer Bursary',
                research_topic='Adaptive Machine Learning Inverters for Islanded Agricultural Microgrids',
                research_abstract='Evaluating Reinforcement Learning models for frequency stabilization in hybrid PV-battery microgrids experiencing sudden load variations in agricultural pumping facilities.'
            )
            Publication.objects.create(
                user=cat_b_user,
                publication_type=Publication.PubType.CONFERENCE,
                title='Dynamic Reactive Power Dispatch in High-Penetration Agro-Solar Microgrids',
                authors='Molefe, S. & Mthembu, K.',
                outlet_name='Proceedings of the 2024 IEEE PES/IAS PowerAfrica Conference',
                year=2024,
                volume_issue_pages='pp. 88-94',
                status=Publication.Status.PUBLISHED
            )
            Challenge.objects.create(
                user=cat_b_user,
                category=Challenge.Category.TURNITIN,
                title='Turnitin Similarity Index on Standard Mathematical Proof Formulations',
                description='Automated similarity checker flagged 24% similarity due to standard circuit differential equations and standard IEEE terminology in Chapter 3.',
                status=Challenge.Status.IN_REVIEW,
                resolution_notes='Under review by Postgraduate Advisory Desk. Formulated exclusion filter for standard equation sets approved by Faculty Higher Degrees Committee.',
                resolved_by=admin_user
            )

        # 5. Category C Scholar (Honours & Early Postgraduate Scholar)
        cat_c_user, created = User.objects.get_or_create(
            username='thabo_motloung',
            defaults={
                'email': 'tmotloung@postgrad.cut.ac.za',
                'first_name': 'Thabo',
                'last_name': 'Motloung',
                'role': User.Role.SCHOLAR,
            }
        )
        if created:
            cat_c_user.set_password('ScholarPass123!')
            cat_c_user.save()
            ScholarProfile.objects.create(
                user=cat_c_user,
                title='Mr.',
                category=ScholarProfile.Category.CATEGORY_C,
                student_number='202400392',
                faculty='Faculty of Management Sciences',
                department='Department of Business Support Studies & Entrepreneurship',
                bio='BSc Honours candidate evaluating fintech adoption barriers among informal township economy traders in the Mangaung Metropolitan municipality.',
                cv_summary_text='Advanced Diploma in Financial Management (CUT, 2023). Dean’s Commendation for Academic Merit. CUTAS Junior Scholar Peer Tutor.'
            )
            StudyDetails.objects.create(
                user=cat_c_user,
                programme='Bachelor of Management Sciences Honours',
                university='Central University of Technology, Free State',
                year_of_starting=2025,
                anticipated_year_of_completion=2025,
                supervisor='Dr. P. N. Sithole',
                funding='NSFAS Postgraduate Transition Bursary',
                research_topic='Micro-merchant Mobile Payment Penetration in Mangaung Informal Settlements',
                research_abstract='Applying the Unified Theory of Acceptance and Use of Technology (UTAUT2) to assess trust, digital literacy, and transaction fee frictions in township retail trade.'
            )
            Challenge.objects.create(
                user=cat_c_user,
                category=Challenge.Category.WRITING,
                title='Literature Review Synthesis and Academic Tone Calibration',
                description='Transitioning from undergraduate report writing to critical synthesis of peer-reviewed empirical literature. Need structured guidance on citation synthesis matrix.',
                status=Challenge.Status.OPEN
            )

        # 6. Seed Funding Opportunities (Tab 8 & Landing Page)
        FundingOpportunity.objects.get_or_create(
            title='NRF Postgraduate Free-Standing & Innovation Master’s and Doctoral Scholarships',
            defaults={
                'funder': 'National Research Foundation (NRF)',
                'amount_range': 'R140,000 - R180,000 p.a. + Research Allowance',
                'deadline': date(2026, 7, 31),
                'eligibility': 'South African citizens and permanent residents registered full-time for Master or Doctoral studies in STEM, Humanities, and Social Sciences with minimum 65% aggregate.',
                'application_process': '1. Complete CUT internal endorsement check. 2. Register on NRF Connect portal. 3. Attach verified transcripts and supervisor motivation.',
                'portal_url': 'https://nrfconnect.nrf.ac.za',
                'featured_on_landing': True,
                'is_active': True,
                'created_by': admin_user
            }
        )
        FundingOpportunity.objects.get_or_create(
            title='CUT Postgraduate Research & Innovation Fund (PRIF)',
            defaults={
                'funder': 'Central University of Technology Research Office',
                'amount_range': 'Up to R45,000 for field data collection and consumables',
                'deadline': date(2026, 8, 15),
                'eligibility': 'All bona fide CUT registered Honours, Master’s and Doctoral scholars in good academic standing.',
                'application_process': 'Submit research proposal abstract, itemized budget breakdown, and supervisor endorsement through the CUTAS portal or Research Development Office.',
                'portal_url': 'https://www.cut.ac.za/research-development',
                'featured_on_landing': True,
                'is_active': True,
                'created_by': admin_user
            }
        )
        FundingOpportunity.objects.get_or_create(
            title='DAAD In-Country / In-Region Postgraduate Mobility Grant',
            defaults={
                'funder': 'German Academic Exchange Service (DAAD)',
                'amount_range': 'EUR 6,500 travel allowance + monthly living stipend',
                'deadline': date(2026, 9, 30),
                'eligibility': 'Postgraduate scholars conducting collaborative field studies or lab exchanges with partner Southern African institutions.',
                'application_process': 'Full application dossier including CV, invitation letter from host department, and 3-page research prospectus.',
                'portal_url': 'https://www.daad.de',
                'featured_on_landing': True,
                'is_active': True,
                'created_by': admin_user
            }
        )

        # 7. Seed Upcoming Workshops (Tab 10 & Landing Page)
        Workshop.objects.get_or_create(
            title='Mastering Scopus & Web of Science Article Structuring for UoT Scholars',
            defaults={
                'facilitator': 'Prof. Khanyisile Mthembu & CUT Senior Research Fellows',
                'event_date': date(2026, 11, 4),
                'event_time': time(10, 0),
                'venue_or_link': 'Library Seminar Room 204, Bloemfontein Campus & MS Teams Hybrid',
                'description': 'A comprehensive, hands-on workshop guiding scholars through the IMRAD format, responding to reviewer critiques, selecting high-impact DHET-accredited journals, and avoiding predatory publishers.',
                'category': 'Academic Writing & Publishing',
                'created_by': admin_user
            }
        )
        Workshop.objects.get_or_create(
            title='Ethical Clearance Submissions: Navigating the CUT Health & Environmental Ethics Board',
            defaults={
                'facilitator': 'Dr. Naledi Dlamini (Postdoctoral Fellow)',
                'event_date': date(2026, 11, 18),
                'event_time': time(14, 0),
                'venue_or_link': 'Welkom Campus Auditorium A & Virtual Stream',
                'description': 'Demystifying the National Health Research Ethics Council (NHREC) requirements, informed consent drafting, participant data protection under POPIA, and common causes for application deferral.',
                'category': 'Research Governance & Ethics',
                'created_by': admin_user
            }
        )
        Workshop.objects.get_or_create(
            title='Quantitative Data Analysis Bootcamp: Jamovi & R for Thesis Verification',
            defaults={
                'facilitator': 'Dr. P. N. Sithole (Statistical Consultant)',
                'event_date': date(2026, 12, 2),
                'event_time': time(9, 30),
                'venue_or_link': 'Civil Engineering Computer Lab B, Bloemfontein Campus',
                'description': 'Practical tutorial focusing on ANOVA, multiple regression, normality checks, and generating publication-ready figures for engineering and management scholars.',
                'category': 'Methodology & Data Analysis',
                'created_by': admin_user
            }
        )

        # 8. Seed Institutional Pages (Tabs 1, 2)
        InstitutionalContent.objects.get_or_create(
            key='about_us',
            defaults={
                'title': 'About CUT Academic Society (CUTAS)',
                'headline': 'Advancing Intellectualism and Scientific Inquisitiveness in Universities of Technology',
                'body': """The Central University of Technology Academic Society (CUTAS) was founded as a transformative intellectual home for postgraduate scholars across the Central University of Technology (Free State). 

Recognizing that Universities of Technology (UoTs) possess a unique technological and applied mandate, CUTAS was conceived under the clarion call: "Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs."

Our Strategic Pillars:
1. Scholarly Rigour: Elevating postgraduate writing, critical theory, and peer-to-peer defense culture.
2. Interdisciplinary Cross-Pollination: Breaking traditional faculty silos between Engineering, Health, Management, and Humanities.
3. Publication Competence: Accelerating DHET-accredited journal outputs and monograph contributions.
4. Problem Resolution Advocacy: Actively identifying research bottlenecks (ethics clearance, Turnitin interpretation, laboratory access, and bursary disbursements) and engineering actionable interventions in collaboration with the CUT executive leadership.""",
                'last_updated_by': admin_user
            }
        )

        InstitutionalContent.objects.get_or_create(
            key='project_leaders',
            defaults={
                'title': 'Project Leaders & Society Executive',
                'headline': 'Academic Governance, Advisory Mentorship, and Steering Committee',
                'body': """The Society is steered by a dedicated consortium of seasoned academics, postgraduate research directors, and elected student fellows. 

Executive Leadership Structure:
• Project Leader & Society Convener: Prof. Khanyisile Mthembu (Faculty of Engineering, Built Environment & IT)
• Deputy Convener (Life & Health Sciences): Dr. Naledi Dlamini (Senior Postdoctoral Fellow)
• Coordinator for Research Ethics & Integrity: Dr. P. N. Sithole (Faculty of Management Sciences)
• Student Society Liaison & Postgraduate Representative: Sipho Molefe (Master’s Scholar)

Administrators oversee challenge review pipelines, workshop scheduling, institutional reports to Senate, and funding dissemination.""",
                'last_updated_by': admin_user
            }
        )

        # 9. Audit Logs
        AuditLog.objects.create(
            action='LOGIN',
            actor_username='dev_superadmin',
            actor_role='Super Administrator',
            details='Initial system provisioning and database seed executed',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            action='CHALLENGE_REVIEW',
            actor_username='prof_mthembu',
            actor_role='Administrator',
            target_object='Challenge #1',
            details='Resolved HR-TEM laboratory access with UFS bilateral booking partnership',
            ip_address='127.0.0.1'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded CUTAS database with complete relational dataset!'))
