/**
 * API Route: Documento individual
 * GET    /api/documents/[id]
 * PUT    /api/documents/[id]
 * DELETE /api/documents/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  changeDocumentStatus,
  getRelatedDocuments,
} from '@/lib/services/document.service';
import type { DocumentFormData, DocumentStatusChange } from '@/types/documents';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // ¿Solicita documentos relacionados?
    const { searchParams } = request.nextUrl;
    if (searchParams.get('related') === 'true') {
      const related = await getRelatedDocuments(id, 4);
      return NextResponse.json(related);
    }

    const doc = await getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('[GET /api/documents/[id]]', error);
    return NextResponse.json({ error: 'Error al obtener documento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // ¿Es un cambio de estado?
    if (body.status !== undefined && body.status !== null) {
      const change: DocumentStatusChange = {
        status: body.status,
        comment: body.comment,
      };
      const doc = await changeDocumentStatus(id, change);
      if (!doc) {
        return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
      }
      return NextResponse.json(doc);
    }

    // Actualización completa del documento
    const data: Partial<DocumentFormData> = {
      title: body.title,
      summary: body.summary,
      content: body.content,
      contentType: body.contentType,
      categoryId: body.categoryId,
      accessLevel: body.accessLevel,
      tags: body.tags,
      attachments: body.attachments,
      isFeatured: body.isFeatured,
      isPinned: body.isPinned,
    };

    const doc = await updateDocument(id, data);
    if (!doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('[PUT /api/documents/[id]]', error);
    return NextResponse.json({ error: 'Error al actualizar documento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = await deleteDocument(id);
    if (!success) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/documents/[id]]', error);
    return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 });
  }
}