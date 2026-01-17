from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q

from .models import Usuario
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (
    UsuarioSerializer,
    UsuarioCreateSerializer,
    UsuarioFotoSerializer,
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

        Regras de segurança:
        - Usuário trocando própria senha: SEMPRE deve informar senha atual
        - Admin Chefe trocando senha de OUTRO usuário: não precisa da senha atual
        - Admin Empresa trocando senha de usuário da MESMA empresa: não precisa da senha atual
        """
        usuario = self.get_object()
        is_admin_chefe = request.user.tipo_usuario == 'ADMIN_CHEFE'
        is_admin_empresa = request.user.tipo_usuario == 'ADMIN_EMPRESA'
        is_own_password = request.user.id == usuario.id

        # Verifica se Admin Empresa está editando usuário da mesma empresa
        is_same_empresa = (
            is_admin_empresa and
            request.user.empresa_id and
            usuario.empresa_id == request.user.empresa_id
        )

        # Verifica permissão - pode trocar senha se:
        # 1. É a própria senha
        # 2. É Admin Chefe
        # 3. É Admin Empresa e o usuário é da mesma empresa
        if not is_own_password and not is_admin_chefe and not is_same_empresa:
            return Response(
                {'detail': 'Você não tem permissão para trocar a senha deste usuário.'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        # Validação: nova senha é sempre obrigatória
        if not new_password:
            return Response(
                {'detail': 'A nova senha é obrigatória.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validação: nova senha deve ter pelo menos 6 caracteres
        if len(new_password) < 6:
            return Response(
                {'detail': 'A nova senha deve ter pelo menos 6 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # SEGURANÇA: Se está trocando a PRÓPRIA senha, SEMPRE valida a senha atual
        # Mesmo sendo Admin - para evitar que alguém use uma sessão aberta
        if is_own_password:
            if not old_password:
                return Response(
                    {'detail': 'A senha atual é obrigatória.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Usa check_password do Django que compara hash de forma segura
            if not usuario.check_password(old_password):
                return Response(
                    {'old_password': ['Senha atual incorreta.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Admin trocando senha de OUTRO usuário não precisa da senha atual
        # (caso de reset de senha por um administrador)

        # Atualiza senha usando set_password (que faz hash automático)
        usuario.set_password(new_password)
        usuario.save()

        return Response({'detail': 'Senha alterada com sucesso.'})

    @action(detail=True, methods=['post', 'delete'], parser_classes=[MultiPartParser, FormParser])
    def upload_foto(self, request, pk=None):
        """
        Endpoint seguro para upload de foto de perfil.
        Apenas atualiza a foto, sem alterar outros campos do usuário.
        """
        usuario = self.get_object()

        # Verifica permissão - só pode alterar própria foto ou Admin Chefe
        if request.user.id != usuario.id and request.user.tipo_usuario != 'ADMIN_CHEFE':
            return Response(
                {'detail': 'Você não tem permissão para alterar a foto deste usuário.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == 'DELETE':
            # Remove a foto
            if usuario.foto:
                usuario.foto.delete(save=False)
            usuario.foto = None
            usuario.save(update_fields=['foto'])
            # Retorna dados completos do usuário
            serializer = UsuarioSerializer(usuario, context={'request': request})
            return Response(serializer.data)

        # Upload de nova foto
        foto = request.FILES.get('foto')
        if not foto:
            return Response(
                {'detail': 'Nenhuma foto foi enviada.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar tipo de arquivo
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
        if foto.content_type not in allowed_types:
            return Response(
                {'detail': 'Formato inválido. Use JPG ou PNG.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar tamanho (máx 5MB)
        max_size = 5 * 1024 * 1024
        if foto.size > max_size:
            return Response(
                {'detail': 'Imagem muito grande. Máximo 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove foto antiga se existir
        if usuario.foto:
            usuario.foto.delete(save=False)

        # Salva nova foto
        usuario.foto = foto
        usuario.save(update_fields=['foto'])

        # Retorna dados completos do usuário (incluindo a nova foto)
        serializer = UsuarioSerializer(usuario, context={'request': request})
        return Response(serializer.data)
