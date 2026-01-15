from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.utils import timezone
from .models import CategoriaDespesa, Despesa


@admin.register(CategoriaDespesa)
class CategoriaDespesaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'empresa', 'total_despesas', 'ativa', 'criado_em']
    list_filter = ['ativa', 'empresa', 'criado_em']
    search_fields = ['nome', 'descricao']
    list_per_page = 25

    def total_despesas(self, obj):
        """Mostra o total de despesas nesta categoria"""
        total = obj.despesas.count()
        return f"{total} despesas"
    total_despesas.short_description = 'Total de Despesas'

    actions = ['ativar_categorias', 'desativar_categorias']

    def ativar_categorias(self, request, queryset):
        updated = queryset.update(ativa=True)
        self.message_user(request, f'{updated} categoria(s) ativada(s) com sucesso.')
    ativar_categorias.short_description = 'Ativar categorias selecionadas'

    def desativar_categorias(self, request, queryset):
        updated = queryset.update(ativa=False)
        self.message_user(request, f'{updated} categoria(s) desativada(s) com sucesso.')
    desativar_categorias.short_description = 'Desativar categorias selecionadas'


@admin.register(Despesa)
class DespesaAdmin(admin.ModelAdmin):
    list_display = ['descricao', 'empresa', 'categoria', 'valor_formatado',
                    'data_vencimento', 'status_badge', 'dias_para_vencimento']
    list_filter = ['status', 'forma_pagamento', 'empresa', 'categoria',
                   'data_vencimento', 'criado_em']
    search_fields = ['descricao', 'observacoes', 'empresa__nome']
    date_hierarchy = 'data_vencimento'
    readonly_fields = ['criado_em', 'atualizado_em']
    list_per_page = 50
    list_select_related = ['empresa', 'categoria', 'usuario_cadastro']

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('empresa', 'categoria', 'descricao', 'observacoes')
        }),
        ('Valores e Datas', {
            'fields': ('valor', 'data_vencimento', 'data_pagamento')
        }),
        ('Pagamento', {
            'fields': ('forma_pagamento', 'status')
        }),
        ('Anexos', {
            'fields': ('anexo',),
            'classes': ('collapse',)
        }),
        ('Controle', {
            'fields': ('usuario_cadastro', 'criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )

    def valor_formatado(self, obj):
        """Formata o valor em reais"""
        return format_html(
            '<strong style="color: #d32f2f;">R$ {:,.2f}</strong>',
            obj.valor
        )
    valor_formatado.short_description = 'Valor'
    valor_formatado.admin_order_field = 'valor'

    def status_badge(self, obj):
        """Exibe o status com cores"""
        colors = {
            'PENDENTE': '#ff9800',
            'PAGA': '#4caf50',
            'VENCIDA': '#f44336',
            'CANCELADA': '#9e9e9e'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#000'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    def dias_para_vencimento(self, obj):
        """Mostra quantos dias faltam para o vencimento"""
        if obj.status in ['PAGA', 'CANCELADA']:
            return '-'

        hoje = timezone.now().date()
        dias = (obj.data_vencimento - hoje).days

        if dias < 0:
            return format_html(
                '<span style="color: #f44336; font-weight: bold;">Vencida há {} dias</span>',
                abs(dias)
            )
        elif dias == 0:
            return format_html('<span style="color: #ff9800; font-weight: bold;">Vence HOJE</span>')
        elif dias <= 7:
            return format_html(
                '<span style="color: #ff9800;">Vence em {} dias</span>',
                dias
            )
        else:
            return format_html('<span style="color: #4caf50;">Vence em {} dias</span>', dias)
    dias_para_vencimento.short_description = 'Vencimento'

    actions = ['marcar_como_paga', 'marcar_como_pendente', 'marcar_como_cancelada']

    def marcar_como_paga(self, request, queryset):
        updated = queryset.update(status='PAGA', data_pagamento=timezone.now().date())
        self.message_user(request, f'{updated} despesa(s) marcada(s) como PAGA.')
    marcar_como_paga.short_description = 'Marcar como PAGA'

    def marcar_como_pendente(self, request, queryset):
        updated = queryset.update(status='PENDENTE', data_pagamento=None)
        self.message_user(request, f'{updated} despesa(s) marcada(s) como PENDENTE.')
    marcar_como_pendente.short_description = 'Marcar como PENDENTE'

    def marcar_como_cancelada(self, request, queryset):
        updated = queryset.update(status='CANCELADA')
        self.message_user(request, f'{updated} despesa(s) CANCELADA(S).')
    marcar_como_cancelada.short_description = 'Marcar como CANCELADA'

    def changelist_view(self, request, extra_context=None):
        """Adiciona totalizadores na parte superior da lista"""
        extra_context = extra_context or {}

        # Filtra despesas de acordo com os filtros aplicados
        cl = self.get_changelist_instance(request)
        queryset = cl.get_queryset(request)

        # Calcula totais
        total_geral = queryset.aggregate(total=Sum('valor'))['total'] or 0
        total_pendente = queryset.filter(status='PENDENTE').aggregate(total=Sum('valor'))['total'] or 0
        total_paga = queryset.filter(status='PAGA').aggregate(total=Sum('valor'))['total'] or 0
        total_vencida = queryset.filter(status='VENCIDA').aggregate(total=Sum('valor'))['total'] or 0

        extra_context['total_geral'] = f'R$ {total_geral:,.2f}'
        extra_context['total_pendente'] = f'R$ {total_pendente:,.2f}'
        extra_context['total_paga'] = f'R$ {total_paga:,.2f}'
        extra_context['total_vencida'] = f'R$ {total_vencida:,.2f}'
        extra_context['quantidade'] = queryset.count()

        return super().changelist_view(request, extra_context=extra_context)
