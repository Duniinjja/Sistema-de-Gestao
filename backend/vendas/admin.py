from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from .models import Cliente, Produto, Venda, ItemVenda


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nome', 'empresa', 'email', 'telefone', 'cidade', 'total_compras', 'status_badge']
    list_filter = ['ativo', 'empresa', 'estado', 'criado_em']
    search_fields = ['nome', 'email', 'cpf_cnpj']
    list_per_page = 50

    def total_compras(self, obj):
        """Mostra total de compras do cliente"""
        count = obj.vendas.count()
        valor = obj.vendas.aggregate(total=Sum('valor_total'))['total'] or 0
        return format_html(
            '<span style="color: #1976d2;">{} vendas | R$ {:,.2f}</span>',
            count, valor
        )
    total_compras.short_description = 'Total de Compras'

    def status_badge(self, obj):
        """Badge de status ativo/inativo"""
        if obj.ativo:
            return format_html(
                '<span style="background-color: #4caf50; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">ATIVO</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #9e9e9e; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">INATIVO</span>'
            )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'ativo'

    actions = ['ativar_clientes', 'desativar_clientes']

    def ativar_clientes(self, request, queryset):
        updated = queryset.update(ativo=True)
        self.message_user(request, f'{updated} cliente(s) ativado(s).')
    ativar_clientes.short_description = 'Ativar clientes selecionados'

    def desativar_clientes(self, request, queryset):
        updated = queryset.update(ativo=False)
        self.message_user(request, f'{updated} cliente(s) desativado(s).')
    desativar_clientes.short_description = 'Desativar clientes selecionados'


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'empresa', 'codigo', 'preco_formatado', 'estoque_badge', 'status_badge']
    list_filter = ['ativo', 'empresa', 'criado_em']
    search_fields = ['nome', 'codigo', 'descricao']
    list_per_page = 50

    def preco_formatado(self, obj):
        """Formata o preço"""
        return format_html(
            '<strong style="color: #1976d2;">R$ {:,.2f}</strong>',
            obj.preco
        )
    preco_formatado.short_description = 'Preço'
    preco_formatado.admin_order_field = 'preco'

    def estoque_badge(self, obj):
        """Badge de estoque com cores"""
        if obj.estoque == 0:
            color = '#f44336'
            text = 'SEM ESTOQUE'
        elif obj.estoque <= 10:
            color = '#ff9800'
            text = f'{obj.estoque} unid.'
        else:
            color = '#4caf50'
            text = f'{obj.estoque} unid.'

        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color, text
        )
    estoque_badge.short_description = 'Estoque'
    estoque_badge.admin_order_field = 'estoque'

    def status_badge(self, obj):
        """Badge de status"""
        if obj.ativo:
            return format_html(
                '<span style="background-color: #4caf50; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">ATIVO</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #9e9e9e; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">INATIVO</span>'
            )
    status_badge.short_description = 'Status'


class ItemVendaInline(admin.TabularInline):
    model = ItemVenda
    extra = 1
    fields = ['produto', 'quantidade', 'preco_unitario', 'desconto', 'subtotal']
    readonly_fields = ['subtotal']

    def subtotal(self, obj):
        if obj.id:
            return f'R$ {obj.subtotal:,.2f}'
        return 'R$ 0,00'
    subtotal.short_description = 'Subtotal'


@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    list_display = ['id', 'cliente', 'empresa', 'data_venda', 'qtd_itens',
                    'valor_total_formatado', 'status_badge']
    list_filter = ['status', 'forma_pagamento', 'empresa', 'data_venda', 'criado_em']
    search_fields = ['cliente__nome', 'observacoes', 'id']
    date_hierarchy = 'data_venda'
    inlines = [ItemVendaInline]
    readonly_fields = ['criado_em', 'atualizado_em', 'valor_total']
    list_per_page = 50
    list_select_related = ['cliente', 'empresa', 'usuario_cadastro']

    def qtd_itens(self, obj):
        """Mostra quantidade de itens na venda"""
        total = obj.itens.count()
        return format_html('<strong>{}</strong> itens', total)
    qtd_itens.short_description = 'Itens'

    def valor_total_formatado(self, obj):
        """Formata o valor total"""
        return format_html(
            '<strong style="color: #388e3c; font-size: 13px;">R$ {:,.2f}</strong>',
            obj.valor_total
        )
    valor_total_formatado.short_description = 'Valor Total'
    valor_total_formatado.admin_order_field = 'valor_total'

    def status_badge(self, obj):
        """Badge de status"""
        colors = {
            'PENDENTE': '#ff9800',
            'PAGA': '#4caf50',
            'CANCELADA': '#f44336'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#000'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    actions = ['marcar_como_paga', 'marcar_como_pendente', 'cancelar_vendas']

    def marcar_como_paga(self, request, queryset):
        from django.utils import timezone
        updated = queryset.filter(status='PENDENTE').update(
            status='PAGA',
            data_pagamento=timezone.now().date()
        )
        self.message_user(request, f'{updated} venda(s) marcada(s) como PAGA.')
    marcar_como_paga.short_description = 'Marcar como PAGA'

    def marcar_como_pendente(self, request, queryset):
        updated = queryset.update(status='PENDENTE', data_pagamento=None)
        self.message_user(request, f'{updated} venda(s) marcada(s) como PENDENTE.')
    marcar_como_pendente.short_description = 'Marcar como PENDENTE'

    def cancelar_vendas(self, request, queryset):
        updated = queryset.update(status='CANCELADA')
        self.message_user(request, f'{updated} venda(s) CANCELADA(S).')
    cancelar_vendas.short_description = 'Cancelar vendas'

    def changelist_view(self, request, extra_context=None):
        """Adiciona totalizadores"""
        extra_context = extra_context or {}

        cl = self.get_changelist_instance(request)
        queryset = cl.get_queryset(request)

        total_geral = queryset.aggregate(total=Sum('valor_total'))['total'] or 0
        total_pendente = queryset.filter(status='PENDENTE').aggregate(total=Sum('valor_total'))['total'] or 0
        total_paga = queryset.filter(status='PAGA').aggregate(total=Sum('valor_total'))['total'] or 0
        total_cancelada = queryset.filter(status='CANCELADA').aggregate(total=Sum('valor_total'))['total'] or 0

        extra_context['total_geral'] = f'R$ {total_geral:,.2f}'
        extra_context['total_pendente'] = f'R$ {total_pendente:,.2f}'
        extra_context['total_paga'] = f'R$ {total_paga:,.2f}'
        extra_context['total_cancelada'] = f'R$ {total_cancelada:,.2f}'
        extra_context['quantidade'] = queryset.count()

        return super().changelist_view(request, extra_context=extra_context)
