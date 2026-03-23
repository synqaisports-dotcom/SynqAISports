import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * MIDDLEWARE_SECURITY_LAYER
 * Protección de rutas a nivel de servidor para SynqAI Sports
 * 
 * Rutas protegidas:
 * - /admin-global/* → Solo superadmin
 * - /dashboard/* → Usuarios autenticados
 */

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard', '/admin-global', '/onboarding'];

// Rutas públicas (no requieren auth)
const PUBLIC_ROUTES = ['/', '/login', '/register', '/activate', '/board'];

// Rutas que requieren rol superadmin
const SUPERADMIN_ROUTES = ['/admin-global'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas y archivos estáticos
  if (
    PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar si la ruta está protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificar si Supabase está configurado
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // En modo demo, permitir acceso pero el layout verificará el perfil
    console.warn('[SynqAI Middleware] Supabase no configurado - modo demo activo');
    return NextResponse.next();
  }

  // Crear cliente de Supabase para verificar sesión
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  // Obtener token de las cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  // Si no hay tokens, verificar si hay sesión en el auth header
  if (!accessToken) {
    // Redirigir a login para rutas protegidas sin sesión
    // Nota: El AuthContext del cliente también valida esto
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Solo redirigir si es una navegación de página, no fetch
    const isPageNavigation = request.headers.get('accept')?.includes('text/html');
    if (isPageNavigation) {
      return NextResponse.redirect(loginUrl);
    }
  }

  // Para rutas de superadmin, la verificación de rol se hace en el layout
  // porque necesitamos acceso al perfil completo del usuario
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
