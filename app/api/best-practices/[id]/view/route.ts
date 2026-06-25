/**
 * API Route: Incrementar vista de Buena Práctica
 * POST /api/best-practices/[id]/view — incrementa el contador de vistas
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementViewCount } from '@/lib/services/best-practice.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await incrementViewCount(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/best-practices/[id]/view]', error);
    return NextResponse.json({ error: 'Error al incrementar vistas' }, { status: 500 });
  }
}
