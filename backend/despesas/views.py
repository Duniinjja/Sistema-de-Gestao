from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

from .models import Despesa
from .serializers import DespesaSerializer
from usuarios.permissions import MultiTenantPermission


class DespesaViewSet(viewsets.ModelViewSet):
    queryset = Despesa.objects.all()
    serializer_class = DespesaSerializer
    permission_classes = [IsAuthenticated, MultiTenantPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['empresa', 'categoria', 'status', 'forma_pagamento', 'data_vencimento']
    search_fields = ['descricao', 'observacoes']
    ordering_fields = ['data_vencimento', 'valor', 'criado_em']
    ordering = ['-data_vencimento']

    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Despesa.objects.all()
        return Despesa.objects.filter(empresa=user.empresa)
