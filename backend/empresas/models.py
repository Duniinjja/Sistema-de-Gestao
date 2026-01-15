from django.db import models
from django.core.validators import RegexValidator


class Empresa(models.Model):
    """
    Model para representar uma empresa no sistema multi-tenant.
    Cada empresa terá seus próprios dados isolados.
    """
    nome = models.CharField(max_length=200, verbose_name='Nome da Empresa')
    razao_social = models.CharField(max_length=200, verbose_name='Razão Social')

    cnpj_validator = RegexValidator(
        regex=r'^\d{14}$',
        message='CNPJ deve conter 14 dígitos'
    )
    cnpj = models.CharField(
        max_length=14,
        unique=True,
        validators=[cnpj_validator],
        verbose_name='CNPJ'
    )

    email = models.EmailField(verbose_name='Email')
    telefone = models.CharField(max_length=20, blank=True, verbose_name='Telefone')

    # Endereço
    endereco = models.CharField(max_length=200, blank=True, verbose_name='Endereço')
    cidade = models.CharField(max_length=100, blank=True, verbose_name='Cidade')
    estado = models.CharField(max_length=2, blank=True, verbose_name='Estado')
    cep = models.CharField(max_length=8, blank=True, verbose_name='CEP')

    # Status
    ativa = models.BooleanField(default=True, verbose_name='Ativa')

    # Timestamps
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
        ordering = ['nome']

    def __str__(self):
        return self.nome

    @property
    def cnpj_formatado(self):
        """Retorna CNPJ formatado: XX.XXX.XXX/XXXX-XX"""
        if len(self.cnpj) == 14:
            return f"{self.cnpj[:2]}.{self.cnpj[2:5]}.{self.cnpj[5:8]}/{self.cnpj[8:12]}-{self.cnpj[12:]}"
        return self.cnpj
