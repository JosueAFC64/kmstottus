/**
 * API Route: Tags compartidos
 * GET /api/tags — devuelve todas las etiquetas únicas (compartidas entre módulos)
 * 
 * Este endpoint unifica las etiquetas de lecciones aprendidas, buenas prácticas y FAQs
 * para evitar duplicados como "calidad-masa" vs "calidad-de-la-masa"
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Obtener tags de lecciones aprendidas (publicados y no eliminados)
    const { data: lessonTags } = await supabase
      .from('lessons_learned')
      .select('tags')
      .eq('status', 'published')
      .is('deleted_at', null);

    // Obtener tags de buenas prácticas (publicados y no eliminados)
    const { data: practiceTags } = await supabase
      .from('best_practices')
      .select('tags')
      .eq('status', 'published')
      .is('deleted_at', null);

    // Obtener tags de FAQs (publicados y no eliminados)
    const { data: faqTags } = await supabase
      .from('faqs')
      .select('tags')
      .eq('status', 'published')
      .is('deleted_at', null);

    // Unificar y deduplicar
    const allTags = [
      ...(lessonTags?.flatMap(row => row.tags || []) || []),
      ...(practiceTags?.flatMap(row => row.tags || []) || []),
      ...(faqTags?.flatMap(row => row.tags || []) || []),
    ];

    const uniqueTags = [...new Set(allTags.map(tag => tag.toLowerCase()))]
      .sort();

    return NextResponse.json(uniqueTags);
  } catch (error) {
    console.error('[GET /api/tags]', error);
    return NextResponse.json({ error: 'Error al obtener etiquetas' }, { status: 500 });
  }
}
