from django.contrib import admin
from .models import Categoria


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'tipo', 'ativa', 'cor', 'ordem', 'criado_em']
    list_filter = ['tipo', 'ativa', 'criado_em']
    search_fields = ['nome', 'descricao']
    ordering = ['ordem', 'nome']
    list_editable = ['ativa', 'ordem']

    fieldsets = (
        (None, {
            'fields': ('nome', 'descricao', 'tipo')
        }),
        ('Aparência', {
            'fields': ('cor', 'icone', 'ordem')
        }),
        ('Status', {
            'fields': ('ativa',)
        }),
    )

    actions = ['ativar_categorias', 'desativar_categorias']

    @admin.action(description='Ativar categorias selecionadas')
    def ativar_categorias(self, request, queryset):
        queryset.update(ativa=True)

    @admin.action(description='Desativar categorias selecionadas')
    def desativar_categorias(self, request, queryset):
        queryset.update(ativa=False)
