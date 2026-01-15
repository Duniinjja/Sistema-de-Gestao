from rest_framework import permissions


class IsAdminChefe(permissions.BasePermission):
    """
    Permissão para Admin Chefe.
    Permite acesso apenas a usuários com tipo_usuario = ADMIN_CHEFE.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.tipo_usuario == 'ADMIN_CHEFE'
        )


class IsAdminEmpresa(permissions.BasePermission):
    """
    Permissão para Admin da Empresa.
    Permite acesso a Admin Chefe e Admin da Empresa.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.tipo_usuario in ['ADMIN_CHEFE', 'ADMIN_EMPRESA']
        )


class IsOwnerOrAdminChefe(permissions.BasePermission):
    """
    Permissão que permite acesso ao dono do objeto ou Admin Chefe.
    """
    def has_object_permission(self, request, view, obj):
        # Admin Chefe tem acesso total
        if request.user.tipo_usuario == 'ADMIN_CHEFE':
            return True

        # Verifica se o objeto pertence à mesma empresa do usuário
        if hasattr(obj, 'empresa'):
            return obj.empresa_id == request.user.empresa_id

        # Para objetos do tipo Usuario
        if hasattr(obj, 'empresa_id'):
            return obj.empresa_id == request.user.empresa_id

        return False


class MultiTenantPermission(permissions.BasePermission):
    """
    Permissão base para multi-tenant.
    Garante que usuários só acessem dados da própria empresa,
    exceto Admin Chefe que tem acesso a tudo.
    """
    def has_permission(self, request, view):
        # Usuário deve estar autenticado
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin Chefe tem acesso a tudo
        if request.user.tipo_usuario == 'ADMIN_CHEFE':
            return True

        # Outros usuários devem ter uma empresa associada
        if not request.user.empresa:
            return False

        return True

    def has_object_permission(self, request, view, obj):
        # Admin Chefe tem acesso a tudo
        if request.user.tipo_usuario == 'ADMIN_CHEFE':
            return True

        # Verifica se o objeto pertence à empresa do usuário
        if hasattr(obj, 'empresa'):
            return obj.empresa_id == request.user.empresa_id

        if hasattr(obj, 'empresa_id'):
            return obj.empresa_id == request.user.empresa_id

        return False
