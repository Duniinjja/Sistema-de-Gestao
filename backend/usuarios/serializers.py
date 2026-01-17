from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario
from empresas.serializers import EmpresaSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer customizado para login com JWT.
    Adiciona informações do usuário e empresa no token.
    Bloqueia login de usuários inativos.
    """
    def validate(self, attrs):
        data = super().validate(attrs)

        # Bloqueia login de usuários inativos
        if not self.user.is_active:
            from rest_framework import serializers
            raise serializers.ValidationError(
                {'detail': 'Sua conta está inativa. Entre em contato com o administrador.'}
            )

        # Adiciona informações extras no response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'tipo_usuario': self.user.tipo_usuario,
            'empresa_id': self.user.empresa_id if self.user.empresa else None,
            'empresa_nome': self.user.empresa.nome if self.user.empresa else None,
            'telefone': self.user.telefone,
            'foto': self.user.foto.url if self.user.foto else None,
            'is_active': self.user.is_active,
        }

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adiciona claims customizados ao token
        token['email'] = user.email
        token['tipo_usuario'] = user.tipo_usuario
        token['empresa_id'] = user.empresa_id if user.empresa else None

        return token


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para o model Usuario.
    """
    empresa_nome = serializers.SerializerMethodField()
    empresa_id = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'first_name', 'last_name', 'tipo_usuario',
            'empresa', 'empresa_id', 'empresa_nome', 'telefone', 'foto', 'is_active',
            'password', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['criado_em', 'atualizado_em']

    def get_empresa_nome(self, obj):
        """Retorna nome da empresa ou None se não tiver"""
        return obj.empresa.nome if obj.empresa else None

    def get_empresa_id(self, obj):
        """Retorna ID da empresa ou None se não tiver"""
        return obj.empresa.id if obj.empresa else None

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        usuario = Usuario(**validated_data)
        if password:
            usuario.set_password(password)
        else:
            # Gera uma senha aleatória temporária
            from django.utils.crypto import get_random_string
            usuario.set_password(get_random_string(12))
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        # Verificar se o request está disponível no contexto
        request = self.context.get('request')

        if not request or not request.user:
            # Sem contexto de request, apenas atualiza campos básicos
            for attr, value in validated_data.items():
                if attr not in ['empresa', 'is_staff', 'is_superuser', 'tipo_usuario', 'is_active']:
                    setattr(instance, attr, value)
            if password:
                instance.set_password(password)
            instance.save()
            return instance

        is_admin_chefe = request.user.tipo_usuario == 'ADMIN_CHEFE'
        is_admin_empresa = request.user.tipo_usuario == 'ADMIN_EMPRESA'
        is_editing_self = request.user.id == instance.id

        # Verifica se Admin Empresa está editando usuário da mesma empresa
        is_same_empresa = (
            request.user.empresa_id and
            instance.empresa_id == request.user.empresa_id
        )

        # Campos que SOMENTE Admin Chefe pode alterar
        campos_admin_chefe_only = ['empresa', 'is_staff', 'is_superuser']

        # Campos que Admin pode alterar (tipo_usuario e is_active)
        campos_admin = ['tipo_usuario', 'is_active']

        for attr, value in validated_data.items():
            # Campos restritos apenas ao Admin Chefe
            if attr in campos_admin_chefe_only:
                if is_admin_chefe:
                    setattr(instance, attr, value)
                continue

            # Campos que admins podem alterar
            if attr in campos_admin:
                # Admin Chefe pode alterar qualquer usuário
                if is_admin_chefe:
                    # Admin Chefe pode alterar até a si mesmo (exceto is_active para não se desativar)
                    if attr == 'is_active' and is_editing_self and value == False:
                        continue  # Não permite auto-desativação
                    setattr(instance, attr, value)
                # Admin Empresa pode alterar usuários da mesma empresa
                elif is_admin_empresa and is_same_empresa:
                    # Não permite auto-desativação
                    if attr == 'is_active' and is_editing_self and value == False:
                        continue
                    setattr(instance, attr, value)
                continue

            # Outros campos (email, first_name, last_name, telefone, foto)
            # Qualquer usuário autenticado pode alterar esses campos básicos
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UsuarioFotoSerializer(serializers.ModelSerializer):
    """
    Serializer específico para upload de foto - NÃO altera outros campos.
    """
    class Meta:
        model = Usuario
        fields = ['foto']

    def update(self, instance, validated_data):
        # Apenas atualiza a foto, nada mais
        instance.foto = validated_data.get('foto', instance.foto)
        instance.save(update_fields=['foto'])
        return instance


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de usuários.
    """
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'tipo_usuario', 'empresa', 'telefone'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario
