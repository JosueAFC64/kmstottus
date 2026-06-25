/**
 * API Route: Lecciones Aprendidas
 * GET  /api/lessons     — listar con filtros
 * POST /api/lessons     — crear nueva lección
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLessons,
  createLesson,
  getLessonCategories,
  getLessonTags,
  getAreas,
} from '@/lib/services/lesson.service';
import type { LessonFilters, LessonFormData } from '@/lib/services/lesson.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: LessonFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      area: searchParams.get('area') || undefined,
      impact: searchParams.get('impact') || undefined,
      status: searchParams.get('status') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sortBy: (searchParams.get('sortBy') as LessonFilters['sortBy']) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 12,
    };

    // Si es ?categories=true, devuelve categorías
    if (searchParams.get('categories') === 'true') {
      const categories = await getLessonCategories();
      return NextResponse.json(categories);
    }

    // Si es ?tags=true, devuelve tags únicos
    if (searchParams.get('tags') === 'list') {
      const tags = await getLessonTags();
      return NextResponse.json(tags);
    }

    // Si es ?areas=true, devuelve áreas
    if (searchParams.get('areas') === 'true') {
      const areas = await getAreas();
      return NextResponse.json(areas);
    }

    const result = await getLessons(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/lessons]', error);
    return NextResponse.json({ error: 'Error al obtener lecciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data: LessonFormData = {
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
      priority: body.priority || 'medium',
      area_id: body.area_id,
      impact_level: body.impact_level,
      tags: body.tags || [],
      status: body.status || 'draft',
    };

    // Obtener author de la sesión
    let authorId = body.authorId;

    if (!authorId) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Buscar el profile对应的 user_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            authorId = profile.id;
          }
        }
      } catch (sessionError) {
        console.warn('[POST /api/lessons] No se pudo obtener sesión:', sessionError);
      }
    }

    // Si no hay authorId válido, no permitir crear
    if (!authorId) {
      return NextResponse.json({ error: 'No se pudo identificar al usuario' }, { status: 401 });
    }

    const lesson = await createLesson(data, authorId);
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('[POST /api/lessons]', error);
    const message = error instanceof Error ? error.message : 'Error al crear lección';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
