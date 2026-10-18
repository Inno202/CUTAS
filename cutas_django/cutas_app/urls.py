from django.urls import path
from . import views

app_name = 'cutas'

urlpatterns = [
    # Landing & Institutional Pages
    path('', views.landing_view, name='landing'),
    path('about/', views.about_view, name='about'),
    path('leaders/', views.leaders_view, name='leaders'),

    # Authentication & Account Lifecycle
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('account/password/', views.password_change_view, name='change_password'),
    path('account/delete/', views.delete_account_view, name='delete_account'),

    # Tab 3: Scholars Directory & In-Portal Protected CV Viewer
    path('scholars/', views.scholars_list_view, name='scholars_list'),
    path('scholars/<int:profile_id>/cv/', views.view_scholar_cv, name='view_scholar_cv'),
    path('profile/edit/', views.update_profile_view, name='edit_profile'),

    # Tab 4: Details on Your Studies & PDF
    path('studies/', views.study_details_view, name='study_details'),
    path('studies/pdf/', views.study_details_pdf, name='study_details_pdf'),

    # Tab 5: Publication Record & PDF
    path('publications/', views.publications_view, name='publications'),
    path('publications/<int:pub_id>/edit/', views.edit_publication_view, name='edit_publication'),
    path('publications/<int:pub_id>/delete/', views.delete_publication_view, name='delete_publication'),
    path('publications/pdf/', views.publications_pdf, name='publications_pdf'),

    # Tab 6: Challenges & Solutions & PDF
    path('challenges/', views.challenges_view, name='challenges'),
    path('challenges/<int:challenge_id>/review/', views.review_challenge_view, name='review_challenge'),
    path('challenges/pdf/', views.challenges_pdf, name='challenges_pdf'),

    # Tab 7: Suggestions for Your Growth & PDF
    path('growth/', views.growth_view, name='growth'),
    path('growth/pdf/', views.growth_pdf, name='growth_pdf'),

    # Tab 8: Funding Available & Application Processes
    path('funding/', views.funding_view, name='funding'),
    path('funding/add/', views.add_funding_view, name='add_funding'),
    path('funding/<int:funding_id>/edit/', views.edit_funding_view, name='edit_funding'),

    # Tab 9: Awards & Recognitions & PDF
    path('awards/', views.awards_view, name='awards'),
    path('awards/pdf/', views.awards_pdf, name='awards_pdf'),

    # Tab 10: Upcoming Workshops & Seminars
    path('workshops/', views.workshops_view, name='workshops'),
    path('workshops/add/', views.add_workshop_view, name='add_workshop'),
    path('workshops/<int:workshop_id>/edit/', views.edit_workshop_view, name='edit_workshop'),

    # Administrator Management & Yearly Report
    path('portal-admin/', views.admin_dashboard_view, name='admin_dashboard'),
    path('portal-admin/content/<slug:key>/edit/', views.edit_page_content_view, name='edit_content'),
    path('portal-admin/annual-report/pdf/', views.annual_challenges_report_pdf, name='annual_report_pdf'),

    # Super Administrator Data Retrieval
    path('export/data/', views.export_cutas_data_view, name='export_data'),
]
