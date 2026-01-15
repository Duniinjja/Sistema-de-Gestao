from rest_framework import serializers
from .models import Empresa


class EmpresaSerializer(serializers.ModelSerializer):
    """
    Serializer para o model Empresa.
    """
    cnpj_formatado = serializers.ReadOnlyField()
    total_usuarios = serializers.SerializerMethodField()

    class Meta:
        model = Empresa
        fields = [
            'id', 'nome', 'razao_social', 'cnpj', 'cnpj_formatado',
            'email', 'telefone', 'endereco', 'cidade', 'estado', 'cep',
            'ativa', 'total_usuarios', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['criado_em', 'atualizado_em']

    def get_total_usuarios(self, obj):
        """Retorna o total de usuários da empresa"""
        return obj.usuarios.count()


class EmpresaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de empresas com validações extras.
    """
    class Meta:
        model = Empresa
        fields = [
            'nome', 'razao_social', 'cnpj', 'email', 'telefone',
            'endereco', 'cidade', 'estado', 'cep'
        ]

    def validate_cnpj(self, value):
        """Valida CNPJ"""
        # Remove caracteres não numéricos
        cnpj = ''.join(filter(str.isdigit, value))

        if len(cnpj) != 14:
            raise serializers.ValidationError("CNPJ deve conter 14 dígitos")

        # Verifica se já existe
        if Empresa.objects.filter(cnpj=cnpj).exists():
            raise serializers.ValidationError("Este CNPJ já está cadastrado")

        return cnpj
