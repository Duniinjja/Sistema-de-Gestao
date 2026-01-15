from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

from .models import Cliente, Produto, Venda
from .serializers import (
    ClienteSerializer, ProdutoSerializer, VendaSerializer, VendaCreateSerializer
)
from usuarios.permissions import MultiTenantPermission


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated, MultiTenantPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['empresa', 'ativo']
    search_fields = ['nome', 'email', 'cpf_cnpj']

    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Cliente.objects.all()
        return Cliente.objects.filter(empresa=user.empresa)


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated, MultiTenantPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['empresa', 'ativo']
    search_fields = ['nome', 'codigo', 'descricao']

    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Produto.objects.all()
        return Produto.objects.filter(empresa=user.empresa)


class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all()
    serializer_class = VendaSerializer
    permission_classes = [IsAuthenticated, MultiTenantPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['empresa', 'cliente', 'status', 'forma_pagamento', 'data_venda']
    search_fields = ['cliente__nome', 'observacoes']
    ordering_fields = ['data_venda', 'valor_total', 'criado_em']
    ordering = ['-data_venda']

    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Venda.objects.all()
        return Venda.objects.filter(empresa=user.empresa)

    def get_serializer_class(self):
        if self.action == 'create':
            return VendaCreateSerializer
        return VendaSerializer
