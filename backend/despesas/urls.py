from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaDespesaViewSet, DespesaViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaDespesaViewSet, basename='categoria-despesa')
router.register(r'', DespesaViewSet, basename='despesa')

urlpatterns = [
    path('', include(router.urls)),
]
