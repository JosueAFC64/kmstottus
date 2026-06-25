/**
 * API Route: Detalle de usuario específico
 * GET /api/users/[id]
 * PATCH /api/users/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/services/auth.service';
import { getUserById, updateUser, updateUserRole } from '@/lib/services/users.service';
import { hasPermission } from '@/lib/constants/roles';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!hasPermission(user.role, 'users.view') && user.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const data = await getUserById(id);
    if (!data) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!hasPermission(user.role, 'users.manage') && user.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const { roleId, ...profileData } = body;

    // Actualizar perfil
    if (Object.keys(profileData).length > 0) {
      await updateUser(id, profileData);
    }

    // Actualizar rol si se proporcionó
    if (roleId) {
      await updateUserRole(id, roleId);
    }

    // Obtener usuario actualizado
    const updatedUser = await getUserById(id);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
