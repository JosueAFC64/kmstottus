/**
 * API Route: FAQ individual
 * GET    /api/faqs/[id]     — obtener FAQ
 * PUT    /api/faqs/[id]     — actualizar FAQ
 * DELETE /api/faqs/[id]     — eliminar FAQ (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFAQById,
  updateFAQ,
  deleteFAQ,
  getFAQCategories,
  getFAQTags,
  getAreas,
} from '@/lib/services/faq.service';
import type { FAQFormData } from '@/lib/services/faq.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const faq = await getFAQById(id);

    if (!faq) {
      return NextResponse.json({ error: 'FAQ no encontrada' }, { status: 404 });
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error('[GET /api/faqs/[id]]', error);
    return NextResponse.json({ error: 'Error al obtener FAQ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Partial<FAQFormData> = {
      question: body.question,
      answer: body.answer,
      category: body.category,
      tags: body.tags || [],
      area_id: body.area_id,
      status: body.status,
      display_order: body.display_order,
    };

    const faq = await updateFAQ(id, data);
    return NextResponse.json(faq);
  } catch (error) {
    console.error('[PUT /api/faqs/[id]]', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar FAQ';
    
    if (message === 'FAQ no encontrada') {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteFAQ(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/faqs/[id]]', error);
    return NextResponse.json({ error: 'Error al eliminar FAQ' }, { status: 500 });
  }
}
