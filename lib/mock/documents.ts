/**
 * Mock data para el repositorio de conocimiento de Papa Johns
 * Simula datos que vendrían de la base de datos
 */

import type {
  DocumentListItem,
  DocumentDetail,
  DocumentCategory,
  Attachment,
} from '@/types/documents';

// ============================================================
// CATEGORÍAS (sincronizadas con el seed de la migración 001)
// ============================================================
export const MOCK_CATEGORIES: DocumentCategory[] = [
  { id: 'cat-manuales', name: 'Manuales Operativos', slug: 'manuales-operativos', icon: 'book', color: '#1a472a' },
  { id: 'cat-politicas', name: 'Políticas', slug: 'politicas', icon: 'shield', color: '#e31837' },
  { id: 'cat-procesos', name: 'Procesos', slug: 'procesos', icon: 'refresh', color: '#0077b6' },
  { id: 'cat-capacitacion', name: 'Capacitación', slug: 'capacitacion', icon: 'graduation', color: '#ffb500' },
  { id: 'cat-seguridad', name: 'Seguridad', slug: 'seguridad', icon: 'shield-check', color: '#e31837' },
  { id: 'cat-rrhh', name: 'Recursos Humanos', slug: 'recursos-humanos', icon: 'users', color: '#6f42c1' },
  { id: 'cat-tecnologia', name: 'Tecnología', slug: 'tecnologia', icon: 'computer', color: '#20c997' },
  { id: 'cat-mejoras', name: 'Mejores Prácticas', slug: 'mejores-practicas', icon: 'star', color: '#fd7e14' },
];

// ============================================================
// AUTORES MOCK (vacío - se usa auth real)
// ============================================================
const authors = {
  admin: {
    id: 'auth-admin',
    fullName: 'Administrador',
    email: 'admin@papajohns.com',
    position: 'Administrador del sistema',
  },
};

// ============================================================
// HELPERS
// ============================================================
function attachment(name: string, sizeKB: number, type = 'application/pdf'): Attachment {
  return {
    id: `att-${Math.random().toString(36).slice(2, 8)}`,
    name,
    url: `#`,
    size: sizeKB * 1024,
    type,
    uploadedAt: new Date().toISOString(),
  };
}

function doc(
  id: string,
  title: string,
  summary: string,
  content: string,
  categoryId: string,
  authorKey: keyof typeof authors,
  status: DocumentListItem['status'],
  tags: string[],
  viewCount: number,
  isFeatured: boolean,
  isPinned: boolean,
  publishedAt: string,
  accessLevel: DocumentListItem['accessLevel'] = 'public',
  attachments: Attachment[] = [],
): DocumentDetail {
  const author = authors[authorKey];
  const category = MOCK_CATEGORIES.find((c) => c.id === categoryId)!;

  return {
    id,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    summary,
    content,
    contentType: 'markdown',
    category,
    author,
    status,
    accessLevel,
    tags,
    viewCount,
    likeCount: Math.floor(viewCount * 0.15),
    commentCount: Math.floor(viewCount * 0.05),
    isFeatured,
    isPinned,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    attachments,
    version: 1,
  };
}

// ============================================================
// DOCUMENTOS MOCK (vacío - datos reales vendrán de Supabase)
// ============================================================
export const MOCK_DOCUMENTS: DocumentDetail[] = [];

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

/**
 * Obtiene la lista de tags únicos usados en todos los documentos
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  MOCK_DOCUMENTS.forEach((doc) => doc.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

/**
 * Convierte DocumentDetail a DocumentListItem (versión resumida)
 */
export function toListItem(doc: DocumentDetail): DocumentListItem {
  const { content, contentType, attachments, reviewedBy, approvedBy, version, previousVersionId, expiresAt, ...rest } = doc;
  return rest as unknown as DocumentListItem;
}
