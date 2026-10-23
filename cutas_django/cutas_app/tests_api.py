from datetime import date, timedelta

from django.core.cache import cache
from rest_framework.test import APITestCase

from cutas_app.models import AuditLog, Challenge, User

B = '/api/v1/'
PW = 'Str0ng!Passw0rd#1'


class ApiBase(APITestCase):
    def setUp(self):
        cache.clear()  # reset rate-limit counters so every test starts fresh

    @classmethod
    def setUpTestData(cls):
        cls.sup = User.objects.create_user('sup', 'sup@x.ac.za', PW, role='SUPERADMIN', is_superuser=True, is_staff=True)
        cls.adm = User.objects.create_user('adm', 'adm@x.ac.za', PW, role='ADMIN', is_staff=True)

    def reg(self, name='alice'):
        r = self.client.post(B + 'auth/register/', {
            'username': name, 'email': f'{name}@x.ac.za', 'first_name': 'A', 'last_name': 'B',
            'password': PW, 'password2': PW, 'agree_terms': True}, format='json')
        self.assertEqual(r.status_code, 201, r.content)
        return r

    def login(self, name, pw=PW):
        r = self.client.post(B + 'auth/login/', {'username': name, 'password': pw}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + r.data['access'])
        return r.data

    def as_(self, name):
        self.client.credentials()
        return self.login(name)


