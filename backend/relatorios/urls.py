from django.urls import path
from .views import RelatorioFinanceiroView, RelatorioConsolidadoView

urlpatterns = [
    path('financeiro/', RelatorioFinanceiroView.as_view(), name='relatorio-financeiro'),
    path('consolidado/', RelatorioConsolidadoView.as_view(), name='relatorio-consolidado'),
]
