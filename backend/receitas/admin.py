from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from django.utils import timezone
from .models import Receita


@admin.register(Receita)
class ReceitaAdmin(admin.ModelAdmin):
    list_display = ['descricao', 'empresa', 'categoria', 'valor_formatado',
                    'data_prevista', 'status_badge', 'dias_para_recebimento']
    list_filter = ['status', 'forma_recebimento', 'empresa', 'categoria',
                   'data_prevista', 'criado_em']
    search_fields = ['descricao', 'observacoes', 'empresa__nome']
    date_hierarchy = 'data_prevista'
    readonly_fields = ['criado_em', 'atualizado_em']
    list_per_page = 50
    list_select_related = ['empresa', 'categoria', 'usuario_cadastro']

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('empresa', 'categoria', 'descricao', 'observacoes')
        }),
        ('Valores e Datas', {
            'fields': ('valor', 'data_prevista', 'data_recebimento')
        }),
        ('Recebimento', {
            'fields': ('forma_recebimento', 'status')
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
            '<strong style="color: #388e3c;">R$ {:,.2f}</strong>',
            obj.valor
        )
    valor_formatado.short_description = 'Valor'
    valor_formatado.admin_order_field = 'valor'

    def status_badge(self, obj):
        """Exibe o status com cores"""
        colors = {
            'PREVISTA': '#2196f3',
            'RECEBIDA': '#4caf50',
            'ATRASADA': '#f44336',
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

    def dias_para_recebimento(self, obj):
        """Mostra quantos dias faltam para o recebimento"""
        if obj.status in ['RECEBIDA', 'CANCELADA']:
            return '-'

        hoje = timezone.now().date()
        dias = (obj.data_prevista - hoje).days

        if dias < 0:
            return format_html(
                '<span style="color: #f44336; font-weight: bold;">Atrasada {} dias</span>',
                abs(dias)
            )
        elif dias == 0:
            return format_html('<span style="color: #ff9800; font-weight: bold;">Recebe HOJE</span>')
        elif dias <= 7:
            return format_html(
                '<span style="color: #2196f3;">Recebe em {} dias</span>',
                dias
            )
        else:
            return format_html('<span style="color: #4caf50;">Recebe em {} dias</span>', dias)
    dias_para_recebimento.short_description = 'Previsão'

    actions = ['marcar_como_recebida', 'marcar_como_prevista', 'marcar_como_cancelada']

    def marcar_como_recebida(self, request, queryset):
        updated = queryset.update(status='RECEBIDA', data_recebimento=timezone.now().date())
        self.message_user(request, f'{updated} receita(s) marcada(s) como RECEBIDA.')
    marcar_como_recebida.short_description = 'Marcar como RECEBIDA'

    def marcar_como_prevista(self, request, queryset):
        updated = queryset.update(status='PREVISTA', data_recebimento=None)
        self.message_user(request, f'{updated} receita(s) marcada(s) como PREVISTA.')
    marcar_como_prevista.short_description = 'Marcar como PREVISTA'

    def marcar_como_cancelada(self, request, queryset):
        updated = queryset.update(status='CANCELADA')
        self.message_user(request, f'{updated} receita(s) CANCELADA(S).')
    marcar_como_cancelada.short_description = 'Marcar como CANCELADA'

    def changelist_view(self, request, extra_context=None):
        """Adiciona totalizadores na parte superior da lista"""
        extra_context = extra_context or {}

        cl = self.get_changelist_instance(request)
        queryset = cl.get_queryset(request)

        total_geral = queryset.aggregate(total=Sum('valor'))['total'] or 0
        total_prevista = queryset.filter(status='PREVISTA').aggregate(total=Sum('valor'))['total'] or 0
        total_recebida = queryset.filter(status='RECEBIDA').aggregate(total=Sum('valor'))['total'] or 0
        total_atrasada = queryset.filter(status='ATRASADA').aggregate(total=Sum('valor'))['total'] or 0

        extra_context['total_geral'] = f'R$ {total_geral:,.2f}'
        extra_context['total_prevista'] = f'R$ {total_prevista:,.2f}'
        extra_context['total_recebida'] = f'R$ {total_recebida:,.2f}'
        extra_context['total_atrasada'] = f'R$ {total_atrasada:,.2f}'
        extra_context['quantidade'] = queryset.count()

        return super().changelist_view(request, extra_context=extra_context)
