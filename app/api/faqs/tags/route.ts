/**
 * API Route: Tags de FAQs
 * GET /api/faqs/tags — lista de tags únicos
 */

import { NextResponse } from 'next/server';
import { getFAQTags } from '@/lib/services/faq.service';

export async function GET() {
  try {
    const tags = await getFAQTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('[GET /api/faqs/tags]', error);
    return NextResponse.json({ error: 'Error al obtener tags' }, { status: 500 });
  }
}
