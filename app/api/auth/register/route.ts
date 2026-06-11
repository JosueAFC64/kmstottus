/**
 * API Route: Registro
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password, firstName, lastName, position, departmentId, areaId } = data;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const result = await signUp({
      email,
      password,
      firstName,
      lastName,
      position,
      departmentId,
      areaId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al registrar usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}