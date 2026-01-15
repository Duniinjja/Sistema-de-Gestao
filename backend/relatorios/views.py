from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from empresas.models import Empresa
from despesas.models import Despesa
from vendas.models import Venda
from receitas.models import Receita
from usuarios.permissions import IsAdminChefe, MultiTenantPermission


class RelatorioFinanceiroView(APIView):
    """
    Relatório financeiro de uma empresa.
    """
    permission_classes = [IsAuthenticated, MultiTenantPermission]

    def get(self, request):
        empresa_id = request.query_params.get('empresa_id')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        # Validações
        if not empresa_id:
            return Response({'error': 'empresa_id é obrigatório'}, status=400)

        # Verifica permissão
        try:
            empresa = Empresa.objects.get(id=empresa_id)
        except Empresa.DoesNotExist:
            return Response({'error': 'Empresa não encontrada'}, status=404)

        if not request.user.pode_acessar_empresa(empresa_id):
            return Response({'error': 'Sem permissão para acessar esta empresa'}, status=403)

        # Filtros de data
        if data_inicio and data_fim:
            despesas_qs = Despesa.objects.filter(
                empresa=empresa,
                data_vencimento__gte=data_inicio,
                data_vencimento__lte=data_fim
            )
            vendas_qs = Venda.objects.filter(
                empresa=empresa,
                data_venda__gte=data_inicio,
                data_venda__lte=data_fim
            )
            receitas_qs = Receita.objects.filter(
                empresa=empresa,
                data_prevista__gte=data_inicio,
                data_prevista__lte=data_fim
            )
        else:
            despesas_qs = Despesa.objects.filter(empresa=empresa)
            vendas_qs = Venda.objects.filter(empresa=empresa)
            receitas_qs = Receita.objects.filter(empresa=empresa)

        # Cálculos
        total_despesas = despesas_qs.filter(status='PAGA').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0')

        total_despesas_pendentes = despesas_qs.filter(status='PENDENTE').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0')

        total_vendas = vendas_qs.filter(status='PAGA').aggregate(
            total=Sum('valor_total')
        )['total'] or Decimal('0')

        total_vendas_pendentes = vendas_qs.filter(status='PENDENTE').aggregate(
            total=Sum('valor_total')
        )['total'] or Decimal('0')

        total_receitas = receitas_qs.filter(status='RECEBIDA').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0')

        total_receitas_pendentes = receitas_qs.filter(status='PENDENTE').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0')

        # Despesas por categoria
        despesas_por_categoria = despesas_qs.filter(status='PAGA').values(
            'categoria__nome'
        ).annotate(
            total=Sum('valor'),
            quantidade=Count('id')
        ).order_by('-total')

        # Vendas por mês (últimos 6 meses)
        hoje = timezone.now().date()
        seis_meses_atras = hoje - timedelta(days=180)
        vendas_por_mes = []
        for i in range(6):
            mes_inicio = seis_meses_atras + timedelta(days=30*i)
            mes_fim = mes_inicio + timedelta(days=30)
            total_mes = vendas_qs.filter(
                data_venda__gte=mes_inicio,
                data_venda__lt=mes_fim,
                status='PAGA'
            ).aggregate(total=Sum('valor_total'))['total'] or Decimal('0')

            vendas_por_mes.append({
                'mes': mes_inicio.strftime('%m/%Y'),
                'total': float(total_mes)
            })

        return Response({
            'empresa': {
                'id': empresa.id,
                'nome': empresa.nome
            },
            'periodo': {
                'data_inicio': data_inicio,
                'data_fim': data_fim
            },
            'resumo': {
                'total_despesas': float(total_despesas),
                'total_despesas_pendentes': float(total_despesas_pendentes),
                'total_vendas': float(total_vendas),
                'total_vendas_pendentes': float(total_vendas_pendentes),
                'total_receitas': float(total_receitas),
                'total_receitas_pendentes': float(total_receitas_pendentes),
                'saldo': float(total_receitas + total_vendas - total_despesas),
            },
            'despesas_por_categoria': list(despesas_por_categoria),
            'vendas_por_mes': vendas_por_mes,
        })


class RelatorioConsolidadoView(APIView):
    """
    Relatório consolidado de todas as empresas (apenas Admin Chefe).
    """
    permission_classes = [IsAuthenticated, IsAdminChefe]

    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        empresas = Empresa.objects.filter(ativa=True)
        relatorio_empresas = []

        for empresa in empresas:
            # Filtros de data
            if data_inicio and data_fim:
                despesas_qs = Despesa.objects.filter(
                    empresa=empresa,
                    data_vencimento__gte=data_inicio,
                    data_vencimento__lte=data_fim
                )
                vendas_qs = Venda.objects.filter(
                    empresa=empresa,
                    data_venda__gte=data_inicio,
                    data_venda__lte=data_fim
                )
                receitas_qs = Receita.objects.filter(
                    empresa=empresa,
                    data_prevista__gte=data_inicio,
                    data_prevista__lte=data_fim
                )
            else:
                despesas_qs = Despesa.objects.filter(empresa=empresa)
                vendas_qs = Venda.objects.filter(empresa=empresa)
                receitas_qs = Receita.objects.filter(empresa=empresa)

            total_despesas = despesas_qs.filter(status='PAGA').aggregate(
                total=Sum('valor')
            )['total'] or Decimal('0')

            total_vendas = vendas_qs.filter(status='PAGA').aggregate(
                total=Sum('valor_total')
            )['total'] or Decimal('0')

            total_receitas = receitas_qs.filter(status='RECEBIDA').aggregate(
                total=Sum('valor')
            )['total'] or Decimal('0')

            total_usuarios = empresa.usuarios.filter(is_active=True).count()

            relatorio_empresas.append({
                'empresa_id': empresa.id,
                'empresa_nome': empresa.nome,
                'total_usuarios': total_usuarios,
                'total_despesas': float(total_despesas),
                'total_vendas': float(total_vendas),
                'total_receitas': float(total_receitas),
                'saldo': float(total_receitas + total_vendas - total_despesas),
            })

        # Totais gerais
        total_geral_despesas = sum(e['total_despesas'] for e in relatorio_empresas)
        total_geral_vendas = sum(e['total_vendas'] for e in relatorio_empresas)
        total_geral_receitas = sum(e['total_receitas'] for e in relatorio_empresas)
        total_geral_usuarios = sum(e['total_usuarios'] for e in relatorio_empresas)

        return Response({
            'periodo': {
                'data_inicio': data_inicio,
                'data_fim': data_fim
            },
            'total_empresas': empresas.count(),
            'total_usuarios': total_geral_usuarios,
            'resumo_geral': {
                'total_despesas': total_geral_despesas,
                'total_vendas': total_geral_vendas,
                'total_receitas': total_geral_receitas,
                'saldo_geral': total_geral_receitas + total_geral_vendas - total_geral_despesas,
            },
            'empresas': relatorio_empresas,
        })
