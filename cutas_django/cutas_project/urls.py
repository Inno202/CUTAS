from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('cutas_app.api.urls')),
    path('', include('cutas_app.urls', namespace='cutas')),   # existing server-rendered site
]
