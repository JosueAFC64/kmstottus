/**
 * Servicio de documentos â€” repositorio de conocimiento
 * Conecta con la base de datos de Supabase
 */

import { createClient } from '@/lib/supabase/server';
import type {
  DocumentDetail,
  DocumentListItem,
  DocumentListResponse,
  DocumentFilters,
  DocumentFormData,
  DocumentCategory,
} from '@/types/documents';

// ============================================================
// HELPERS
// ============================================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
};

type DbProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
};

type DbDocument = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  content_type: string;
  category_id: string;
  access_level: string;
  author_id: string;
  reviewed_by?: string;
  approved_by?: string;
  status: string;
  version: number;
  previous_version_id?: string;
  tags: string[];
  attachments: any[];
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string | null;
  is_featured: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  categories?: DbCategory;
  profiles?: DbProfile;
};

function mapRowToDoc(row: DbDocument): DocumentDetail {
  const category = row.categories;
  const author = row.profiles;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary || '',
    content: row.content,
    contentType: (row.content_type as any) || 'markdown',
    category: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: (category.icon as any) || 'folder',
          color: category.color || '#1a472a',
        }
      : {
          id: row.category_id,
          name: 'Sin categorÃ­a',
          slug: 'sin-categoria',
          icon: 'folder',
          color: '#1a472a',
        },
    author: author
      ? {
          id: author.id,
          fullName: `${author.first_name} ${author.last_name}`.trim(),
          email: author.email,
          position: author.position || '',
        }
      : {
          id: row.author_id,
          fullName: 'Usuario desconocido',
          email: '',
          position: '',
        },
    status: row.status as any,
    accessLevel: row.access_level as any,
    tags: row.tags || [],
    attachments: Array.isArray(row.attachments)
      ? row.attachments.map((a: any) => ({
          id: a.id || a.name,
          name: a.name,
          url: a.url,
          size: a.size,
          type: a.type,
          uploadedAt: a.uploadedAt || row.created_at,
        }))
      : [],
    viewCount: row.view_count || 0,
    likeCount: row.like_count || 0,
    commentCount: row.comment_count || 0,
    isFeatured: row.is_featured || false,
    isPinned: row.is_pinned || false,
    publishedAt: row.published_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version || 1,
    previousVersionId: row.previous_version_id || undefined,
  };
}

function toListItem(doc: DocumentDetail): DocumentListItem {
  const { content, contentType, attachments, reviewedBy, approvedBy, version, previousVersionId, expiresAt, ...rest } = doc;
  return rest as unknown as DocumentListItem;
}

// ============================================================
// LISTAR DOCUMENTOS CON FILTROS
// ============================================================
export async function getDocuments(
  filters: DocumentFilters = {}
): Promise<DocumentListResponse> {
  const supabase = await createClient();

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

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .neq('status', 'deleted');

  // Filtros
  if (status) query = query.eq('status', status);
  if (accessLevel) query = query.eq('access_level', accessLevel);
  if (authorId) query = query.eq('author_id', authorId);
  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  // Filtro por tags: usar overlaps con normalización consistente
  // Los tags en BD están en formato "cultura-organizacional" (guiones, minúsculas)
  if (tags && tags.length > 0) {
    // Normalizar: minúsculas, sin espacios extra, espacios → guiones
    const normalizedTags = tags.map(t => t.toLowerCase().trim().replace(/\s+/g, '-'));
    query = query.overlaps('tags', normalizedTags);
  }

  // Ordenamiento
  const sortColumn = sortBy === 'view_count' ? 'view_count'
    : sortBy === 'created_at' ? 'created_at'
    : 'updated_at';
  query = query.order(sortColumn as any, { ascending: sortOrder === 'asc' });

  // PaginaciÃ³n
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[getDocuments]', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const rows = data as unknown as DbDocument[];

  // Obtener categorÃ­as y autores en paralelo
  const categoryIds = [...new Set(rows.map(r => r.category_id))];
  const authorIds = [...new Set(rows.map(r => r.author_id))];

  const [{ data: categories }, { data: profiles }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, color').in('id', categoryIds),
    supabase.from('profiles').select('id, first_name, last_name, email, position').in('id', authorIds),
  ]);

  const catMap = new Map((categories || []).map((c: any) => [c.id, c]));
  const profMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  const rowsWithRelations: DbDocument[] = rows.map(r => ({
    ...r,
    categories: catMap.get(r.category_id),
    profiles: profMap.get(r.author_id),
  }));

  let docs: DocumentListItem[] = rowsWithRelations.map(r => toListItem(mapRowToDoc(r)));

  // Filtro por categorÃ­a (slug) si se pasÃ³
  if (category) {
    docs = docs.filter(d => d.category.slug === category || d.category.id === category);
  }

  // Primero los fijados
  docs.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const total = count || docs.length;
  const totalPages = Math.ceil(total / pageSize);

  return { data: docs, total, page, pageSize, totalPages };
}

