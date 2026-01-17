from django.db import models


class Categoria(models.Model):
    """
    Categorias globais para classificar despesas e receitas.
    Gerenciadas exclusivamente pelo Admin Chefe.
    Disponíveis para todos os usuários do sistema.
    """
    TIPO_CHOICES = [
        ('DESPESA', 'Despesa'),
        ('RECEITA', 'Receita'),
    ]

    nome = models.CharField(max_length=100, verbose_name='Nome')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    tipo = models.CharField(
        max_length=10,
        choices=TIPO_CHOICES,
        default='DESPESA',
        verbose_name='Tipo'
    )
    ativa = models.BooleanField(default=True, verbose_name='Ativa')
    cor = models.CharField(
        max_length=7,
        default='#1976d2',
        verbose_name='Cor',
        help_text='Cor em hexadecimal (ex: #1976d2)'
    )
    icone = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Ícone',
        help_text='Nome do ícone Material Icons (ex: shopping_cart)'
    )
    ordem = models.PositiveIntegerField(
        default=0,
        verbose_name='Ordem de exibição'
    )

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['ordem', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"

    @classmethod
    def get_categorias_despesa(cls):
        """Retorna categorias ativas para despesas"""
        return cls.objects.filter(
            ativa=True,
            tipo='DESPESA'
        ).order_by('ordem', 'nome')

    @classmethod
    def get_categorias_receita(cls):
        """Retorna categorias ativas para receitas"""
        return cls.objects.filter(
            ativa=True,
            tipo='RECEITA'
        ).order_by('ordem', 'nome')
