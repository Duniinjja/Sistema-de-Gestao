from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Receita(models.Model):
    """
    Model para registrar receitas/entradas financeiras da empresa.
    """
    FORMA_RECEBIMENTO_CHOICES = [
        ('DINHEIRO', 'Dinheiro'),
        ('CARTAO_CREDITO', 'Cartão de Crédito'),
        ('CARTAO_DEBITO', 'Cartão de Débito'),
        ('PIX', 'PIX'),
        ('TRANSFERENCIA', 'Transferência Bancária'),
        ('BOLETO', 'Boleto'),
        ('CHEQUE', 'Cheque'),
        ('OUTROS', 'Outros'),
    ]

    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('RECEBIDA', 'Recebida'),
        ('CANCELADA', 'Cancelada'),
    ]

    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='receitas',
        verbose_name='Empresa'
    )

    categoria = models.ForeignKey(
        'categorias.Categoria',
        on_delete=models.PROTECT,
        related_name='receitas',
        verbose_name='Categoria'
    )

    descricao = models.CharField(max_length=200, verbose_name='Descrição')
    observacoes = models.TextField(blank=True, verbose_name='Observações')

    valor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Valor'
    )

    data_prevista = models.DateField(verbose_name='Data Prevista')
    data_recebimento = models.DateField(null=True, blank=True, verbose_name='Data de Recebimento')

    forma_recebimento = models.CharField(
        max_length=20,
        choices=FORMA_RECEBIMENTO_CHOICES,
        verbose_name='Forma de Recebimento'
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='PENDENTE',
        verbose_name='Status'
    )

    anexo = models.FileField(upload_to='receitas/', blank=True, null=True, verbose_name='Anexo')

    usuario_cadastro = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='receitas_cadastradas',
        verbose_name='Usuário Cadastro'
    )

    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Receita'
        verbose_name_plural = 'Receitas'
        ordering = ['-data_prevista']
        indexes = [
            models.Index(fields=['empresa', 'data_prevista']),
            models.Index(fields=['empresa', 'status']),
        ]

    def __str__(self):
        return f"{self.descricao} - R$ {self.valor}"