// ============================================================
// OBTENER DOCUMENTO POR ID
// ============================================================
export async function getDocumentById(id: string): Promise<DocumentDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const row = data as unknown as DbDocument;

  // Cargar categorÃ­a y autor
  const [{ data: category }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, color').eq('id', row.category_id).single(),
    supabase.from('profiles').select('id, first_name, last_name, email, position').eq('id', row.author_id).maybeSingle(),
  ]);

  return mapRowToDoc({ ...row, categories: category || undefined, profiles: profile || undefined });
}

export async function getDocumentBySlug(slug: string): Promise<DocumentDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  const row = data as unknown as DbDocument;

  const [{ data: category }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, color').eq('id', row.category_id).single(),
    supabase.from('profiles').select('id, first_name, last_name, email, position').eq('id', row.author_id).maybeSingle(),
  ]);

  return mapRowToDoc({ ...row, categories: category || undefined, profiles: profile || undefined });
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
  const supabase = await createClient();

  // Buscar profile existente por email o usar un fallback
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, position')
    .eq('email', authorEmail)
    .maybeSingle();

  let profileId = existingProfile?.id || authorId;

  // Si no existe, crear profile bÃ¡sico
  if (!existingProfile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        user_id: authorId,
        first_name: authorName.split(' ')[0] || 'Usuario',
        last_name: authorName.split(' ').slice(1).join(' ') || 'Demo',
        email: authorEmail,
        position: authorPosition || 'Colaborador',
        status: 'active',
      })
      .select('id, first_name, last_name, email, position')
      .single();

    if (newProfile) {
      profileId = newProfile.id;
    }
  }

  const slug = slugify(data.title) + '-' + Date.now().toString(36);

  const insertData = {
    title: data.title,
    slug,
    summary: data.summary || '',
    content: data.content,
    content_type: data.contentType || 'markdown',
    category_id: data.categoryId,
    access_level: data.accessLevel || 'public',
    author_id: profileId,
    tags: data.tags || [],
    attachments: data.attachments || [],
    is_featured: data.isFeatured ?? false,
    is_pinned: data.isPinned ?? false,
    status: 'draft',
    version: 1,
    view_count: 0,
    like_count: 0,
    comment_count: 0,
  };

  const { data: inserted, error } = await supabase
    .from('documents')
    .insert(insertData)
    .select('*')
    .single();

  if (error) {
    console.error('[createDocument]', error);
    throw new Error(`Error al crear documento: ${error.message}`);
  }

  const row = inserted as unknown as DbDocument;

  const [{ data: category }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, color').eq('id', row.category_id).single(),
    supabase.from('profiles').select('id, first_name, last_name, email, position').eq('id', row.author_id).maybeSingle(),
  ]);

  return mapRowToDoc({ ...row, categories: category || undefined, profiles: profile || undefined });
}

// ============================================================
// ACTUALIZAR DOCUMENTO
// ============================================================
export async function updateDocument(
  id: string,
  updates: Partial<DocumentFormData>
): Promise<DocumentDetail | null> {
  const supabase = await createClient();

  const existing = await getDocumentById(id);
  if (!existing) return null;

  const updateData: Record<string, any> = {};
  if (updates.title !== undefined) {
    updateData.title = updates.title;
    updateData.slug = slugify(updates.title) + '-' + Date.now().toString(36);
  }
  if (updates.summary !== undefined) updateData.summary = updates.summary;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.contentType !== undefined) updateData.content_type = updates.contentType;
  if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
  if (updates.accessLevel !== undefined) updateData.access_level = updates.accessLevel;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
  if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
  if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
  updateData.version = (existing.version || 1) + 1;

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return null;

  return getDocumentById(id);
}

