from rest_framework import serializers
from .models import Cliente, Produto, Venda, ItemVenda


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ['criado_em', 'atualizado_em']


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'
        read_only_fields = ['criado_em', 'atualizado_em']


class ItemVendaSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = ItemVenda
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'subtotal']


class VendaSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    usuario_cadastro_nome = serializers.CharField(source='usuario_cadastro.get_full_name', read_only=True)
    valor_final = serializers.ReadOnlyField()
    itens = ItemVendaSerializer(many=True, read_only=True)

    class Meta:
        model = Venda
        fields = '__all__'
        read_only_fields = ['usuario_cadastro', 'criado_em', 'atualizado_em']

    def create(self, validated_data):
        validated_data['usuario_cadastro'] = self.context['request'].user
        return super().create(validated_data)


class VendaCreateSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True)

    class Meta:
        model = Venda
        fields = ['empresa', 'cliente', 'data_venda', 'desconto', 'forma_pagamento', 'status', 'observacoes', 'itens']

    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        validated_data['usuario_cadastro'] = self.context['request'].user

        # Calcula valor total
        valor_total = sum(item['quantidade'] * item['preco_unitario'] for item in itens_data)
        validated_data['valor_total'] = valor_total

        venda = Venda.objects.create(**validated_data)

        # Cria itens
        for item_data in itens_data:
            ItemVenda.objects.create(venda=venda, **item_data)

        return venda
