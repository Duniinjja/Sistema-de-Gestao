from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone

from .models import Empresa
from .serializers import EmpresaSerializer, EmpresaCreateSerializer
from usuarios.permissions import IsAdminChefe, MultiTenantPermission


class EmpresaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar empresas.

    Regras:
    - Admin Chefe: pode ver e gerenciar todas as empresas
    - Admin Empresa: pode ver apenas sua própria empresa (sem editar dados sensíveis)
    - Usuário comum: pode ver apenas sua própria empresa
    """
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Define permissões baseadas na ação.
        """
        if self.action in ['create', 'destroy']:
            # Apenas Admin Chefe pode criar ou deletar empresas
            return [IsAuthenticated(), IsAdminChefe()]
        return [IsAuthenticated(), MultiTenantPermission()]

    def get_queryset(self):
        """
        Filtra empresas com base no tipo de usuário.
        """
        user = self.request.user

        # Admin Chefe vê todas as empresas
        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Empresa.objects.all()

        # Outros usuários veem apenas sua empresa
        if user.empresa:
            return Empresa.objects.filter(id=user.empresa_id)

        return Empresa.objects.none()

    def get_serializer_class(self):
        """
        Usa serializer específico para criação.
        """
        if self.action == 'create':
            return EmpresaCreateSerializer
        return EmpresaSerializer

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """
        Retorna dados do dashboard da empresa.
        """
        empresa = self.get_object()

        # Importa models aqui para evitar circular import
        from despesas.models import Despesa
        from vendas.models import Venda
        from receitas.models import Receita

        # Data de início do mês atual
        hoje = timezone.now().date()
        inicio_mes = hoje.replace(day=1)

        # Estatísticas
        total_usuarios = empresa.usuarios.filter(is_active=True).count()
        total_despesas_mes = Despesa.objects.filter(
            empresa=empresa,
            data_vencimento__gte=inicio_mes,
            status='PAGA'
        ).aggregate(total=Sum('valor'))['total'] or 0

        total_vendas_mes = Venda.objects.filter(
            empresa=empresa,
            data_venda__gte=inicio_mes,
            status='PAGA'
        ).aggregate(total=Sum('valor_total'))['total'] or 0

        total_receitas_mes = Receita.objects.filter(
            empresa=empresa,
            data_recebimento__gte=inicio_mes,
            status='RECEBIDA'
        ).aggregate(total=Sum('valor'))['total'] or 0

        # Despesas pendentes
        despesas_pendentes = Despesa.objects.filter(
            empresa=empresa,
            status='PENDENTE'
        ).count()

        return Response({
            'empresa': EmpresaSerializer(empresa).data,
            'estatisticas': {
                'total_usuarios': total_usuarios,
                'total_despesas_mes': float(total_despesas_mes),
                'total_vendas_mes': float(total_vendas_mes),
                'total_receitas_mes': float(total_receitas_mes),
                'despesas_pendentes': despesas_pendentes,
                'saldo_mes': float(total_receitas_mes + total_vendas_mes - total_despesas_mes),
            }
        })
