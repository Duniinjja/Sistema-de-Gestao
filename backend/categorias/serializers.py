from rest_framework import serializers
from .models import Categoria


class CategoriaSerializer(serializers.ModelSerializer):
    """
    Serializer para o model Categoria.
    """
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Categoria
        fields = [
            'id', 'nome', 'descricao', 'tipo', 'tipo_display',
            'ativa', 'cor', 'icone', 'ordem',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['criado_em', 'atualizado_em']


class CategoriaListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listagem de categorias.
    Usado nos selects/dropdowns do frontend.
    """
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'tipo', 'cor', 'icone']
