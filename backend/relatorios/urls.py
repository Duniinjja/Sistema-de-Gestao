from django.urls import path
from .views import RelatorioFinanceiroView, RelatorioConsolidadoView, AnaliseReceitaView, DREView

urlpatterns = [
    path('financeiro/', RelatorioFinanceiroView.as_view(), name='relatorio-financeiro'),
    path('consolidado/', RelatorioConsolidadoView.as_view(), name='relatorio-consolidado'),
    path('analise-receita/', AnaliseReceitaView.as_view(), name='analise-receita'),
    path('dre/', DREView.as_view(), name='dre'),
]
