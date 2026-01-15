from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q

from .models import Usuario
from .serializers import (
    UsuarioSerializer,
    UsuarioCreateSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsAdminChefe, IsAdminEmpresa, MultiTenantPermission


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View customizada para obter token JWT com informações extras.
    """
    serializer_class = CustomTokenObtainPairSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar usuários.

    Regras:
    - Admin Chefe: pode ver e gerenciar todos os usuários
    - Admin Empresa: pode ver e gerenciar usuários da própria empresa
    - Usuário comum: pode apenas ver seu próprio perfil
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, MultiTenantPermission]

    def get_queryset(self):
        """
        Filtra usuários com base no tipo de usuário logado.
        """
        user = self.request.user

        # Admin Chefe vê todos os usuários
        if user.tipo_usuario == 'ADMIN_CHEFE':
            return Usuario.objects.all()

        # Admin Empresa vê usuários da própria empresa
        if user.tipo_usuario == 'ADMIN_EMPRESA':
            return Usuario.objects.filter(empresa=user.empresa)

        # Usuário comum vê apenas ele mesmo
        return Usuario.objects.filter(id=user.id)

    def get_serializer_class(self):
        """
        Usa serializer específico para criação.
        """
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer

    def perform_create(self, serializer):
        """
        Customiza a criação de usuários.
        """
        user = self.request.user

        # Se não for Admin Chefe, força empresa do usuário logado
        if user.tipo_usuario != 'ADMIN_CHEFE':
            serializer.save(empresa=user.empresa)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Retorna informações do usuário logado.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """
        Permite trocar a senha do usuário.
        """
        usuario = self.get_object()

        # Verifica permissão
        if request.user.id != usuario.id and request.user.tipo_usuario != 'ADMIN_CHEFE':
            return Response(
                {'detail': 'Você não tem permissão para trocar a senha deste usuário.'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'detail': 'old_password e new_password são obrigatórios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verifica senha antiga (exceto Admin Chefe)
        if request.user.tipo_usuario != 'ADMIN_CHEFE':
            if not usuario.check_password(old_password):
                return Response(
                    {'detail': 'Senha antiga incorreta.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Atualiza senha
        usuario.set_password(new_password)
        usuario.save()

        return Response({'detail': 'Senha alterada com sucesso.'})
