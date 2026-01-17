from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Categoria
from .serializers import CategoriaSerializer, CategoriaListSerializer
from usuarios.permissions import IsAdminChefe


class CategoriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar categorias globais.

    Regras:
    - Apenas Admin Chefe pode criar, editar e excluir categorias
    - Todos os usuários autenticados podem visualizar categorias ativas
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'ativa']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'ordem', 'criado_em']
    ordering = ['ordem', 'nome']

    def get_permissions(self):
        """
        Define permissões baseadas na ação:
        - list, retrieve, para_despesas, para_receitas: apenas autenticado
        - create, update, partial_update, destroy: apenas Admin Chefe
        """
        if self.action in ['list', 'retrieve', 'para_despesas', 'para_receitas']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAdminChefe]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Retorna todas as categorias para Admin Chefe.
        Para outros usuários, retorna apenas categorias ativas.
        """
        user = self.request.user

        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Categoria.objects.all()

        return Categoria.objects.filter(ativa=True)

    def get_serializer_class(self):
        """
        Usa serializer simplificado para listagem em selects.
        """
        if self.action in ['para_despesas', 'para_receitas']:
            return CategoriaListSerializer
        return CategoriaSerializer

    @action(detail=False, methods=['get'])
    def para_despesas(self, request):
        """
        Retorna categorias ativas para uso em despesas.
        Endpoint: GET /api/categorias/para_despesas/
        """
        categorias = Categoria.get_categorias_despesa()
        serializer = self.get_serializer(categorias, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def para_receitas(self, request):
        """
        Retorna categorias ativas para uso em receitas.
        Endpoint: GET /api/categorias/para_receitas/
        """
        categorias = Categoria.get_categorias_receita()
        serializer = self.get_serializer(categorias, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def reordenar(self, request):
        """
        Reordena as categorias baseado em uma lista de IDs.
        Endpoint: POST /api/categorias/reordenar/
        Body: { "ordem": [id1, id2, id3, ...] }
        """
        if request.user.tipo_usuario != 'ADMIN_CHEFE':
            return Response(
                {'detail': 'Apenas Admin Chefe pode reordenar categorias.'},
                status=status.HTTP_403_FORBIDDEN
            )

        ordem = request.data.get('ordem', [])
        if not ordem:
            return Response(
                {'detail': 'Lista de ordem é obrigatória.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        for index, categoria_id in enumerate(ordem):
            Categoria.objects.filter(id=categoria_id).update(ordem=index)

        return Response({'detail': 'Categorias reordenadas com sucesso.'})
