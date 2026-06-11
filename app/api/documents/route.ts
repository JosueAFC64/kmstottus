/**
 * API Route: Documentos
 * GET  /api/documents     — listar con filtros
 * POST /api/documents     — crear nuevo documento
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDocuments,
  createDocument,
  getCategories,
  getTags,
  getRepositoryStats,
} from '@/lib/services/document.service';
import type { DocumentFilters, DocumentFormData } from '@/types/documents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: DocumentFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      status: (searchParams.get('status') as DocumentFilters['status']) || undefined,
      accessLevel: (searchParams.get('accessLevel') as DocumentFilters['accessLevel']) || undefined,
      authorId: searchParams.get('authorId') || undefined,
      sortBy: (searchParams.get('sortBy') as DocumentFilters['sortBy']) || 'updated_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 12,
    };

    // Si es ?stats=true, devuelve estadísticas
    if (searchParams.get('stats') === 'true') {
      const stats = await getRepositoryStats();
      return NextResponse.json(stats);
    }

    // Si es ?categories=true, devuelve categorías
    if (searchParams.get('categories') === 'true') {
      const categories = await getCategories();
      return NextResponse.json(categories);
    }

    // Si es ?tags=true, devuelve tags únicos
    if (searchParams.get('tags') === 'list') {
      const tags = await getTags();
      return NextResponse.json(tags);
    }

    const result = await getDocuments(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/documents]', error);
    return NextResponse.json({ error: 'Error al obtener documentos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data: DocumentFormData = {
      title: body.title,
      summary: body.summary,
      content: body.content,
      contentType: body.contentType || 'markdown',
      categoryId: body.categoryId,
      accessLevel: body.accessLevel || 'public',
      tags: body.tags || [],
      attachments: body.attachments || [],
      isFeatured: body.isFeatured ?? false,
      isPinned: body.isPinned ?? false,
    };

    // En producción vendría de la sesión del usuario
    const authorId = body.authorId || 'auth-maria';
    const authorName = body.authorName || 'María García';
    const authorEmail = body.authorEmail || 'maria.garcia@tottus.com';
    const authorPosition = body.authorPosition;

    const doc = await createDocument(data, authorId, authorName, authorEmail, authorPosition);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('[POST /api/documents]', error);
    return NextResponse.json({ error: 'Error al crear documento' }, { status: 500 });
  }
}