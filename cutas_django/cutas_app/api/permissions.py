from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    """Administrator / Project Leader or Super Administrator."""
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_cut_admin)


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_super_administrator)


class PublicReadAdminWrite(BasePermission):
    """Anyone can read; only admins can write."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        u = request.user
        return bool(u and u.is_authenticated and u.is_cut_admin)
