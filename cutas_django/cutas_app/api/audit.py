from cutas_app.models import AuditLog


def client_ip(request):
    # Only trust X-Forwarded-For when running behind your own reverse proxy.
    fwd = request.META.get('HTTP_X_FORWARDED_FOR')
    if fwd:
        return fwd.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def record(request, action, target='', details='', user=None):
    user = user or getattr(request, 'user', None)
    authed = bool(user and user.is_authenticated)
    AuditLog.objects.create(
        action=action,
        actor_username=user.username if authed else 'anonymous',
        actor_role=user.get_role_display() if authed else 'Guest',
        target_object=str(target)[:255],
        details=details,
        ip_address=client_ip(request),
    )
