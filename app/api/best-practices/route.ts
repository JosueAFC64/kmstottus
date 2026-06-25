/**
 * API Route: Buenas Prácticas
 * GET  /api/best-practices     — listar con filtros
 * POST /api/best-practices     — crear nueva práctica
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBestPractices,
  createBestPractice,
  getCategories,
  getAreas,
  getBestPracticeTags,
} from '@/lib/services/best-practice.service';
import type { BestPracticeFilters, BestPracticeFormData } from '@/types/best-practice';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: BestPracticeFilters = {
      search: searchParams.get('search') || undefined,
      area: searchParams.get('area') || undefined,
      category: searchParams.get('category') || undefined,
      priority: searchParams.get('priority') || undefined,
      status: searchParams.get('status') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sortBy: (searchParams.get('sortBy') as BestPracticeFilters['sortBy']) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 12,
    };

    // Si es ?categories=true, devuelve categorías
    if (searchParams.get('categories') === 'true') {
      const categories = await getCategories();
      return NextResponse.json(categories);
    }

    // Si es ?areas=true, devuelve áreas
    if (searchParams.get('areas') === 'true') {
      const areas = await getAreas();
      return NextResponse.json(areas);
    }

    // Si es ?tags=true, devuelve tags únicos
    if (searchParams.get('tags') === 'list') {
      const tags = await getBestPracticeTags();
      return NextResponse.json(tags);
    }

    const result = await getBestPractices(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/best-practices]', error);
    return NextResponse.json({ error: 'Error al obtener buenas prácticas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data: BestPracticeFormData = {
      title: body.title,
      summary: body.summary,
      objective: body.objective,
      description: body.description,
      procedure: body.procedure || [],
      benefits: body.benefits,
      situations: body.situations,
      area_id: body.area_id,
      category_id: body.category_id,
      priority: body.priority || 'medium',
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
          // Buscar el profile
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
        console.warn('[POST /api/best-practices] No se pudo obtener sesión:', sessionError);
      }
    }

    // Si no hay authorId válido, no permitir crear
    if (!authorId) {
      return NextResponse.json({ error: 'No se pudo identificar al usuario' }, { status: 401 });
    }

    const practice = await createBestPractice(data, authorId);
    return NextResponse.json(practice, { status: 201 });
  } catch (error) {
    console.error('[POST /api/best-practices]', error);
    const message = error instanceof Error ? error.message : 'Error al crear buena práctica';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
