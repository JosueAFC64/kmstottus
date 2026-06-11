/**
 * Servicio de documentos — repositorio de conocimiento
 *
 * Actualmente usa mock data. La estructura es idéntica a lo que
 * necesitaríamos para conectarlo a Supabase, así que la migración
 * será directa: solo cambiar el import de MOCK_DOCUMENTS por
 * queries reales a la DB.
 */

import {
  MOCK_DOCUMENTS,
  MOCK_CATEGORIES,
  getAllTags,
  toListItem,
} from '@/lib/mock/documents';
import type {
  DocumentDetail,
  DocumentListItem,
  DocumentListResponse,
  DocumentFilters,
  DocumentFormData,
  DocumentStatus,
  DocumentStatusChange,
  DocumentCategory,
} from '@/types/documents';
import type { DocumentStatus as DStatus, AccessLevel } from '@/types/documents';

// ============================================================
// MUTABLE STORE (simula la DB para CRUD)
// ============================================================
let documentsStore: DocumentDetail[] = [...MOCK_DOCUMENTS];

// ============================================================
// HELPERS
// ============================================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeDoc(doc: DocumentDetail): DocumentDetail {
  return doc;
}

// ============================================================
// LISTAR DOCUMENTOS CON FILTROS
// ============================================================
export async function getDocuments(
  filters: DocumentFilters = {}
): Promise<DocumentListResponse> {
  const {
    search,
    category,
    tags,
    status,
    accessLevel,
    authorId,
    sortBy = 'updated_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 12,
  } = filters;

  let docs = documentsStore.map(toListItem);

  // Filtro: búsqueda por texto (título, resumen, tags)
  if (search && search.trim()) {
    const q = search.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.summary?.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.category.name.toLowerCase().includes(q)
    );
  }

  // Filtro: categoría
  if (category) {
    docs = docs.filter((d) => d.category.slug === category || d.category.id === category);
  }

  // Filtro: tags
  if (tags && tags.length > 0) {
    docs = docs.filter((d) => tags.some((tag) => d.tags.includes(tag)));
  }

  // Filtro: estado
  if (status) {
    docs = docs.filter((d) => d.status === status);
  }

  // Filtro: nivel de acceso
  if (accessLevel) {
    docs = docs.filter((d) => d.accessLevel === accessLevel);
  }

  // Filtro: autor
  if (authorId) {
    docs = docs.filter((d) => d.author.id === authorId);
  }

  // Ordenamiento
  docs.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortBy) {
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'view_count':
        aVal = a.viewCount;
        bVal = b.viewCount;
        break;
      case 'created_at':
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      default:
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Primero los fijados (pinned), luego el resto
  docs.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const total = docs.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = docs.slice(start, start + pageSize);

  return { data, total, page, pageSize, totalPages };
}

// ============================================================
// OBTENER DOCUMENTO POR ID
// ============================================================
export async function getDocumentById(id: string): Promise<DocumentDetail | null> {
  const doc = documentsStore.find((d) => d.id === id);
  if (!doc) return null;
  return normalizeDoc(doc);
}

export async function getDocumentBySlug(slug: string): Promise<DocumentDetail | null> {
  const doc = documentsStore.find((d) => d.slug === slug);
  if (!doc) return null;
  return normalizeDoc(doc);
}

