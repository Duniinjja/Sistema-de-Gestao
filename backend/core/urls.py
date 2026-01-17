"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API endpoints
    path('api/empresas/', include('empresas.urls')),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/despesas/', include('despesas.urls')),
    path('api/vendas/', include('vendas.urls')),
    path('api/receitas/', include('receitas.urls')),
    path('api/relatorios/', include('relatorios.urls')),
    path('api/categorias/', include('categorias.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
