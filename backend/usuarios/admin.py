from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ['email', 'nome_completo', 'tipo_usuario_badge', 'empresa',
                    'telefone', 'status_badge', 'ultimo_acesso']
    list_filter = ['tipo_usuario', 'is_active', 'is_staff', 'empresa', 'criado_em']
    search_fields = ['email', 'first_name', 'last_name']
    list_per_page = 50

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('first_name', 'last_name', 'telefone', 'foto')}),
        ('Empresa e Permissões', {'fields': ('tipo_usuario', 'empresa')}),
        ('Permissões do Sistema', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Datas Importantes', {
            'fields': ('last_login', 'criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'tipo_usuario', 'empresa'),
        }),
    )

    readonly_fields = ['criado_em', 'atualizado_em', 'last_login']
    ordering = ['email']

    def nome_completo(self, obj):
        """Exibe o nome completo do usuário"""
        return obj.get_full_name() or '-'
    nome_completo.short_description = 'Nome Completo'
    nome_completo.admin_order_field = 'first_name'

    def tipo_usuario_badge(self, obj):
        """Badge colorido para tipo de usuário"""
        colors = {
            'ADMIN_CHEFE': '#9c27b0',
            'ADMIN_EMPRESA': '#1976d2',
            'USUARIO_EMPRESA': '#757575'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.tipo_usuario, '#000'),
            obj.get_tipo_usuario_display()
        )
    tipo_usuario_badge.short_description = 'Tipo de Usuário'
    tipo_usuario_badge.admin_order_field = 'tipo_usuario'

    def status_badge(self, obj):
        """Badge de status ativo/inativo"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #4caf50; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">ATIVO</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #f44336; color: white; padding: 3px 10px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">INATIVO</span>'
            )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_active'

    def ultimo_acesso(self, obj):
        """Mostra último acesso formatado"""
        if obj.last_login:
            return format_html(
                '<span style="color: #1976d2;">{}</span>',
                obj.last_login.strftime('%d/%m/%Y %H:%M')
            )
        return format_html('<span style="color: #9e9e9e;">Nunca acessou</span>')
    ultimo_acesso.short_description = 'Último Acesso'
    ultimo_acesso.admin_order_field = 'last_login'

    actions = ['ativar_usuarios', 'desativar_usuarios', 'tornar_admin_empresa', 'tornar_usuario_empresa']

    def ativar_usuarios(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} usuário(s) ativado(s).')
    ativar_usuarios.short_description = 'Ativar usuários selecionados'

    def desativar_usuarios(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} usuário(s) desativado(s).')
    desativar_usuarios.short_description = 'Desativar usuários selecionados'

    def tornar_admin_empresa(self, request, queryset):
        updated = queryset.update(tipo_usuario='ADMIN_EMPRESA')
        self.message_user(request, f'{updated} usuário(s) promovido(s) a Admin da Empresa.')
    tornar_admin_empresa.short_description = 'Tornar Admin da Empresa'

    def tornar_usuario_empresa(self, request, queryset):
        updated = queryset.update(tipo_usuario='USUARIO_EMPRESA')
        self.message_user(request, f'{updated} usuário(s) alterado(s) para Usuário da Empresa.')
    tornar_usuario_empresa.short_description = 'Tornar Usuário da Empresa'
