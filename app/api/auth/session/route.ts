/**
 * API Route: Obtener sesión actual
 * GET /api/auth/session
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/services/auth.service';

export async function GET() {
  try {
    const user = await getSession();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    );
  }
}