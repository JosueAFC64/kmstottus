/**
 * Tipos de la aplicación para autenticación
 */

import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/constants/roles';

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  departmentId?: string;
  areaId?: string;
  position?: string;
}

export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  position?: string;
  departmentId?: string;
  areaId?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Resultado de operaciones de auth (signIn, signUp, signOut).
 * Unión discriminada por `success` para que TypeScript estreche bien los tipos.
 */
export type SignInResult =
  | { success: true; user: SessionUser }
  | { success: false; error: string; debug?: { status: number | undefined; name: string } };

export type SignUpResult =
  | { success: true; userId: string }
  | { success: false; error: string; debug?: { status: number | undefined; name: string } };

export type SignOutResult =
  | { success: true }
  | { success: false; error: string };