// ============================================================
// CAMBIAR ESTADO DE DOCUMENTO
// ============================================================
export async function changeDocumentStatus(
  id: string,
  change: { status: string }
): Promise<DocumentDetail | null> {
  const supabase = await createClient();

  const updateData: Record<string, any> = { status: change.status };
  if (change.status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id);

  if (error) return null;
  return getDocumentById(id);
}

// ============================================================
// ELIMINAR DOCUMENTO (soft delete)
// ============================================================
export async function deleteDocument(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('documents')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

// ============================================================
// DOCUMENTOS RELACIONADOS
// ============================================================
export async function getRelatedDocuments(
  id: string,
  limit = 4
): Promise<DocumentListItem[]> {
  const doc = await getDocumentById(id);
  if (!doc || !doc.tags.length) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'published')
    .neq('id', id)
    .overlaps('tags', doc.tags)
    .limit(limit);

  if (!data) return [];

  const rows = data as unknown as DbDocument[];
  const categoryIds = [...new Set(rows.map(r => r.category_id))];
  const authorIds = [...new Set(rows.map(r => r.author_id))];

  const [{ data: categories }, { data: profiles }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, color').in('id', categoryIds),
    supabase.from('profiles').select('id, first_name, last_name, email, position').in('id', authorIds),
  ]);

  const catMap = new Map((categories || []).map((c: any) => [c.id, c]));
  const profMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  return rows
    .map(r => toListItem(mapRowToDoc({ ...r, categories: catMap.get(r.category_id), profiles: profMap.get(r.author_id) })))
    .slice(0, limit);
}

// ============================================================
// INCREMENTAR VISTAS
// ============================================================
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc('increment_doc_views', { doc_id: id });
}

// ============================================================
// DATOS DE SOPORTE (categorÃ­as, tags)
// ============================================================
export async function getCategories(): Promise<DocumentCategory[]> {
  try {
    const supabase = await createClient();

    // Solo categorías de tipo documento y activas
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, color, order_index')
      .eq('module_type', 'document')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error || !data) {
      console.error('[getCategories] Error:', error?.message);
      // Fallback sin order_index
      const fallback = await supabase
        .from('categories')
        .select('id, name, slug, color')
        .eq('module_type', 'document')
        .eq('is_active', true);
      if (fallback.error || !fallback.data) {
        return [];
      }
      return (fallback.data as any[]).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: 'folder' as any,
        color: c.color || '#1a472a',
      }));
    }

    return (data as any[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: 'folder' as any,
      color: c.color || '#1a472a',
    }));
  } catch (err) {
    console.error('[getCategories] ExcepciÃ³n:', err);
    return [];
  }
}

export async function getTags(): Promise<string[]> {
  const supabase = await createClient();

  // Primero intentar por tabla tags
  const { data } = await supabase
    .from('tags')
    .select('name')
    .order('usage_count', { ascending: false })
    .limit(50);

  if (data && data.length > 0) {
    return (data as any[]).map((t) => t.name);
  }

  // Fallback: extraer de documentos publicados
  const { data: docs } = await supabase
    .from('documents')
    .select('tags')
    .eq('status', 'published')
    .not('tags', 'is', null);

  if (!docs) return [];

  const tagSet = new Set<string>();
  (docs as any[]).forEach((d) => {
    (d.tags || []).forEach((t: string) => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}

// ============================================================
// ESTADÃSTICAS DEL REPOSITORIO
// ============================================================
export async function getRepositoryStats() {
  const supabase = await createClient();

  const [{ count: total }, { count: published }, { count: draft }, { count: pending }, { count: archived }, { count: categoriesCount }] =
    await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }).neq('status', 'deleted'),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
      supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);

  const { data: viewsData } = await supabase
    .from('documents')
    .select('view_count')
    .eq('status', 'published');

  const totalViews = (viewsData as any[] || []).reduce((sum, d) => sum + (d.view_count || 0), 0);

  return {
    total: total || 0,
    published: published || 0,
    draft: draft || 0,
    pendingReview: pending || 0,
    archived: archived || 0,
    totalViews,
    categoriesCount: categoriesCount || 0,
  };
}
