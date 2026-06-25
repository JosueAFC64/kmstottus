/**
 * API Route: Buena Práctica Individual
 * GET    /api/best-practices/[id] — obtener detalle
 * PUT    /api/best-practices/[id] — actualizar
 * DELETE /api/best-practices/[id] — eliminar (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBestPracticeById,
  updateBestPractice,
  deleteBestPractice,
} from '@/lib/services/best-practice.service';
import type { BestPracticeFormData } from '@/types/best-practice';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const practice = await getBestPracticeById(id);

    if (!practice) {
      return NextResponse.json({ error: 'Práctica no encontrada' }, { status: 404 });
    }

    return NextResponse.json(practice);
  } catch (error) {
    console.error('[GET /api/best-practices/[id]]', error);
    return NextResponse.json({ error: 'Error al obtener buena práctica' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Partial<BestPracticeFormData> = {
      title: body.title,
      summary: body.summary,
      objective: body.objective,
      description: body.description,
      procedure: body.procedure,
      benefits: body.benefits,
      situations: body.situations,
      area_id: body.area_id,
      category_id: body.category_id,
      priority: body.priority,
      tags: body.tags,
      status: body.status,
    };

    const practice = await updateBestPractice(id, data);
    return NextResponse.json(practice);
  } catch (error) {
    console.error('[PUT /api/best-practices/[id]]', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar buena práctica';
    const status = message === 'Práctica no encontrada' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteBestPractice(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/best-practices/[id]]', error);
    return NextResponse.json({ error: 'Error al eliminar buena práctica' }, { status: 500 });
  }
}
