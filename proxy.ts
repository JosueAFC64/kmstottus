/**
 * Middleware de autenticación y protección de rutas
 * Se ejecuta en cada request para validar sesión y permisos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/api/protected'];

// Rutas que requieren rol específico
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/dashboard/onboarding': ['admin', 'hr', 'supervisor'],
  '/dashboard/exit-interviews': ['admin', 'hr'],
  '/dashboard/admin': ['admin', 'knowledge_manager'],
  '/dashboard/metrics': ['admin', 'knowledge_manager', 'hr'],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a archivos estáticos y API públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // archivos con extensión
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Verificar sesión
  const { data: { user }, error } = await supabase.auth.getUser();

  // Si la ruta es pública
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // Si ya está autenticado, redirigir al dashboard
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Si la ruta está protegida
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Sin sesión, redirigir a login
    if (!user || error) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar permisos por rol
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles.length > 0) {
      const hasAccess = await checkUserRole(supabase, user.id, requiredRoles);
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/dashboard/forbidden', request.url));
      }
    }
  }

  return response;
}

/**
 * Obtiene los roles requeridos para una ruta
 */
function getRequiredRoles(pathname: string): string[] {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return [];
}

/**
 * Verifica si el usuario tiene alguno de los roles requeridos.
 * Usa service_role client porque las tablas `user_roles` y `roles` no tienen
 * políticas RLS de SELECT (migración 001), y el cliente con anon key devolvería
 * 0 filas aunque el usuario esté autenticado.
 */
async function checkUserRole(supabase: any, userId: string, requiredRoles: string[]): Promise<boolean> {
  try {
    const adminClient = createServiceRoleClient();

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return false;
    }

    // Obtener roles del usuario
    const { data: userRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id (
          name
        )
      `)
      .eq('user_id', profile.id);

    if (rolesError || !userRoles) {
      return false;
    }

    // Verificar si tiene alguno de los roles requeridos
    const userRoleNames = userRoles.map((ur: any) => ur.roles?.name).filter(Boolean);
    return userRoleNames.some((role: string) => requiredRoles.includes(role));
  } catch (error) {
    console.error('Error al verificar rol:', error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};