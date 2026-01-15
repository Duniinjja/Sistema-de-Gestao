from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Cliente(models.Model):
    """
    Model para cadastro de clientes.
    """
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='clientes',
        verbose_name='Empresa'
    )

    nome = models.CharField(max_length=200, verbose_name='Nome')
    email = models.EmailField(blank=True, verbose_name='Email')
    telefone = models.CharField(max_length=20, blank=True, verbose_name='Telefone')

    cpf_cnpj = models.CharField(max_length=14, blank=True, verbose_name='CPF/CNPJ')
    endereco = models.CharField(max_length=200, blank=True, verbose_name='Endereço')
    cidade = models.CharField(max_length=100, blank=True, verbose_name='Cidade')
    estado = models.CharField(max_length=2, blank=True, verbose_name='Estado')

    observacoes = models.TextField(blank=True, verbose_name='Observações')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['nome']
        indexes = [
            models.Index(fields=['empresa', 'nome']),
        ]

    def __str__(self):
        return self.nome


class Produto(models.Model):
    """
    Model para cadastro de produtos/serviços.
    """
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='produtos',
        verbose_name='Empresa'
    )

    nome = models.CharField(max_length=200, verbose_name='Nome')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    codigo = models.CharField(max_length=50, blank=True, verbose_name='Código')

    preco = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='Preço'
    )

    estoque = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Estoque'
    )

    ativo = models.BooleanField(default=True, verbose_name='Ativo')

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['nome']
        indexes = [
            models.Index(fields=['empresa', 'nome']),
        ]

    def __str__(self):
        return f"{self.nome} - R$ {self.preco}"


class Venda(models.Model):
    """
    Model para registrar vendas.
    """
    FORMA_PAGAMENTO_CHOICES = [
        ('DINHEIRO', 'Dinheiro'),
        ('CARTAO_CREDITO', 'Cartão de Crédito'),
        ('CARTAO_DEBITO', 'Cartão de Débito'),
        ('PIX', 'PIX'),
        ('TRANSFERENCIA', 'Transferência Bancária'),
        ('BOLETO', 'Boleto'),
        ('OUTROS', 'Outros'),
    ]

    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('PAGA', 'Paga'),
        ('CANCELADA', 'Cancelada'),
    ]

    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='vendas',
        verbose_name='Empresa'
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='vendas',
        verbose_name='Cliente'
    )

    data_venda = models.DateField(verbose_name='Data da Venda')
    data_pagamento = models.DateField(null=True, blank=True, verbose_name='Data de Pagamento')

    valor_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Valor Total'
    )

    desconto = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='Desconto'
    )

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

    observacoes = models.TextField(blank=True, verbose_name='Observações')

    usuario_cadastro = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='vendas_cadastradas',
        verbose_name='Usuário Cadastro'
    )

    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Venda'
        verbose_name_plural = 'Vendas'
        ordering = ['-data_venda']
        indexes = [
            models.Index(fields=['empresa', 'data_venda']),
            models.Index(fields=['empresa', 'status']),
        ]

    def __str__(self):
        return f"Venda #{self.id} - {self.cliente.nome} - R$ {self.valor_total}"

    @property
    def valor_final(self):
        """Calcula o valor final com desconto"""
        return self.valor_total - self.desconto


class ItemVenda(models.Model):
    """
    Itens de uma venda.
    """
    venda = models.ForeignKey(
        Venda,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name='Venda'
    )

    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='itens_venda',
        verbose_name='Produto'
    )

    quantidade = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Quantidade'
    )

    preco_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Preço Unitário'
    )

    class Meta:
        verbose_name = 'Item da Venda'
        verbose_name_plural = 'Itens da Venda'

    def __str__(self):
        return f"{self.produto.nome} - Qtd: {self.quantidade}"

    @property
    def subtotal(self):
        """Calcula o subtotal do item"""
        return self.quantidade * self.preco_unitario
