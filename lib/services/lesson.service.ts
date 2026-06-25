/**
 * Servicio de lecciones aprendidas
 * Captura, almacena, consulta y reutiliza experiencias de la operación
 */

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type LessonLearned = Database['public']['Tables']['lessons_learned']['Row'];
type LessonInsert = Database['public']['Tables']['lessons_learned']['Insert'];
type LessonUpdate = Database['public']['Tables']['lessons_learned']['Update'];

export type LessonCategory = Database['public']['Tables']['lesson_categories']['Row'];

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

type DbProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  position?: string;
};

type DbDepartment = {
  id: string;
  name: string;
};

type DbLesson = LessonLearned & {
  profiles?: DbProfile;
  areas?: DbArea;
};

// ============================================================
// TIPOS DE RESPUESTA
// ============================================================
export interface LessonListItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  lessons: string;
  category: string;
  priority: string;
  impact_level: string;
  status: string;
  view_count: number;
  tags: string[];
  created_at: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  area?: {
    id: string;
    name: string;
  };
}

export interface LessonDetail extends LessonListItem {
  situation?: string;
  problema_identificado?: string;
  causa_raiz?: string;
  actions_taken?: string;
  result?: string;
  recommendations?: string;
  area?: { id: string; name: string };
  published_at?: string;
  updated_at: string;
}

export interface LessonListResponse {
  lessons: LessonListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LessonFilters {
  search?: string;
  category?: string;
  area?: string;
  impact?: string;
  status?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'view_count' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface LessonFormData {
  title: string;
  summary?: string;
  lessons: string;
  situation?: string;
  problema_identificado?: string;
  causa_raiz?: string;
  actions_taken?: string;
  result?: string;
  recommendations?: string;
  category?: string;
  priority?: string;
  area_id?: string;
  impact_level?: string;
  tags?: string[];
  status?: string;
}

// ============================================================
// MAPPERS
// ============================================================
type DbArea = {
  id: string;
  name: string;
};

function mapRowToLesson(row: DbLesson): LessonDetail {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary || '',
    lessons: row.lessons,
    category: row.category || '',
    priority: row.priority,
    impact_level: row.impact_level || '',
    status: row.status,
    view_count: row.view_count || 0,
    tags: row.tags || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at || undefined,
    situation: row.situation || undefined,
    problema_identificado: row.problema_identificado || undefined,
    causa_raiz: row.causa_raiz || undefined,
    actions_taken: row.actions_taken || undefined,
    result: row.result || undefined,
    recommendations: row.recommendations || undefined,
    author: {
      id: row.author_id,
      name: row.profiles
        ? `${row.profiles.first_name} ${row.profiles.last_name}`.trim()
        : 'Autor desconocido',
      email: row.profiles?.email || '',
      avatar_url: row.profiles?.avatar_url,
    },
    area: row.area_id && (row as any).area
      ? { id: (row as any).area.id, name: (row as any).area.name }
      : undefined,
  };
}

// ============================================================
// OBTENER LECCIONES CON FILTROS
// ============================================================
export async function getLessons(filters: LessonFilters = {}): Promise<LessonListResponse> {
  const supabase = await createClient();

  const {
    search,
    category,
    area,
    impact,
    status = 'published',
    tags,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 12,
  } = filters;

  let query = supabase
    .from('lessons_learned')
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url
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
    query = query.eq('category', category);
  }

  // Filtro por área
  if (area) {
    query = query.eq('area_id', area);
  }

  // Filtro por impacto
  if (impact) {
    query = query.eq('impact_level', impact);
  }

  // Filtro por etiquetas (cualquiera de las etiquetas)
  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  // Búsqueda de texto
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,lessons.ilike.%${search}%`
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
    console.error('Error fetching lessons:', error);
    throw new Error('Error al obtener lecciones');
  }

  // Obtener áreas por separado para cada lección
  const rowsWithArea = await Promise.all(
    (data || []).map(async (row: any) => {
      let areaData: { id: string; name: string } | null = null;
      if (row.area_id) {
        const { data: areaRow } = await supabase
          .from('areas')
          .select('id, name')
          .eq('id', row.area_id)
          .maybeSingle();
        areaData = areaRow as { id: string; name: string } | null;
      }
      return { ...row, area: areaData };
    })
  );

  const lessons = rowsWithArea.map((r) => mapRowToLesson(r as unknown as DbLesson));

  return {
    lessons,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// ============================================================
// OBTENER LECCIÓN POR ID
// ============================================================
export async function getLessonById(id: string): Promise<LessonDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lessons_learned')
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url,
        position
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    console.error('Error fetching lesson:', error);
    throw new Error('Error al obtener lección');
  }

  const row = data as unknown as DbLesson;

  // Si tiene area_id, obtener el área por separado (el JOIN con areas!area_id falla sin FK)
  let areaData: { id: string; name: string } | null = null;
  if (row.area_id) {
    const { data: areaRow } = await supabase
      .from('areas')
      .select('id, name')
      .eq('id', row.area_id)
      .maybeSingle();
    areaData = areaRow as { id: string; name: string } | null;
  }

  // Asignar area manualmente al row para que mapRowToLesson la use
  (row as any).area = areaData;

  return mapRowToLesson(row as DbLesson);
}

// ============================================================
// OBTENER LECCIONES RELACIONADAS
// ============================================================
export async function getRelatedLessons(id: string, category: string, tags: string[], limit = 4): Promise<LessonListItem[]> {
  const supabase = await createClient();

  // Buscar por categoría o etiquetas similares
  let query = supabase
    .from('lessons_learned')
    .select(`
      *,
      profiles!author_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .is('deleted_at', null)
    .neq('id', id) // Excluir la lección actual
    .order('created_at', { ascending: false })
    .limit(limit);

