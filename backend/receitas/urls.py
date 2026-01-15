from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaReceitaViewSet, ReceitaViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaReceitaViewSet, basename='categoria-receita')
router.register(r'', ReceitaViewSet, basename='receita')

urlpatterns = [
    path('', include(router.urls)),
]
