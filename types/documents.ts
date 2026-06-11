/**
 * Tipos extendidos para el módulo de documentos
 */

export type DocumentStatus = 'draft' | 'pending_review' | 'published' | 'archived' | 'deleted';
export type AccessLevel = 'public' | 'team' | 'department' | 'restricted';
export type ContentType = 'markdown' | 'html' | 'rich_text';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number; // bytes
  type: string; // MIME type
  uploadedAt: string;
}

export interface DocumentTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export interface DocumentAuthor {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  position?: string;
}

export interface DocumentListItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  category: DocumentCategory;
  author: DocumentAuthor;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail extends DocumentListItem {
  content: string;
  contentType: ContentType;
  attachments: Attachment[];
  reviewedBy?: DocumentAuthor;
  approvedBy?: DocumentAuthor;
  version: number;
  previousVersionId?: string;
  expiresAt?: string;
  deletedAt?: string;
}

export interface DocumentFilters {
  search?: string;
  category?: string;
  tags?: string[];
  status?: DocumentStatus;
  accessLevel?: AccessLevel;
  authorId?: string;
  sortBy?: 'updated_at' | 'created_at' | 'view_count' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DocumentListResponse {
  data: DocumentListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DocumentFormData {
  title: string;
  summary?: string;
  content: string;
  contentType: ContentType;
  categoryId: string;
  accessLevel: AccessLevel;
  tags: string[];
  attachments: Attachment[];
  isFeatured?: boolean;
  isPinned?: boolean;
}

export interface DocumentStatusChange {
  status: DocumentStatus;
  comment?: string;
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  published: 'Publicado',
  archived: 'Archivado',
  deleted: 'Eliminado',
};

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'gray',
  pending_review: 'orange',
  published: 'green',
  archived: 'blue',
  deleted: 'red',
};

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  public: 'Público',
  team: 'Equipo',
  department: 'Departamento',
  restricted: 'Restringido',
};