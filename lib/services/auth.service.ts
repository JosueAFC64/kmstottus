/**
 * Servicio de autenticación
 * Centraliza toda la lógica de auth (login, logout, registro, sesión)
 *
 * NOTA IMPORTANTE: Este archivo NO usa 'use server'.
 * Todas las funciones se llaman desde Route Handlers (app/api/auth/*),
 * no desde server actions invocadas por el cliente. Usar 'use server' aquí
 * creaba un sub-contexto de cookies que NO se propagaba al response del
 * route handler, rompiendo el flujo de auth.
 */

import { createClient } from '../supabase/server';
import { createServiceRoleClient } from '../supabase/service-role';
import type {
  LoginCredentials,
  RegisterData,
  SessionUser,
  SignInResult,
  SignUpResult,
  SignOutResult,
} from '@/types/auth';
import type { UserRole } from '@/lib/constants/roles';
import type { Profile } from '@/types/database';

/**
 * Helper interno: carga el SessionUser completo (perfil + rol) usando
 * service_role. Es seguro porque solo se invoca desde server-side con
 * un user.id que ya fue validado por Supabase Auth (JWT).
 *
 * ¿Por qué service_role y no anon?
 * - La política RLS de `profiles` solo permite ver tu propio perfil (OK con anon).
 * - PERO `user_roles` y `roles` no tienen política de SELECT en la migración 001.
 *   Con RLS habilitado y sin políticas, las queries devuelven 0 filas.
 * - Eso causaba que getSession() devolviera null aunque el usuario estuviera
 *   autenticado, generando un redirect loop entre /dashboard y /login.
 */
async function loadSessionUser(userId: string): Promise<SessionUser | null> {
  const adminClient = createServiceRoleClient();

  // 1. Perfil
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[loadSessionUser] Perfil no encontrado para user_id:', userId, profileError);
    }
    return null;
  }

  // 2. Rol del usuario
  const { data: userRole, error: roleError } = await adminClient
    .from('user_roles')
    .select(`
      role_id,
      roles:role_id (name)
    `)
    .eq('user_id', profile.id)
    .single();

  if (roleError || !userRole) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[loadSessionUser] Rol no encontrado para profile_id:', profile.id, roleError);
    }
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    fullName: `${profile.first_name} ${profile.last_name}`,
    avatarUrl: profile.avatar_url,
    role: (userRole.roles as any).name as UserRole,
    departmentId: profile.department_id,
    areaId: profile.area_id,
    position: profile.position,
  };
}

export async function signIn(credentials: LoginCredentials): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    // 1. Autenticar (esto setea cookies en el cookieStore del Route Handler)
    const { data: authData, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[signIn] Error de Supabase Auth:', error);
      }
      return { success: false, error: error.message };
    }
    if (!authData.user) {
      return { success: false, error: 'No se pudo obtener el usuario' };
    }

    // 2. Cargar perfil + rol con service_role (bypasea RLS)
    const sessionUser = await loadSessionUser(authData.user.id);
    if (!sessionUser) {
      return {
        success: false,
        error: 'Tu cuenta fue creada pero el perfil aún no está listo. Por favor contacta al administrador.',
      };
    }

    return { success: true, user: sessionUser };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[signIn] Error inesperado:', error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function signOut(): Promise<SignOutResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function signUp(data: RegisterData): Promise<SignUpResult> {
  try {
    const supabase = await createClient();

    // Crear usuario en auth.users (el trigger crea perfil + rol automáticamente)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (signUpError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[signUp] Error de Supabase:', {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
        });
      }
      const result: SignUpResult = { success: false, error: signUpError.message };
      if (process.env.NODE_ENV === 'development') {
        result.debug = { status: signUpError.status, name: signUpError.name };
      }
      return result;
    }

    if (!authData.user) {
      return { success: false, error: 'No se pudo crear el usuario' };
    }

    return { success: true, userId: authData.user.id };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[signUp] Error inesperado:', error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Cargar perfil + rol con service_role (ver loadSessionUser para detalles)
    return await loadSessionUser(user.id);
  } catch (error) {
    // Silenciar errores esperados
    if (error instanceof Error) {
      const msg = error.message;
      if (
        msg.includes('Supabase no está configurado') ||
        msg.includes('cookies') ||
        msg.includes('DYNAMIC_SERVER_USAGE')
      ) {
        return null;
      }
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en getSession:', error);
    }
    return null;
  }
}

export async function updateProfile(profileId: string, updates: Partial<Profile>) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
