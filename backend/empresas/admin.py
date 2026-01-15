from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Sum
from .models import Empresa


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cnpj_formatado', 'email', 'cidade', 'total_usuarios',
                    'total_despesas', 'total_vendas', 'status_badge', 'criado_em']
    list_filter = ['ativa', 'estado', 'criado_em']
    search_fields = ['nome', 'razao_social', 'cnpj', 'email']
    readonly_fields = ['criado_em', 'atualizado_em']
    list_per_page = 25

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'razao_social', 'cnpj', 'email', 'telefone')
        }),
        ('Endereço', {
            'fields': ('endereco', 'cidade', 'estado', 'cep')
        }),
        ('Status', {
            'fields': ('ativa',)
        }),
        ('Datas', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )

    def cnpj_formatado(self, obj):
        """Exibe CNPJ formatado"""
        return obj.cnpj_formatado
    cnpj_formatado.short_description = 'CNPJ'
    cnpj_formatado.admin_order_field = 'cnpj'

    def total_usuarios(self, obj):
        """Mostra total de usuários da empresa"""
        count = obj.usuarios.count()
        return format_html(
            '<strong style="color: #1976d2;">{} usuário(s)</strong>',
            count
        )
    total_usuarios.short_description = 'Usuários'

    def total_despesas(self, obj):
        """Mostra total de despesas da empresa"""
        count = obj.despesas.count()
        valor = obj.despesas.aggregate(total=Sum('valor'))['total'] or 0
        return format_html(
            '<span style="color: #d32f2f;">{} | R$ {}</span>',
            count, f'{valor:,.2f}'
        )
    total_despesas.short_description = 'Despesas (Qtd | Valor)'

    def total_vendas(self, obj):
        """Mostra total de vendas da empresa"""
        count = obj.vendas.count()
        valor = obj.vendas.aggregate(total=Sum('valor_total'))['total'] or 0
        return format_html(
            '<span style="color: #388e3c;">{} | R$ {}</span>',
            count, f'{valor:,.2f}'
        )
    total_vendas.short_description = 'Vendas (Qtd | Valor)'

    def status_badge(self, obj):
        """Exibe status com badge colorido"""
        if obj.ativa:
            return format_html(
                '<span style="background-color: #4caf50; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">ATIVA</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #f44336; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">INATIVA</span>'
            )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'ativa'

    actions = ['ativar_empresas', 'desativar_empresas']

    def ativar_empresas(self, request, queryset):
        updated = queryset.update(ativa=True)
        self.message_user(request, f'{updated} empresa(s) ativada(s) com sucesso.')
    ativar_empresas.short_description = 'Ativar empresas selecionadas'

    def desativar_empresas(self, request, queryset):
        updated = queryset.update(ativa=False)
        self.message_user(request, f'{updated} empresa(s) desativada(s) com sucesso.')
    desativar_empresas.short_description = 'Desativar empresas selecionadas'
