/**
 * API Route: Lección individual
 * GET    /api/lessons/[id]
 * PUT    /api/lessons/[id]
 * DELETE /api/lessons/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLessonById,
  updateLesson,
  deleteLesson,
  getRelatedLessons,
  incrementViewCount,
} from '@/lib/services/lesson.service';
import type { LessonFormData } from '@/lib/services/lesson.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // ¿Solicita lecciones relacionadas?
    const { searchParams } = request.nextUrl;
    if (searchParams.get('related') === 'true') {
      const category = searchParams.get('category') || '';
      const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 4;
      const related = await getRelatedLessons(id, category, tags, limit);
      return NextResponse.json(related);
    }

    // ¿Es para incrementar vistas?
    if (searchParams.get('view') === 'true') {
      await incrementViewCount(id);
      return NextResponse.json({ success: true });
    }

    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
    }

    // Incrementar contador de vistas de forma async
    incrementViewCount(id).catch(() => {});

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('[GET /api/lessons/[id]]', error);
    return NextResponse.json({ error: 'Error al obtener lección' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Partial<LessonFormData> = {
      title: body.title,
      summary: body.summary,
      lessons: body.lessons,
      situation: body.situation,
      problema_identificado: body.problema_identificado,
      causa_raiz: body.causa_raiz,
      actions_taken: body.actions_taken,
      result: body.result,
      recommendations: body.recommendations,
      category: body.category,
      priority: body.priority,
      area_id: body.area_id,
      impact_level: body.impact_level,
      tags: body.tags,
      status: body.status,
    };

    const lesson = await updateLesson(id, data);
    return NextResponse.json(lesson);
  } catch (error) {
    console.error('[PUT /api/lessons/[id]]', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar lección';
    const status = message === 'Lección no encontrada' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = await deleteLesson(id);
    if (!success) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/lessons/[id]]', error);
    return NextResponse.json({ error: 'Error al eliminar lección' }, { status: 500 });
  }
}
