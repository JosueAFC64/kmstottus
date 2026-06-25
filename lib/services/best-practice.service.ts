/**
 * Servicio de Buenas Prácticas
 * Captura, almacena, consulta y reutiliza las mejores prácticas operativas
 */

import { createClient } from '@/lib/supabase/server';
import type {
  BestPracticeListItem,
  BestPracticeDetail,
  BestPracticeListResponse,
  BestPracticeFilters,
  BestPracticeFormData,
  BestPracticeStep,
  BestPracticeCategory,
} from '@/types/best-practice';

// ============================================================
// HELPERS
// ============================================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============================================================
// TIPOS INTERNOS
// ============================================================
type DbProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  position?: string;
};

type DbArea = {
  id: string;
  name: string;
};

type DbCategory = {
  id: string;
  name: string;
  color?: string;
};

type DbBestPractice = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  objective?: string;
  description?: string;
  procedure: BestPracticeStep[];
  benefits?: string;
  situations?: string;
  area_id?: string;
  category_id?: string;
  priority: string;
  tags: string[];
  status: string;
  view_count: number;
  version: number;
  author_id: string;
  reviewed_by?: string;
  approved_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  profiles?: DbProfile;
  areas?: DbArea;
  categories?: DbCategory;
};

// ============================================================
// MAPPERS
// ============================================================
function mapRowToListItem(row: DbBestPractice): BestPracticeListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary || '',
    objective: row.objective || undefined,
    priority: row.priority as BestPracticeListItem['priority'],
    status: row.status as BestPracticeListItem['status'],
    view_count: row.view_count || 0,
    tags: row.tags || [],
    created_at: row.created_at,
    published_at: row.published_at || undefined,
    author: {
      id: row.author_id,
      name: row.profiles
        ? `${row.profiles.first_name} ${row.profiles.last_name}`.trim()
        : 'Autor desconocido',
      email: row.profiles?.email || '',
      avatar_url: row.profiles?.avatar_url,
    },
    area: row.areas
      ? { id: row.areas.id, name: row.areas.name }
      : undefined,
    category: row.categories
      ? { id: row.categories.id, name: row.categories.name, color: row.categories.color }
      : undefined,
  };
}

function mapRowToDetail(row: DbBestPractice): BestPracticeDetail {
  return {
    ...mapRowToListItem(row),
    description: row.description || undefined,
    procedure: row.procedure || [],
    benefits: row.benefits || undefined,
    situations: row.situations || undefined,
    updated_at: row.updated_at,
  };
}

// ============================================================
// OBTENER PRÁCTICAS CON FILTROS
// ============================================================
export async function getBestPractices(filters: BestPracticeFilters = {}): Promise<BestPracticeListResponse> {
  const supabase = await createClient();

  const {
    search,
    area,
    category,
    priority,
    status = 'published',
    tags,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 12,
  } = filters;

  let query = supabase
    .from('best_practices')
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      ),
      areas!area_id (
        id,
        name
      ),
      categories!category_id (
        id,
        name,
        color
      )
    `, { count: 'exact' });

  // Excluir eliminados (soft delete)
  query = query.is('deleted_at', null);

  // Filtro por estado
  if (status) {
    query = query.eq('status', status);
  }

  // Filtro por categoría
  if (category) {
    query = query.eq('category_id', category);
  }

  // Filtro por área
  if (area) {
    query = query.eq('area_id', area);
  }

  // Filtro por prioridad
  if (priority) {
    query = query.eq('priority', priority);
  }

  // Filtro por etiquetas (cualquiera de las etiquetas)
  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  // Búsqueda de texto
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,objective.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  // Ordenamiento
  const orderColumn = sortBy === 'title' ? 'title' : sortBy === 'view_count' ? 'view_count' : 'created_at';
  query = query.order(orderColumn, { ascending: sortOrder === 'asc' });

  // Paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching best practices:', error);
    throw new Error('Error al obtener buenas prácticas');
  }

  const bestPractices = (data || []).map(mapRowToListItem);

  return {
    bestPractices,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// ============================================================
// OBTENER PRÁCTICA POR ID
// ============================================================
export async function getBestPracticeById(id: string): Promise<BestPracticeDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('best_practices')
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url,
        position
      ),
      areas!area_id (
        id,
        name
      ),
      categories!category_id (
        id,
        name,
        color
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    console.error('Error fetching best practice:', error);
    throw new Error('Error al obtener buena práctica');
  }

  return mapRowToDetail(data as DbBestPractice);
}

// ============================================================
// OBTENER PRÁCTICAS RELACIONADAS
// ============================================================
export async function getRelatedBestPractices(
  id: string,
  categoryId: string | undefined,
  tags: string[],
  limit = 4
): Promise<BestPracticeListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from('best_practices')
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      ),
      areas!area_id (
        id,
        name
      ),
      categories!category_id (
        id,
        name,
        color
      )
    `)
    .eq('status', 'published')
    .is('deleted_at', null)
    .neq('id', id) // Excluir la práctica actual
    .order('view_count', { ascending: false })
    .limit(limit);

  // Priorizar por categoría, luego por etiquetas
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  } else if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related best practices:', error);
    return [];
  }

  return (data || []).map(mapRowToListItem);
}

