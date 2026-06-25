/**
 * API Route: Registrar nuevo usuario (Admin only)
 * POST /api/users/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/services/auth.service';
import { createUser } from '@/lib/services/users.service';
import { hasPermission } from '@/lib/constants/roles';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin y hr pueden crear usuarios
    if (!hasPermission(user.role, 'users.manage') && user.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos para crear usuarios' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      employeeCode,
      hireDate,
      departmentId,
      areaId,
      position,
      roleId,
    } = body;

    // Validaciones
    if (!email || !password || !firstName || !lastName || !roleId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, password, firstName, lastName, roleId' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const result = await createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      employeeCode,
      hireDate,
      departmentId,
      areaId,
      position,
      roleId,
    });

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
