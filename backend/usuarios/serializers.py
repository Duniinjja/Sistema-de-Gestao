from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario
from empresas.serializers import EmpresaSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer customizado para login com JWT.
    Adiciona informações do usuário e empresa no token.
    """
    def validate(self, attrs):
        data = super().validate(attrs)

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
    empresa_nome = serializers.CharField(source='empresa.nome', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'first_name', 'last_name', 'tipo_usuario',
            'empresa', 'empresa_nome', 'telefone', 'foto', 'is_active',
            'password', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['criado_em', 'atualizado_em']

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
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
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