// ============================================================
// CREAR DOCUMENTO
// ============================================================
export async function createDocument(
  data: DocumentFormData,
  authorId: string,
  authorName: string,
  authorEmail: string,
  authorPosition?: string
): Promise<DocumentDetail> {
  const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const category = MOCK_CATEGORIES.find((c) => c.id === data.categoryId) ?? {
    id: data.categoryId,
    name: data.categoryId,
    slug: slugify(data.categoryId),
  };

  const newDoc: DocumentDetail = {
    id,
    title: data.title,
    slug: slugify(data.title),
    summary: data.summary || '',
    content: data.content,
    contentType: data.contentType,
    category,
    author: {
      id: authorId,
      fullName: authorName,
      email: authorEmail,
      position: authorPosition,
    },
    status: 'draft',
    accessLevel: data.accessLevel,
    tags: data.tags,
    attachments: data.attachments,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    isFeatured: data.isFeatured ?? false,
    isPinned: data.isPinned ?? false,
    publishedAt: undefined,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  documentsStore.unshift(newDoc);
  return normalizeDoc(newDoc);
}

// ============================================================
// ACTUALIZAR DOCUMENTO
// ============================================================
export async function updateDocument(
  id: string,
  updates: Partial<DocumentFormData>
): Promise<DocumentDetail | null> {
  const index = documentsStore.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const existing = documentsStore[index];
  const updated: DocumentDetail = {
    ...existing,
    title: updates.title ?? existing.title,
    slug: updates.title ? slugify(updates.title) : existing.slug,
    summary: updates.summary ?? existing.summary,
    content: updates.content ?? existing.content,
    contentType: updates.contentType ?? existing.contentType,
    category: updates.categoryId
      ? (MOCK_CATEGORIES.find((c) => c.id === updates.categoryId) ?? existing.category)
      : existing.category,
    accessLevel: updates.accessLevel ?? existing.accessLevel,
    tags: updates.tags ?? existing.tags,
    attachments: updates.attachments ?? existing.attachments,
    isFeatured: updates.isFeatured ?? existing.isFeatured,
    isPinned: updates.isPinned ?? existing.isPinned,
    updatedAt: new Date().toISOString(),
    version: existing.version + 1,
    previousVersionId: existing.id,
  };

  documentsStore[index] = updated;
  return normalizeDoc(updated);
}

// ============================================================
// CAMBIAR ESTADO DE DOCUMENTO
// ============================================================
export async function changeDocumentStatus(
  id: string,
  change: DocumentStatusChange
): Promise<DocumentDetail | null> {
  const index = documentsStore.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const existing = documentsStore[index];
  const now = new Date().toISOString();

  const updated: DocumentDetail = {
    ...existing,
    status: change.status,
    publishedAt:
      change.status === 'published' && !existing.publishedAt ? now : existing.publishedAt,
    updatedAt: now,
  };

  documentsStore[index] = updated;
  return normalizeDoc(updated);
}

// ============================================================
// ELIMINAR DOCUMENTO (soft delete)
// ============================================================
export async function deleteDocument(id: string): Promise<boolean> {
  const index = documentsStore.findIndex((d) => d.id === id);
  if (index === -1) return false;

  documentsStore[index] = {
    ...documentsStore[index],
    status: 'deleted',
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return true;
}

// ============================================================
// DOCUMENTOS RELACIONADOS (misma categoría o tags compartidos)
// ============================================================
export async function getRelatedDocuments(
  id: string,
  limit = 4
): Promise<DocumentListItem[]> {
  const doc = documentsStore.find((d) => d.id === id);
  if (!doc) return [];

  const related = documentsStore
    .filter((d) => d.id !== id && d.status === 'published')
    .map(toListItem)
    .filter((d) => {
      const sameCategory = d.category.id === doc.category.id;
      const sharedTags = d.tags.some((t) => doc.tags.includes(t));
      return sameCategory || sharedTags;
    })
    .slice(0, limit);

  return related;
}

// ============================================================
// INCREMENTAR VISTAS
// ============================================================
export async function incrementViewCount(id: string): Promise<void> {
  const index = documentsStore.findIndex((d) => d.id === id);
  if (index !== -1) {
    documentsStore[index] = {
      ...documentsStore[index],
      viewCount: documentsStore[index].viewCount + 1,
    };
  }
}

// ============================================================
// DATOS DE SOPORTE (categorías, tags)
// ============================================================
export async function getCategories(): Promise<DocumentCategory[]> {
  return MOCK_CATEGORIES;
}

export async function getTags(): Promise<string[]> {
  return getAllTags();
}

// ============================================================
// ESTADÍSTICAS DEL REPOSITORIO
// ============================================================
export async function getRepositoryStats() {
  const published = documentsStore.filter((d) => d.status === 'published');
  const draft = documentsStore.filter((d) => d.status === 'draft');
  const pending = documentsStore.filter((d) => d.status === 'pending_review');
  const archived = documentsStore.filter((d) => d.status === 'archived');

  return {
    total: documentsStore.filter((d) => d.status !== 'deleted').length,
    published: published.length,
    draft: draft.length,
    pendingReview: pending.length,
    archived: archived.length,
    totalViews: published.reduce((sum, d) => sum + d.viewCount, 0),
    categoriesCount: MOCK_CATEGORIES.length,
  };
}