class AuthTests(ApiBase):
    def test_register_ignores_role_and_category(self):
        r = self.client.post(B + 'auth/register/', {
            'username': 'eve', 'email': 'eve@x.ac.za', 'first_name': 'E', 'last_name': 'V', 'password': PW,
            'password2': PW, 'agree_terms': True, 'role': 'SUPERADMIN', 'category': 'CAT_A'}, format='json')
        self.assertEqual(r.status_code, 201)
        u = User.objects.get(username='eve')
        self.assertEqual(u.role, 'SCHOLAR')
        self.assertEqual(u.profile.category, 'CAT_B')
        self.assertTrue(hasattr(u, 'study_details'))

    def test_weak_and_duplicate(self):
        r = self.client.post(B + 'auth/register/', {'username': 'x1', 'email': 'x@x.ac.za', 'first_name': 'a', 'last_name': 'b',
                                                    'password': 'password', 'password2': 'password', 'agree_terms': True}, format='json')
        self.assertEqual(r.status_code, 400)
        self.reg('dup')
        r = self.client.post(B + 'auth/register/', {'username': 'DUP', 'email': 'dup@x.ac.za', 'first_name': 'a', 'last_name': 'b',
                                                    'password': PW, 'password2': PW, 'agree_terms': True}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_login_refresh_logout(self):
        self.reg()
        tok = self.login('alice')
        self.assertIn('refresh', tok)
        r = self.client.post(B + 'auth/logout/', {'refresh': tok['refresh']}, format='json')
        self.assertEqual(r.status_code, 204)
        r = self.client.post(B + 'auth/refresh/', {'refresh': tok['refresh']}, format='json')
        self.assertEqual(r.status_code, 401)

    def test_unauthenticated_blocked(self):
        for p in ['auth/me/', 'study/me/', 'publications/', 'challenges/', 'scholars/', 'admin/export/']:
            self.assertEqual(self.client.get(B + p).status_code, 401, p)

    def test_delete_account(self):
        self.reg()
        self.login('alice')
        r = self.client.delete(B + 'auth/me/', {'password': 'wrong', 'confirmation': 'DELETE'}, format='json')
        self.assertEqual(r.status_code, 400)
        r = self.client.delete(B + 'auth/me/', {'password': PW, 'confirmation': 'DELETE'}, format='json')
        self.assertEqual(r.status_code, 204)
        self.assertFalse(User.objects.filter(username='alice').exists())

    def test_admin_cannot_self_delete(self):
        self.login('adm')
        r = self.client.delete(B + 'auth/me/', {'password': PW, 'confirmation': 'DELETE'}, format='json')
        self.assertEqual(r.status_code, 403)


class ScholarDataTests(ApiBase):
    def test_isolation_between_scholars(self):
        self.reg('alice'); self.reg('bob')
        self.login('alice')
        pub = self.client.post(B + 'publications/', {'title': 'T', 'authors': 'A', 'outlet_name': 'J', 'year': 2025,
                                                      'publication_type': 'ARTICLE', 'status': 'PUBLISHED'}, format='json')
        self.assertEqual(pub.status_code, 201)
        pid = pub.data['id']
        self.login('bob')
        self.assertEqual(self.client.get(B + 'publications/').data, [])
        self.assertEqual(self.client.get(B + f'publications/{pid}/').status_code, 404)
        self.assertEqual(self.client.delete(B + f'publications/{pid}/').status_code, 404)
        self.assertEqual(self.client.patch(B + f'publications/{pid}/', {'title': 'X'}, format='json').status_code, 404)

    def test_category_cannot_be_self_assigned(self):
        self.reg()
        self.login('alice')
        self.client.patch(B + 'profile/me/', {'category': 'CAT_A', 'bio': 'hi'}, format='json')
        self.assertEqual(self.client.get(B + 'profile/me/').data['category'], 'CAT_B')
        self.assertEqual(self.client.get(B + 'profile/me/').data['bio'], 'hi')

    def test_study_update_and_validation(self):
        self.reg(); self.login('alice')
        r = self.client.patch(B + 'study/me/', {'year_of_starting': 2025, 'anticipated_year_of_completion': 2024}, format='json')
        self.assertEqual(r.status_code, 400)
        r = self.client.patch(B + 'study/me/', {'programme': 'MEng', 'year_of_starting': 2024, 'anticipated_year_of_completion': 2026}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['programme'], 'MEng')

    def test_pdfs_with_hostile_text(self):
        self.reg(); self.login('alice')
        self.client.post(B + 'publications/', {'title': '<b>bad & <script>', 'authors': 'A < B', 'outlet_name': 'J&J', 'year': 2024,
                                               'publication_type': 'ARTICLE', 'status': 'PUBLISHED'}, format='json')
        self.client.post(B + 'awards/', {'title': 'Prize <x>', 'awarding_body': 'Body & Co', 'year': 2024}, format='json')
        self.client.post(B + 'growth/', {'area': 'WRITING', 'growth_objective': 'g', 'milestone_actions': '1 < 2'}, format='json')
        self.client.post(B + 'challenges/', {'category': 'OTHER', 'title': 't & <u>', 'description': 'd'}, format='json')
        for p in ['publications/pdf/', 'awards/pdf/', 'growth/pdf/', 'challenges/pdf/', 'study/me/pdf/']:
            r = self.client.get(B + p)
            self.assertEqual(r.status_code, 200, p)
            self.assertTrue(r.content.startswith(b'%PDF'), p)

    def test_bad_doi_scheme_rejected(self):
        self.reg(); self.login('alice')
        r = self.client.post(B + 'publications/', {'title': 'T', 'authors': 'A', 'outlet_name': 'J', 'year': 2025,
                                                    'doi_or_url': 'javascript:alert(1)'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_directory_hides_private_fields(self):
        self.reg('alice'); self.reg('bob')
        self.login('alice')
        d = self.client.get(B + 'scholars/').data
        self.assertIn('counts', d)
        row = d['results'][0]
        self.assertNotIn('student_number', row); self.assertNotIn('phone_number', row); self.assertNotIn('email', row)
        self.login('adm')
        self.assertIn('student_number', self.client.get(B + 'scholars/').data['results'][0])


class ChallengeFlowTests(ApiBase):
    def test_full_lifecycle_and_permissions(self):
        self.reg('alice'); self.reg('bob')
        self.login('alice')
        r = self.client.post(B + 'challenges/', {'category': 'TURNITIN', 'title': 'Similarity', 'description': 'x',
                                                  'status': 'RESOLVED', 'resolution_notes': 'cheat'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data['status'], 'OPEN')
        self.assertEqual(r.data['resolution_notes'], '')
        cid = r.data['id']
        # scholar cannot review
        self.assertEqual(self.client.patch(B + f'challenges/{cid}/review/', {'status': 'RESOLVED', 'resolution_notes': 'x'}, format='json').status_code, 403)
        # other scholar can't see it
        self.login('bob')
        self.assertEqual(self.client.get(B + 'challenges/').data, [])
        self.assertEqual(self.client.get(B + 'challenges/?scope=all').data, [])
        # admin sees all, requires notes to resolve
        self.login('adm')
        self.assertEqual(len(self.client.get(B + 'challenges/?scope=all').data), 1)
        self.assertEqual(self.client.patch(B + f'challenges/{cid}/review/', {'status': 'RESOLVED'}, format='json').status_code, 400)
        r = self.client.patch(B + f'challenges/{cid}/review/', {'status': 'RESOLVED', 'resolution_notes': 'Waiver issued'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['status'], 'RESOLVED'); self.assertIsNotNone(r.data['resolved_at'])
        # scholar sees resolution
        self.login('alice')
        self.assertEqual(self.client.get(B + f'challenges/{cid}/').data['resolution_notes'], 'Waiver issued')
        self.assertTrue(AuditLog.objects.filter(action='CHALLENGE_REVIEW').exists())

    def test_annual_report_filters_year(self):
        self.reg('alice'); self.login('alice')
        self.client.post(B + 'challenges/', {'category': 'FUNDING', 'title': 't', 'description': 'd'}, format='json')
        Challenge.objects.update(created_at='2020-05-01T00:00:00Z')
        self.login('adm')
        self.assertEqual(self.client.get(B + 'admin/reports/annual/?year=2020').data['total'], 1)
        self.assertEqual(self.client.get(B + 'admin/reports/annual/?year=2021').data['total'], 0)
        self.assertEqual(self.client.get(B + 'admin/reports/annual/?year=abc').status_code, 400)
        r = self.client.get(B + 'admin/reports/annual/pdf/?year=2020')
        self.assertTrue(r.content.startswith(b'%PDF'))
        self.login('sup'); self.assertEqual(self.client.get(B + 'admin/reports/annual/').status_code, 200)

    def test_scholar_blocked_from_admin_endpoints(self):
        self.reg(); self.login('alice')
        for p in ['admin/reports/annual/', 'admin/audit-logs/', 'admin/export/', 'admin/users/']:
            self.assertEqual(self.client.get(B + p).status_code, 403, p)


class AdminContentTests(ApiBase):
    def test_funding_public_read_admin_write_and_drafts(self):
        payload = {'title': 'F', 'funder': 'NRF', 'amount_range': 'R1', 'deadline': str(date.today() + timedelta(days=5)),
                   'eligibility': 'e', 'application_process': 'p', 'portal_url': 'https://x.org'}
        self.assertEqual(self.client.post(B + 'funding/', payload, format='json').status_code, 401)
        self.reg(); self.login('alice')
        self.assertEqual(self.client.post(B + 'funding/', payload, format='json').status_code, 403)
        self.login('adm')
        r = self.client.post(B + 'funding/', {**payload, 'status': 'DRAFT'}, format='json')
        self.assertEqual(r.status_code, 201); fid = r.data['id']
        self.client.credentials()
        self.assertEqual(self.client.get(B + 'funding/').data, [])                 # draft hidden from public
        self.assertEqual(self.client.get(B + f'funding/{fid}/').status_code, 404)
        self.login('adm')
        self.client.patch(B + f'funding/{fid}/', {'status': 'PUBLISHED'}, format='json')
        self.client.credentials()
        self.assertEqual(len(self.client.get(B + 'funding/').data), 1)
        self.assertEqual(len(self.client.get(B + 'landing/').data['featured_funding']), 1)
        bad = self.client.post(B + 'funding/', {**payload, 'portal_url': 'javascript:x'}, format='json')
        self.assertIn(bad.status_code, (400, 401))

    def test_workshops_and_content(self):
        self.login('adm')
        r = self.client.post(B + 'workshops/', {'title': 'W', 'facilitator': 'F', 'event_date': str(date.today() + timedelta(days=3)),
                                                'event_time': '10:00', 'venue_or_link': 'Room', 'description': 'd'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.client.credentials()
        self.assertEqual(len(self.client.get(B + 'workshops/?when=upcoming').data), 1)
        self.assertEqual(self.client.put(B + 'content/about_us/', {'title': 't', 'body': 'b'}, format='json').status_code, 401)
        self.login('adm')
        self.assertEqual(self.client.put(B + 'content/about_us/', {'title': 'About', 'headline': 'h', 'body': 'b'}, format='json').status_code, 200)
        self.assertEqual(self.client.put(B + 'content/evil_key/', {'title': 't', 'body': 'b'}, format='json').status_code, 404)
        self.client.credentials()
        self.assertEqual(self.client.get(B + 'content/about_us/').data['title'], 'About')

    def test_super_admin_user_management_and_category(self):
        self.reg('alice'); alice = User.objects.get(username='alice')
        self.login('adm')
        self.assertEqual(self.client.post(B + 'admin/users/', {'username': 'n', 'password': PW, 'role': 'ADMIN'}, format='json').status_code, 403)
        r = self.client.patch(B + f'admin/scholars/{alice.id}/category/', {'category': 'CAT_A'}, format='json')
        self.assertEqual(r.status_code, 200)
        alice.profile.refresh_from_db(); self.assertEqual(alice.profile.category, 'CAT_A')
        self.login('sup')
        r = self.client.post(B + 'admin/users/', {'username': 'newadmin', 'email': 'n@x.ac.za', 'password': PW, 'role': 'ADMIN'}, format='json')
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(self.client.patch(B + f'admin/users/{self.sup.id}/', {'is_active': False}, format='json').status_code, 400)
        self.assertEqual(self.client.get(B + 'admin/audit-logs/').status_code, 200)
        ex = self.client.get(B + 'admin/export/')
        self.assertEqual(ex.status_code, 200)
        self.assertNotIn('password', str(ex.data['users']))
