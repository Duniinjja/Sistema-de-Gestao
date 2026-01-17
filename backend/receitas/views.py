from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

from .models import Receita
from .serializers import ReceitaSerializer
from usuarios.permissions import MultiTenantPermission


class ReceitaViewSet(viewsets.ModelViewSet):
    queryset = Receita.objects.all()
    serializer_class = ReceitaSerializer
    permission_classes = [IsAuthenticated, MultiTenantPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['empresa', 'categoria', 'status', 'forma_recebimento', 'data_prevista']
    search_fields = ['descricao', 'observacoes']
    ordering_fields = ['data_prevista', 'valor', 'criado_em']
    ordering = ['-data_prevista']

    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Receita.objects.all()
        return Receita.objects.filter(empresa=user.empresa)
