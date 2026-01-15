from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UsuarioManager(BaseUserManager):
    """
    Manager customizado para o modelo de usuário.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('tipo_usuario', 'ADMIN_CHEFE')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser deve ter is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractUser):
    """
    Model customizado de usuário com suporte a multi-tenant.

    Tipos de usuário:
    - ADMIN_CHEFE: Acesso total ao sistema (todas as empresas)
    - ADMIN_EMPRESA: Administrador de uma empresa específica
    - USUARIO_EMPRESA: Usuário comum de uma empresa
    """
    username = None  # Removemos o username padrão
    email = models.EmailField(unique=True, verbose_name='Email')

    TIPO_USUARIO_CHOICES = [
        ('ADMIN_CHEFE', 'Admin Chefe'),
        ('ADMIN_EMPRESA', 'Admin da Empresa'),
        ('USUARIO_EMPRESA', 'Usuário da Empresa'),
    ]

    tipo_usuario = models.CharField(
        max_length=20,
        choices=TIPO_USUARIO_CHOICES,
        default='USUARIO_EMPRESA',
        verbose_name='Tipo de Usuário'
    )

    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='usuarios',
        verbose_name='Empresa'
    )

    telefone = models.CharField(max_length=20, blank=True, verbose_name='Telefone')
    foto = models.ImageField(upload_to='usuarios/', blank=True, null=True, verbose_name='Foto')

    # Timestamps
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def is_admin_chefe(self):
        """Verifica se o usuário é Admin Chefe"""
        return self.tipo_usuario == 'ADMIN_CHEFE'

    @property
    def is_admin_empresa(self):
        """Verifica se o usuário é Admin da Empresa"""
        return self.tipo_usuario == 'ADMIN_EMPRESA'

    @property
    def is_usuario_empresa(self):
        """Verifica se o usuário é Usuário da Empresa"""
        return self.tipo_usuario == 'USUARIO_EMPRESA'

    def pode_acessar_empresa(self, empresa_id):
        """
        Verifica se o usuário pode acessar uma determinada empresa.
        Admin Chefe pode acessar qualquer empresa.
        Outros usuários só podem acessar sua própria empresa.
        """
        if self.is_admin_chefe:
            return True
        return self.empresa_id == empresa_id

    def get_empresas_acessiveis(self):
        """
        Retorna as empresas que o usuário pode acessar.
        """
        from empresas.models import Empresa
        if self.is_admin_chefe:
            return Empresa.objects.all()
        elif self.empresa:
            return Empresa.objects.filter(id=self.empresa_id)
        return Empresa.objects.none()
