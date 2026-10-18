def cutas_context(request):
    """Global context processor for CUT institutional branding and theme."""
    return {
        'INSTITUTION_NAME': 'Central University of Technology, Free State',
        'SOCIETY_NAME': 'Central University of Technology Academic Society',
        'SOCIETY_ACRONYM': 'CUTAS',
        'SOCIETY_THEME': 'Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs',
        'PRIMARY_NAVY': '#003261',
        'ACCENT_YELLOW': '#FBB927',
        'ACCENT_RED': '#A12830',
        'IS_CUT_ADMIN': request.user.is_authenticated and request.user.is_cut_admin if hasattr(request.user, 'is_cut_admin') else False,
        'IS_SUPERADMIN': request.user.is_authenticated and request.user.is_super_administrator if hasattr(request.user, 'is_super_administrator') else False,
    }
