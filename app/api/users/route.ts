/**
 * API Route: Lista de usuarios
 * GET /api/users - Lista usuarios con filtros
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/services/auth.service';
import { getUsers, getDepartments, getAreas, getRoles } from '@/lib/services/users.service';
import { hasPermission } from '@/lib/constants/roles';

export async function GET(request: NextRequest) {
  try {
    // Verificar auth
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permiso
    if (!hasPermission(user.role, 'users.view') && user.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const data = await getUsers({ search, role, departmentId, status, page, limit });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
