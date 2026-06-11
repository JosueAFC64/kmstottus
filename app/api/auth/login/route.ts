/**
 * API Route: Login
 * POST /api/auth/login
 *
 * Implementa el signIn directamente (sin pasar por un server action externo)
 * para garantizar que las cookies de Supabase se propaguen correctamente al
 * response. Cuando un server action se importa en un route handler en
 * Next.js 15+, el sub-contexto de cookies a veces no se propaga al response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const result = await signIn({ email, password });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al iniciar sesión' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: result.user, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
