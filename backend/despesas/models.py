from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Despesa(models.Model):
    """
    Model para registrar despesas da empresa.
    """
    FORMA_PAGAMENTO_CHOICES = [
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
        ('PAGA', 'Paga'),
        ('VENCIDA', 'Vencida'),
        ('CANCELADA', 'Cancelada'),
    ]

    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='despesas',
        verbose_name='Empresa'
    )

    categoria = models.ForeignKey(
        'categorias.Categoria',
        on_delete=models.PROTECT,
        related_name='despesas',
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

    data_vencimento = models.DateField(verbose_name='Data de Vencimento')
    data_pagamento = models.DateField(null=True, blank=True, verbose_name='Data de Pagamento')

    forma_pagamento = models.CharField(
        max_length=20,
        choices=FORMA_PAGAMENTO_CHOICES,
        verbose_name='Forma de Pagamento'
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='PENDENTE',
        verbose_name='Status'
    )

    anexo = models.FileField(upload_to='despesas/', blank=True, null=True, verbose_name='Anexo')

    usuario_cadastro = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='despesas_cadastradas',
        verbose_name='Usuário Cadastro'
    )

    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Despesa'
        verbose_name_plural = 'Despesas'
        ordering = ['-data_vencimento']
        indexes = [
            models.Index(fields=['empresa', 'data_vencimento']),
            models.Index(fields=['empresa', 'status']),
        ]

    def __str__(self):
        return f"{self.descricao} - R$ {self.valor}"

    @property
    def esta_vencida(self):
        """Verifica se a despesa está vencida"""
        from django.utils import timezone
        if self.status == 'PAGA' or self.status == 'CANCELADA':
            return False
        return self.data_vencimento < timezone.now().date()
