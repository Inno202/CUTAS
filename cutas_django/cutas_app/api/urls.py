from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views as v

router = DefaultRouter()
router.register('publications', v.PublicationViewSet, basename='publication')
router.register('growth', v.GrowthViewSet, basename='growth')
router.register('awards', v.AwardViewSet, basename='award')
router.register('challenges', v.ChallengeViewSet, basename='challenge')
router.register('funding', v.FundingViewSet, basename='funding')
router.register('workshops', v.WorkshopViewSet, basename='workshop')
router.register('admin/users', v.AdminUserViewSet, basename='admin-user')

urlpatterns = [
    # auth & account
    path('auth/register/', v.RegisterView.as_view()),
    path('auth/login/', v.LoginView.as_view()),
    path('auth/refresh/', v.RefreshView.as_view()),
    path('auth/logout/', v.LogoutView.as_view()),
    path('auth/password/change/', v.ChangePasswordView.as_view()),
    path('auth/me/', v.MeView.as_view()),
    # public
    path('landing/', v.landing),
    path('leaders/', v.LeadersView.as_view()),
    path('content/<slug:key>/', v.ContentView.as_view()),
    # profile & directory
    path('profile/me/', v.MyProfileView.as_view()),
    path('profile/me/cv-file/', v.MyCvFileView.as_view()),
    path('scholars/', v.ScholarListView.as_view()),
    path('scholars/<int:pk>/', v.ScholarDetailView.as_view()),
    path('scholars/<int:pk>/picture/', v.ScholarPictureView.as_view()),
    # own study record
    path('study/me/', v.StudyView.as_view()),
    path('study/me/pdf/', v.StudyPdfView.as_view()),
    # admin console
    path('admin/scholars/<int:pk>/category/', v.AdminScholarCategoryView.as_view()),
    path('admin/growth/<int:pk>/mentor-note/', v.MentorNoteView.as_view()),
    path('admin/reports/annual/', v.AnnualReportView.as_view()),
    path('admin/reports/annual/pdf/', v.AnnualReportPdfView.as_view()),
    path('admin/audit-logs/', v.AuditLogView.as_view()),
    path('admin/export/', v.ExportView.as_view()),
    path('', include(router.urls)),
]