  // Priorizar por categoría, luego por etiquetas
  if (category) {
    query = query.eq('category', category);
  } else if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related lessons:', error);
    return [];
  }

  // Obtener áreas por separado para cada lección relacionada
  const rowsWithArea = await Promise.all(
    (data || []).map(async (row: any) => {
      let areaData: { id: string; name: string } | null = null;
      if (row.area_id) {
        const { data: areaRow } = await supabase
          .from('areas')
          .select('id, name')
          .eq('id', row.area_id)
          .maybeSingle();
        areaData = areaRow as { id: string; name: string } | null;
      }
      return { ...row, area: areaData };
    })
  );

  return rowsWithArea.map((r) => mapRowToLesson(r as unknown as DbLesson));
}

// ============================================================
// CREAR LECCIÓN
// ============================================================
export async function createLesson(data: LessonFormData, authorId: string): Promise<LessonDetail> {
  const supabase = await createClient();

  const slug = slugify(data.title) + '-' + Date.now().toString(36);

  const insertData: LessonInsert = {
    title: data.title,
    slug,
    summary: data.summary ?? null,
    lessons: data.lessons,
    situation: data.situation ?? null,
    problema_identificado: data.problema_identificado ?? null,
    causa_raiz: data.causa_raiz ?? null,
    actions_taken: data.actions_taken ?? null,
    result: data.result ?? null,
    recommendations: data.recommendations ?? null,
    category: data.category ?? null,
    priority: (data.priority as any) || 'medium',
    area_id: data.area_id ?? null,
    impact_level: data.impact_level as any ?? null,
    tags: data.tags || [],
    status: (data.status as any) || 'draft',
    author_id: authorId,
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  };

  const { data: row, error } = await supabase
    .from('lessons_learned')
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
      )
    `)
    .single();

  if (error) {
    console.error('Error creating lesson:', error);
    throw new Error('Error al crear lección');
  }

  return mapRowToLesson(row as DbLesson);
}

// ============================================================
// ACTUALIZAR LECCIÓN
// ============================================================
export async function updateLesson(id: string, data: Partial<LessonFormData>): Promise<LessonDetail> {
  const supabase = await createClient();

  const updateData: LessonUpdate = {
    title: data.title ?? null,
    summary: data.summary ?? null,
    lessons: data.lessons ?? null,
    situation: data.situation ?? null,
    problema_identificado: data.problema_identificado ?? null,
    causa_raiz: data.causa_raiz ?? null,
    actions_taken: data.actions_taken ?? null,
    result: data.result ?? null,
    recommendations: data.recommendations ?? null,
    category: data.category ?? null,
    priority: (data.priority as any) ?? null,
    area_id: data.area_id ?? null,
    impact_level: (data.impact_level as any) ?? null,
    tags: data.tags ?? null,
    status: (data.status as any) ?? null,
  };

  // Si se está publicando, registrar fecha
  if (data.status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { data: row, error } = await supabase
    .from('lessons_learned')
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
      )
    `)
    .single();

  if (error) {
    console.error('Error updating lesson:', error);
    throw new Error('Error al actualizar lección');
  }

  if (!row) {
    throw new Error('Lección no encontrada');
  }

  return mapRowToLesson(row as DbLesson);
}

// ============================================================
// ELIMINAR LECCIÓN (SOFT DELETE)
// ============================================================
export async function deleteLesson(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('lessons_learned')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    console.error('Error deleting lesson:', error);
    throw new Error('Error al eliminar lección');
  }

  return true;
}

// ============================================================
// INCREMENTAR VISUALIZACIONES
// ============================================================
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_lesson_view_count', { lesson_id: id });

  if (error) {
    // Silenciar error - no es crítico
    console.warn('Error incrementing view count:', error.message);
  }
}

// ============================================================
// OBTENER CATEGORÍAS
// ============================================================
export async function getLessonCategories(): Promise<LessonCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('module_type', 'lesson')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
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
// OBTENER TAGS ÚNICOS
// ============================================================
export async function getLessonTags(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lessons_learned')
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
