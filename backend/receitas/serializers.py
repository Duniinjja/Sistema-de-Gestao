from rest_framework import serializers
from .models import Receita


class ReceitaSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    usuario_cadastro_nome = serializers.CharField(source='usuario_cadastro.get_full_name', read_only=True)

    class Meta:
        model = Receita
        fields = '__all__'
        read_only_fields = ['usuario_cadastro', 'criado_em', 'atualizado_em']

    def create(self, validated_data):
        validated_data['usuario_cadastro'] = self.context['request'].user
        return super().create(validated_data)
