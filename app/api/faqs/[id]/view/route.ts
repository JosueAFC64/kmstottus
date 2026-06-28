/**
 * API Route: Incrementar visualizaciones de FAQ
 * POST /api/faqs/[id]/view
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementViewCount } from '@/lib/services/faq.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await incrementViewCount(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/faqs/[id]/view]', error);
    // No retornar error 500 porque no es crítico
    return NextResponse.json({ success: false });
  }
}
