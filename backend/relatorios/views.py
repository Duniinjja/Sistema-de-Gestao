from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, Avg, F
from django.db.models.functions import TruncMonth, Coalesce
from django.utils import timezone
from datetime import timedelta, date
import calendar
from decimal import Decimal
from collections import defaultdict


def add_months(source_date, months):
    """Adiciona meses a uma data (substitui relativedelta)"""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

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


class AnaliseReceitaView(APIView):
    """
    Analise de Receita - KPIs financeiros detalhados.
    Baseado na planilha de analise com metricas como:
    - Receita Bruta
    - Descontos
    - Chargeback
    - Reversao de Chargeback
    - Receita Operacional Liquida
    - Ticket Medio
    - Variacao mes a mes
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id = request.query_params.get('empresa_id')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        meses = int(request.query_params.get('meses', 3))

        # Ignora valores invalidos como 'todos'
        if empresa_id and (empresa_id == 'todos' or not empresa_id.isdigit()):
            empresa_id = None

        # Determina se é Admin Chefe
        is_admin_chefe = request.user.tipo_usuario == 'ADMIN_CHEFE'

        # Se Admin Chefe sem empresa selecionada, pega consolidado
        is_consolidado = empresa_id is None and is_admin_chefe

        # Para usuarios normais, sempre usa a empresa do usuario
        if not is_admin_chefe:
            empresa_id = request.user.empresa_id
            is_consolidado = False

        # Se nao e consolidado e nao tem empresa, erro
        if not is_consolidado and not empresa_id:
            return Response({'error': 'Usuario nao possui empresa associada'}, status=400)

        # Base queryset
        if is_consolidado:
            vendas_base = Venda.objects.filter(empresa__ativa=True)
        else:
            # Verifica permissao (apenas para Admin Chefe acessando outra empresa)
            if is_admin_chefe and not request.user.pode_acessar_empresa(empresa_id):
                return Response({'error': 'Sem permissao para acessar esta empresa'}, status=403)
            vendas_base = Venda.objects.filter(empresa_id=empresa_id)

        # Determinar periodo
        hoje = date.today()
        if data_inicio and data_fim:
            dt_inicio = date.fromisoformat(data_inicio)
            dt_fim = date.fromisoformat(data_fim)
        else:
            # Incluir mes atual se tiver dados, senao usar ate mes anterior
            dt_fim = hoje  # Ultimo dia do mes atual
            dt_inicio = add_months(hoje, -(meses-1)).replace(day=1)

        # Dados mes a mes
        dados_mensais = []
        mes_atual = dt_inicio.replace(day=1)

        # Iterar ate o mes atual (inclusive)
        while mes_atual.replace(day=1) <= dt_fim.replace(day=1):
            prox_mes = add_months(mes_atual, 1)

            vendas_mes = vendas_base.filter(
                data_venda__gte=mes_atual,
                data_venda__lt=prox_mes
            )

            # Calculos do mes
            aggregates = vendas_mes.aggregate(
                receita_bruta=Coalesce(Sum('valor_total'), Decimal('0')),
                total_descontos=Coalesce(Sum('desconto'), Decimal('0')),
                total_chargeback=Coalesce(Sum('chargeback'), Decimal('0')),
                total_reversao_cb=Coalesce(Sum('reversao_chargeback'), Decimal('0')),
                qtde_vendas=Count('id')
            )

            receita_bruta = float(aggregates['receita_bruta'])
            descontos = float(aggregates['total_descontos'])
            chargeback = float(aggregates['total_chargeback'])
            reversao_cb = float(aggregates['total_reversao_cb'])
            qtde_vendas = aggregates['qtde_vendas']

            # Receita Liquida (antes do CB)
            receita_liquida_antes_cb = receita_bruta - descontos

            # Receita Operacional Liquida (apos CB)
            receita_operacional_liquida = receita_bruta - descontos - chargeback + reversao_cb

            # Ticket Medio
            ticket_medio = receita_bruta / qtde_vendas if qtde_vendas > 0 else 0

            # Percentuais
            perc_desconto = (descontos / receita_bruta * 100) if receita_bruta > 0 else 0
            perc_chargeback = (chargeback / receita_bruta * 100) if receita_bruta > 0 else 0
            perc_reversao_cb = (reversao_cb / receita_bruta * 100) if receita_bruta > 0 else 0

            dados_mensais.append({
                'mes': mes_atual.strftime('%b %y').upper(),
                'mes_num': mes_atual.strftime('%Y-%m'),
                'qtde_vendas': qtde_vendas,
                'receita_bruta': receita_bruta,
                'descontos': descontos,
                'descontos_perc': round(perc_desconto, 1),
                'chargeback': chargeback,
                'chargeback_perc': round(perc_chargeback, 1),
                'reversao_chargeback': reversao_cb,
                'reversao_chargeback_perc': round(perc_reversao_cb, 1),
                'receita_liquida_antes_cb': receita_liquida_antes_cb,
                'receita_operacional_liquida': receita_operacional_liquida,
                'ticket_medio': round(ticket_medio, 2),
            })

            mes_atual = prox_mes

        # Calcular variacoes mes a mes
        for i in range(1, len(dados_mensais)):
            atual = dados_mensais[i]
            anterior = dados_mensais[i-1]

            def calc_variacao(atual_val, anterior_val):
                if anterior_val == 0:
                    return 0 if atual_val == 0 else 100
                return round(((atual_val - anterior_val) / anterior_val) * 100, 1)

            atual['variacao_qtde'] = calc_variacao(atual['qtde_vendas'], anterior['qtde_vendas'])
            atual['variacao_receita_bruta'] = calc_variacao(atual['receita_bruta'], anterior['receita_bruta'])
            atual['variacao_descontos'] = calc_variacao(atual['descontos'], anterior['descontos'])
            atual['variacao_chargeback'] = calc_variacao(atual['chargeback'], anterior['chargeback'])
            atual['variacao_receita_liquida'] = calc_variacao(atual['receita_operacional_liquida'], anterior['receita_operacional_liquida'])
            atual['variacao_ticket_medio'] = atual['ticket_medio'] - anterior['ticket_medio']

        # Totais do periodo
        totais = {
            'qtde_vendas': sum(d['qtde_vendas'] for d in dados_mensais),
            'receita_bruta': sum(d['receita_bruta'] for d in dados_mensais),
            'descontos': sum(d['descontos'] for d in dados_mensais),
            'chargeback': sum(d['chargeback'] for d in dados_mensais),
            'reversao_chargeback': sum(d['reversao_chargeback'] for d in dados_mensais),
            'receita_operacional_liquida': sum(d['receita_operacional_liquida'] for d in dados_mensais),
        }

        totais['ticket_medio'] = round(totais['receita_bruta'] / totais['qtde_vendas'], 2) if totais['qtde_vendas'] > 0 else 0
        totais['descontos_perc'] = round((totais['descontos'] / totais['receita_bruta'] * 100), 1) if totais['receita_bruta'] > 0 else 0
        totais['chargeback_perc'] = round((totais['chargeback'] / totais['receita_bruta'] * 100), 1) if totais['receita_bruta'] > 0 else 0

        return Response({
            'periodo': {
                'data_inicio': dt_inicio.isoformat(),
                'data_fim': dt_fim.isoformat(),
                'meses': meses
            },
            'consolidado': is_consolidado,
            'dados_mensais': dados_mensais,
            'totais': totais
        })


class DREView(APIView):
    """
    Demonstrativo de Resultado do Exercicio (DRE).
    Calcula:
    - Receita Bruta (Vendas + Receitas)
    - Deducoes (Descontos, Chargebacks)
    - Receita Liquida
    - Custos e Despesas por categoria
    - Lucro Bruto
    - Lucro Liquido
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id = request.query_params.get('empresa_id')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        meses = int(request.query_params.get('meses', 3))

        # Ignora valores invalidos como 'todos'
        if empresa_id and (empresa_id == 'todos' or not empresa_id.isdigit()):
            empresa_id = None

        # Determina se é Admin Chefe
        is_admin_chefe = request.user.tipo_usuario == 'ADMIN_CHEFE'

        # Se Admin Chefe sem empresa selecionada, pega consolidado
        is_consolidado = empresa_id is None and is_admin_chefe

        # Para usuarios normais, sempre usa a empresa do usuario
        if not is_admin_chefe:
            empresa_id = request.user.empresa_id
            is_consolidado = False

        # Se nao e consolidado e nao tem empresa, erro
        if not is_consolidado and not empresa_id:
            return Response({'error': 'Usuario nao possui empresa associada'}, status=400)

        # Determinar periodo
        hoje = date.today()
        if data_inicio and data_fim:
            dt_inicio = date.fromisoformat(data_inicio)
            dt_fim = date.fromisoformat(data_fim)
        else:
            # Incluir mes atual se tiver dados, senao usar ate mes anterior
            dt_fim = hoje  # Ultimo dia do mes atual
            dt_inicio = add_months(hoje, -(meses-1)).replace(day=1)

        # Base querysets
        if is_consolidado:
            vendas_base = Venda.objects.filter(empresa__ativa=True)
            receitas_base = Receita.objects.filter(empresa__ativa=True)
            despesas_base = Despesa.objects.filter(empresa__ativa=True)
        else:
            vendas_base = Venda.objects.filter(empresa_id=empresa_id)
            receitas_base = Receita.objects.filter(empresa_id=empresa_id)
            despesas_base = Despesa.objects.filter(empresa_id=empresa_id)

        # Dados mes a mes
        dados_mensais = []
        mes_atual = dt_inicio.replace(day=1)

        # Iterar ate o mes atual (inclusive)
        while mes_atual.replace(day=1) <= dt_fim.replace(day=1):
            prox_mes = add_months(mes_atual, 1)

            # Vendas do mes
            vendas_mes = vendas_base.filter(
                data_venda__gte=mes_atual,
                data_venda__lt=prox_mes
            )

            # Receitas do mes (outras receitas alem de vendas)
            receitas_mes = receitas_base.filter(
                data_prevista__gte=mes_atual,
                data_prevista__lt=prox_mes,
                status='RECEBIDA'
            )

            # Despesas do mes
            despesas_mes = despesas_base.filter(
                data_vencimento__gte=mes_atual,
                data_vencimento__lt=prox_mes,
                status='PAGA'
            )

            # Agregados de vendas
            vendas_agg = vendas_mes.aggregate(
                receita_vendas=Coalesce(Sum('valor_total'), Decimal('0')),
                total_descontos=Coalesce(Sum('desconto'), Decimal('0')),
                total_chargeback=Coalesce(Sum('chargeback'), Decimal('0')),
                total_reversao_cb=Coalesce(Sum('reversao_chargeback'), Decimal('0')),
                qtde_vendas=Count('id')
            )

            # Outras receitas
            outras_receitas = float(receitas_mes.aggregate(
                total=Coalesce(Sum('valor'), Decimal('0'))
            )['total'])

            # Despesas por categoria
            despesas_por_cat = despesas_mes.values(
                'categoria__nome',
                'categoria__cor'
            ).annotate(
                total=Sum('valor')
            ).order_by('-total')

            total_despesas = float(despesas_mes.aggregate(
                total=Coalesce(Sum('valor'), Decimal('0'))
            )['total'])

            # Calculos
            receita_vendas = float(vendas_agg['receita_vendas'])
            descontos = float(vendas_agg['total_descontos'])
            chargeback = float(vendas_agg['total_chargeback'])
            reversao_cb = float(vendas_agg['total_reversao_cb'])

            # Receita Bruta = Vendas + Outras Receitas
            receita_bruta = receita_vendas + outras_receitas

            # Deducoes = Descontos + Chargeback - Reversao
            deducoes = descontos + chargeback - reversao_cb

            # Receita Liquida
            receita_liquida = receita_bruta - deducoes

            # Lucro Bruto (Receita Liquida - Custos Variaveis)
            # Por enquanto, consideramos todas as despesas como custos
            lucro_bruto = receita_liquida

            # Lucro Liquido (Receita Liquida - Total Despesas)
            lucro_liquido = receita_liquida - total_despesas

            # Margem de Lucro
            margem_bruta = (lucro_bruto / receita_bruta * 100) if receita_bruta > 0 else 0
            margem_liquida = (lucro_liquido / receita_bruta * 100) if receita_bruta > 0 else 0

            dados_mensais.append({
                'mes': mes_atual.strftime('%b %y').upper(),
                'mes_num': mes_atual.strftime('%Y-%m'),
                'receita_vendas': receita_vendas,
                'outras_receitas': outras_receitas,
                'receita_bruta': receita_bruta,
                'descontos': descontos,
                'chargeback': chargeback,
                'reversao_chargeback': reversao_cb,
                'deducoes': deducoes,
                'receita_liquida': receita_liquida,
                'despesas_por_categoria': [
                    {
                        'categoria': d['categoria__nome'] or 'Sem categoria',
                        'cor': d['categoria__cor'] or '#666666',
                        'valor': float(d['total'])
                    }
                    for d in despesas_por_cat
                ],
                'total_despesas': total_despesas,
                'lucro_bruto': lucro_bruto,
                'lucro_liquido': lucro_liquido,
                'margem_bruta': round(margem_bruta, 1),
                'margem_liquida': round(margem_liquida, 1),
            })

            mes_atual = prox_mes

        # Calcular variacoes mes a mes
        for i in range(1, len(dados_mensais)):
            atual = dados_mensais[i]
            anterior = dados_mensais[i-1]

            def calc_variacao(atual_val, anterior_val):
                if anterior_val == 0:
                    return 0 if atual_val == 0 else 100
                return round(((atual_val - anterior_val) / anterior_val) * 100, 1)

            atual['variacao_receita'] = calc_variacao(atual['receita_bruta'], anterior['receita_bruta'])
            atual['variacao_despesas'] = calc_variacao(atual['total_despesas'], anterior['total_despesas'])
            atual['variacao_lucro'] = calc_variacao(atual['lucro_liquido'], anterior['lucro_liquido'])

        # Totais do periodo
        totais = {
            'receita_vendas': sum(d['receita_vendas'] for d in dados_mensais),
            'outras_receitas': sum(d['outras_receitas'] for d in dados_mensais),
            'receita_bruta': sum(d['receita_bruta'] for d in dados_mensais),
            'descontos': sum(d['descontos'] for d in dados_mensais),
            'chargeback': sum(d['chargeback'] for d in dados_mensais),
            'reversao_chargeback': sum(d['reversao_chargeback'] for d in dados_mensais),
            'deducoes': sum(d['deducoes'] for d in dados_mensais),
            'receita_liquida': sum(d['receita_liquida'] for d in dados_mensais),
            'total_despesas': sum(d['total_despesas'] for d in dados_mensais),
            'lucro_bruto': sum(d['lucro_bruto'] for d in dados_mensais),
            'lucro_liquido': sum(d['lucro_liquido'] for d in dados_mensais),
        }

        # Consolidar despesas por categoria no periodo
        despesas_consolidadas = defaultdict(lambda: {'valor': 0, 'cor': '#666666'})
        for mes in dados_mensais:
            for cat in mes['despesas_por_categoria']:
                despesas_consolidadas[cat['categoria']]['valor'] += cat['valor']
                despesas_consolidadas[cat['categoria']]['cor'] = cat['cor']

        totais['despesas_por_categoria'] = [
            {'categoria': k, 'valor': v['valor'], 'cor': v['cor']}
            for k, v in sorted(despesas_consolidadas.items(), key=lambda x: -x[1]['valor'])
        ]

        totais['margem_bruta'] = round((totais['lucro_bruto'] / totais['receita_bruta'] * 100), 1) if totais['receita_bruta'] > 0 else 0
        totais['margem_liquida'] = round((totais['lucro_liquido'] / totais['receita_bruta'] * 100), 1) if totais['receita_bruta'] > 0 else 0

        return Response({
            'periodo': {
                'data_inicio': dt_inicio.isoformat(),
                'data_fim': dt_fim.isoformat(),
                'meses': meses
            },
            'consolidado': is_consolidado,
            'dados_mensais': dados_mensais,
            'totais': totais
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
