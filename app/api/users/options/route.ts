/**
 * API Route: Datos para formularios (departamentos, áreas, roles)
 * GET /api/users/options
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/services/auth.service';
import { getDepartments, getAreas, getRoles } from '@/lib/services/users.service';
import { hasPermission } from '@/lib/constants/roles';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!hasPermission(user.role, 'users.view') && user.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;

    const [departments, areas, roles] = await Promise.all([
      getDepartments(),
      getAreas(departmentId),
      getRoles(),
    ]);

    return NextResponse.json({ departments, areas, roles });
  } catch (error) {
    console.error('Error al obtener opciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
