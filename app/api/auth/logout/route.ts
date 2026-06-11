/**
 * API Route: Logout
 * POST /api/auth/logout
 */
import { NextResponse } from 'next/server';
import { signOut } from '@/lib/services/auth.service';

export async function POST() {
  try {
    const result = await signOut();
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al cerrar sesión' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