// ============================================================
// CREAR PRÁCTICA
// ============================================================
export async function createBestPractice(
  data: BestPracticeFormData,
  authorId: string
): Promise<BestPracticeDetail> {
  const supabase = await createClient();

  const slug = slugify(data.title) + '-' + Date.now().toString(36);

  const insertData = {
    title: data.title,
    slug,
    summary: data.summary ?? null,
    objective: data.objective ?? null,
    description: data.description ?? null,
    procedure: data.procedure ?? [],
    benefits: data.benefits ?? null,
    situations: data.situations ?? null,
    area_id: data.area_id ?? null,
    category_id: data.category_id ?? null,
    priority: data.priority || 'medium',
    tags: data.tags || [],
    status: data.status || 'draft',
    author_id: authorId,
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  };

  const { data: row, error } = await supabase
    .from('best_practices')
    .insert(insertData)
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      ),
      areas!area_id (
        id,
        name
      ),
      categories!category_id (
        id,
        name,
        color
      )
    `)
    .single();

  if (error) {
    console.error('Error creating best practice:', error);
    throw new Error('Error al crear buena práctica');
  }

  return mapRowToDetail(row as DbBestPractice);
}

// ============================================================
// ACTUALIZAR PRÁCTICA
// ============================================================
export async function updateBestPractice(
  id: string,
  data: Partial<BestPracticeFormData>
): Promise<BestPracticeDetail> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.summary !== undefined) updateData.summary = data.summary ?? null;
  if (data.objective !== undefined) updateData.objective = data.objective ?? null;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.procedure !== undefined) updateData.procedure = data.procedure ?? [];
  if (data.benefits !== undefined) updateData.benefits = data.benefits ?? null;
  if (data.situations !== undefined) updateData.situations = data.situations ?? null;
  if (data.area_id !== undefined) updateData.area_id = data.area_id ?? null;
  if (data.category_id !== undefined) updateData.category_id = data.category_id ?? null;
  if (data.priority !== undefined) updateData.priority = data.priority ?? null;
  if (data.tags !== undefined) updateData.tags = data.tags ?? null;
  if (data.status !== undefined) {
    updateData.status = data.status ?? null;
    // Si se está publicando, registrar fecha
    if (data.status === 'published') {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data: row, error } = await supabase
    .from('best_practices')
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      ),
      areas!area_id (
        id,
        name
      ),
      categories!category_id (
        id,
        name,
        color
      )
    `)
    .single();

  if (error) {
    console.error('Error updating best practice:', error);
    throw new Error('Error al actualizar buena práctica');
  }

  if (!row) {
    throw new Error('Práctica no encontrada');
  }

  return mapRowToDetail(row as DbBestPractice);
}

// ============================================================
// ELIMINAR PRÁCTICA (SOFT DELETE)
// ============================================================
export async function deleteBestPractice(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('best_practices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    console.error('Error deleting best practice:', error);
    throw new Error('Error al eliminar buena práctica');
  }

  return true;
}

// ============================================================
// INCREMENTAR VISUALIZACIONES
// ============================================================
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_best_practice_view_count', {
    practice_id: id,
  });

  if (error) {
    // Silenciar error - no es crítico
    console.warn('Error incrementing view count:', error.message);
  }
}

// ============================================================
// OBTENER ÁREAS
// ============================================================
export async function getAreas(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('areas')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching areas:', error);
    return [];
  }

  return data || [];
}

// ============================================================
// OBTENER CATEGORÍAS
// ============================================================
export async function getCategories(moduleType: 'best_practice' | 'lesson' | 'document' | 'all' = 'best_practice'): Promise<BestPracticeCategory[]> {
  const supabase = await createClient();

  let query = supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  // Filtrar por tipo de módulo
  if (moduleType !== 'all') {
    query = query.eq('module_type', moduleType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

// ============================================================
// OBTENER TAGS ÚNICOS
// ============================================================
export async function getBestPracticeTags(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('best_practices')
    .select('tags')
    .eq('status', 'published')
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Extraer tags únicos
  const allTags = data?.flatMap(row => row.tags || []) || [];
  return [...new Set(allTags)].sort();
}

// ============================================================
// OBTENER OPCIONES DE PRIORIDAD
// ============================================================
export function getPriorityOptions() {
  return [
    { value: 'low', label: 'Baja', description: 'Práctica deseable pero no crítica' },
    { value: 'medium', label: 'Media', description: 'Práctica recomendada' },
    { value: 'high', label: 'Alta', description: 'Práctica muy importante' },
    { value: 'critical', label: 'Crítica', description: 'Práctica esencial para operaciones' },
  ];
}

// ============================================================
// OBTENER OPCIONES DE ESTADO
// ============================================================
export function getStatusOptions() {
  return [
    { value: 'draft', label: 'Borrador', description: 'No visible para otros usuarios' },
    { value: 'published', label: 'Publicado', description: 'Visible para todos' },
    { value: 'archived', label: 'Archivado', description: 'Oculto pero recuperable' },
  ];
}
