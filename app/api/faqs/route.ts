/**
 * API Route: FAQs (Preguntas Frecuentes)
 * GET  /api/faqs     — listar con filtros
 * POST /api/faqs     — crear nueva FAQ
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFAQs,
  createFAQ,
  getFAQCategories,
  getFAQTags,
  getAreas,
} from '@/lib/services/faq.service';
import type { FAQFilters, FAQFormData } from '@/lib/services/faq.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: FAQFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      area: searchParams.get('area') || undefined,
      status: searchParams.get('status') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sortBy: (searchParams.get('sortBy') as FAQFilters['sortBy']) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 12,
    };

    // Si es ?categories=true, devuelve categorías
    if (searchParams.get('categories') === 'true') {
      const categories = await getFAQCategories();
      return NextResponse.json(categories);
    }

    // Si es ?tags= true, devuelve tags únicos
    if (searchParams.get('tags') === 'list') {
      const tags = await getFAQTags();
      return NextResponse.json(tags);
    }

    // Si es ?areas=true, devuelve áreas
    if (searchParams.get('areas') === 'true') {
      const areas = await getAreas();
      return NextResponse.json(areas);
    }

    const result = await getFAQs(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/faqs]', error);
    return NextResponse.json({ error: 'Error al obtener FAQs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data: FAQFormData = {
      question: body.question,
      answer: body.answer,
      category: body.category,
      tags: body.tags || [],
      area_id: body.area_id,
      status: body.status || 'draft',
      display_order: body.display_order || 0,
    };

    // Obtener author de la sesión
    let authorId = body.authorId;

    if (!authorId) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Buscar el profile correspondiente al user_id
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
        console.warn('[POST /api/faqs] No se pudo obtener sesión:', sessionError);
      }
    }

    // Si no hay authorId válido, no permitir crear
    if (!authorId) {
      return NextResponse.json({ error: 'No se pudo identificar al usuario' }, { status: 401 });
    }

    const faq = await createFAQ(data, authorId);
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('[POST /api/faqs]', error);
    const message = error instanceof Error ? error.message : 'Error al crear FAQ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
