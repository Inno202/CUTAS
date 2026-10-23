# CUTAS REST API (Django + PostgreSQL + JWT)

## 1. Install
Copy these files over your repo (same paths), apply `cutas_app/models_patch.md` to `models.py`, then:

    pip install -r requirements.txt
    export DJANGO_DEBUG=true            # local only
    export DJANGO_SECRET_KEY=...        # REQUIRED when DEBUG is not true
    export DATABASE_URL=postgresql://cutas_user:PASSWORD@localhost:5432/cutas_db
    python manage.py migrate
    python manage.py seed_api_data      # demo users; passwords from SEED_* env vars, defaults only in DEBUG
    python manage.py test cutas_app.tests_api     # 18 tests
    python manage.py runserver 8000

Seeded logins (DEBUG defaults): `naledi_dlamini` / `ScholarPass123!` (Cat A scholar), `prof_mthembu` / `AdminPass123!` (Administrator), `dev_superadmin` / `AdminPass123!` (Super Admin).

## 2. Postman
Import `postman/cutas.postman_collection.json` and `postman/cutas.postman_environment.json`, select the "CUTAS local" environment,
then run the collection (Runner, folders 0 to 9 in order). 85 requests, 111 assertions. Tokens are saved automatically.
Throttles: login 10/min, register 10/hour per IP (override with THROTTLE_LOGIN / THROTTLE_REGISTER). A 429 means wait.

## 3. Tables (PostgreSQL)
cutas_app_user, scholarprofile, studydetails, publication, challenge, growthsuggestion, award, fundingopportunity, workshop,
institutionalcontent, auditlog, plus token_blacklist_* (revoked refresh tokens).

## 4. Endpoints (`/api/v1`)
| Area | Endpoint | Who |
|---|---|---|
| Auth | POST auth/register, auth/login, auth/refresh, auth/logout, auth/password/change; GET/PATCH/DELETE auth/me | public / logged in |
| Landing | GET landing, leaders, content/{about_us,project_leaders,landing_intro} | public |
| Directory | GET scholars (?category=CAT_A&search=), scholars/{id}, scholars/{id}/picture | logged in |
| Profile | GET/PATCH profile/me (multipart: profile_picture, cv_file), profile/me/cv-file | owner |
| Study | GET/PATCH study/me, GET study/me/pdf | owner |
| Publications, Growth, Awards | CRUD `publications/`, `growth/`, `awards/` + GET `.../pdf/` | owner only |
| Challenges | GET/POST challenges/, GET challenges/{id}, GET challenges/pdf | scholar (own) |
| Challenges (admin) | GET challenges/?scope=all&status=OPEN, PATCH challenges/{id}/review/ | admin |
| Funding, Workshops | public GET (published only); POST/PATCH/DELETE `funding/`, `workshops/` | admin |
| Content | PUT content/{key} | admin |
| Admin | PATCH admin/scholars/{id}/category, admin/growth/{id}/mentor-note, GET admin/reports/annual[/pdf]?year= | admin |
| Super admin | GET admin/audit-logs, admin/export; admin/users (create admins, change roles, deactivate) | super admin |

## 5. Problems found in the pushed code (fixed here unless noted)
1. `seed_data.py` uses `timezone` without importing it: crashes on first run. (Not touched; use `seed_api_data`.)
2. `AuditLog.actor_role` max 30, but the Super Admin role label is 36 chars: Postgres rejects the audit insert on super-admin login. Widened to 60.
3. `ScholarProfileForm` includes `category`: a scholar can promote themselves to Category A. API makes category read-only for scholars (admins assign it).
4. `ScholarRegistrationForm` lets the registrant pick their category. API ignores it (default Cat B, admin assigns).
5. PDF views put raw user text in reportlab `Paragraph`: a `<` or `&` in a title crashes the PDF or injects markup. API escapes everything. (Old views.py still has this.)
6. `annual_challenges_report_pdf` reads `?year=` but never filters by it. API filters by year and validates it.
7. Settings: insecure default `SECRET_KEY`, `DEBUG` defaulting to True, `ALLOWED_HOSTS='*'`, `argon2-cffi` missing from requirements. Fixed in the shipped settings.py.
8. `MEDIA_ROOT` is outside the web root but nothing serves it, so `profile_picture.url` links break. API serves pictures only to logged-in users; other people's CV files are never downloadable.
9. Uploads were extension-only checks. API now verifies the bytes (real image, `%PDF-` header).

## 6. Not yet done / needs a decision
- The React app still runs on in-memory seed data with a fake login (any password of 6+ characters is accepted, and the admin 2FA code is not checked). It must be switched to call this API; that is the next step.
- Workshop time: React uses free text ("10:00 - 12:30"), the database uses a real time field. The React form should use a time input.
- Admin 2FA (TOTP) is not implemented on the backend.
- Email for password reset is not implemented (needs an SMTP/email provider).
