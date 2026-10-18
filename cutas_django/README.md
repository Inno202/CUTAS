# CUTAS: Central University of Technology Academic Society Portal

CUTAS is an institutional web portal engineered for postgraduate scholars (Doctoral, Master’s, and Honours) at the **Central University of Technology (Free State)** (`cut.ac.za`). 

Developed in **Python using the Django Model-View-Controller (MVC)** architectural pattern and designed to run against **PostgreSQL** in production.

---

## Strategic Society Theme
> *"Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs"*

---

## Key Features & Tabular Modules
1. **About Us** *(Admin managed)*: History, mission, and intellectual pillars at CUT.
2. **Project Leaders & Administrators** *(Admin managed)*: Governance steering committee, bios, and portfolios.
3. **Scholars Directory**: Grouped by Category A (Doctoral / Senior Fellows), Category B (Master’s), and Category C (Honours & Early Postgrads). Features in-portal viewable CVs with protected non-downloadable policies.
4. **Details on Your Studies**: Programme, commencement year, anticipated completion, university, supervisor(s), funding mechanism, research topic & abstract. **Exportable to official PDF dossier**.
5. **Publication Record**: Book chapters, peer-reviewed journal articles, and conference proceedings. Full scholar CRUD + **Exportable to official PDF record**.
6. **Challenges & Solutions**: Scholars log research bottlenecks (Turnitin similarity, funding, academic writing, lab access, ethics clearance). Administrators review, provide resolution interventions, and transition status (Open, In Review, Resolved) + **PDF Export**.
7. **Suggestions for Your Growth**: Scholar-populated developmental competency targets + **PDF Export**.
8. **Funding Available & Application Processes**: Administrator managed; also spotlighted on landing page.
9. **Awards & Recognitions**: Scholar-populated academic honours + **PDF Export**.
10. **Upcoming Workshops & Seminars**: Administrator managed dates, times, venues, and MS Teams links.
11. **Admin Governance & Annual Report**: Dashboard for Tabs 1, 2, 8, 10, challenge queue management, and **Yearly Challenge Summary Report PDF generation**.
12. **Security & Compliance**: Salted PBKDF2 password hashing, CSRF tokens, ORM-only queries, HTTP-only session cookies, secure media outside web root, scholar account & data purge confirmation, and comprehensive security audit logs.
13. **Super Administrator Data Retrieval**: Django management command (`export_cutas_data`) and JSON API export.

---

## Quickstart & Run Instructions

### 1. Prerequisites
- Python 3.10+
- PostgreSQL 14+ (or default SQLite fallback for local test evaluation)
- `pip` and `virtualenv`

### 2. Setup Virtual Environment
```bash
cd cutas_django
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. PostgreSQL Configuration
Configure database connection through environment variables. You can set `DATABASE_URL`:
```bash
export DATABASE_URL="postgresql://cutas_user:your_password@localhost:5432/cutas_db"
```
Or specify discrete parameters:
```bash
export DB_NAME="cutas_db"
export DB_USER="cutas_user"
export DB_PASSWORD="your_secure_password"
export DB_HOST="localhost"
export DB_PORT="5432"
```
*(If no PostgreSQL environment variables are specified, the project automatically uses a local `cutas_db.sqlite3` file for zero-setup local dry runs).*

### 4. Run Migrations
```bash
python manage.py makemigrations cutas_app
python manage.py migrate
```

### 5. Seed Database with Realistic Scholars & Data
Populate the database with sample Category A, B, and C scholars, publications, workshops, challenges, and institutional content:
```bash
python manage.py seed_data
```

This seeds default accounts:
- **Super Administrator**: `dev_superadmin` / `AdminPass123!`
- **Administrator / Project Leader**: `prof_mthembu` / `AdminPass123!`
- **Category A Scholar (PhD)**: `naledi_dlamini` / `ScholarPass123!`
- **Category B Scholar (MSc)**: `sipho_molefe` / `ScholarPass123!`
- **Category C Scholar (Honours)**: `thabo_motloung` / `ScholarPass123!`

### 6. Run the Development Server
```bash
python manage.py runserver 0.0.0.0:8000
```
Open `http://127.0.0.1:8000` in your web browser.

### 7. Super Administrator Data Export Command
Retrieve complete society records to JSON at any time:
```bash
python manage.py export_cutas_data --output=cutas_annual_backup.json
```

---

## Visual Identity & Branding
- **Dominant Navy**: `#003261` (CUT corporate navy)
- **Accent Yellow/Gold**: `#FBB927` (CUT gold)
- **Accent Red**: `#A12830` (CUT crimson)
- **Background**: Crisp white `#ffffff` and subtle slate `#f8fafc`
