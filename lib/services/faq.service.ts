/**
 * Servicio de FAQs (Preguntas Frecuentes)
 * Centraliza conocimiento explícito reutilizable
 */

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type FAQ = Database['public']['Tables']['faqs']['Row'];
type FAQInsert = Database['public']['Tables']['faqs']['Insert'];
type FAQUpdate = Database['public']['Tables']['faqs']['Update'];

// ============================================================
// HELPERS
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

type DbFAQ = FAQ & {
  profiles?: DbProfile;
  area?: DbArea;
};

// ============================================================
// TIPOS DE RESPUESTA
// ============================================================
export interface FAQListItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  display_order: number;
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

export interface FAQDetail extends FAQListItem {
  answer: string;
  published_at?: string;
  updated_at: string;
}

export interface FAQListResponse {
  faqs: FAQListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FAQFilters {
  search?: string;
  category?: string;
  area?: string;
  status?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'view_count' | 'question';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface FAQFormData {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  area_id?: string;
  status?: string;
  display_order?: number;
}

// ============================================================
// MAPPERS
// ============================================================

function mapRowToFAQ(row: DbFAQ): FAQDetail {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || '',
    tags: row.tags || [],
    status: row.status,
    view_count: row.view_count || 0,
    upvotes: row.upvotes || 0,
    downvotes: row.downvotes || 0,
    display_order: row.display_order || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at || undefined,
    author: {
      id: row.author_id || '',
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
// OBTENER FAQs CON FILTROS
// ============================================================
export async function getFAQs(filters: FAQFilters = {}): Promise<FAQListResponse> {
  const supabase = await createClient();

  const {
    search,
    category,
    area,
    status = 'published',
    tags,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 12,
  } = filters;

  let query = supabase
    .from('faqs')
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

  // Filtro por etiquetas (cualquiera de las etiquetas)
  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  // Búsqueda de texto
  if (search) {
    query = query.or(
      `question.ilike.%${search}%,answer.ilike.%${search}%`
    );
  }

  // Ordenamiento
  const orderColumn = 
    sortBy === 'view_count' ? 'view_count' : 
    sortBy === 'question' ? 'question' : 'created_at';
  
  // Para orden alfabético, primero por categoría, luego por pregunta
  if (sortBy === 'question') {
    query = query.order('category', { ascending: true, nullsFirst: false });
    query = query.order('display_order', { ascending: true });
  } else {
    query = query.order(orderColumn, { ascending: sortOrder === 'asc' });
  }

  // Paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching FAQs:', error);
    throw new Error('Error al obtener FAQs');
  }

  // Obtener áreas por separado para cada FAQ
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

  const faqs = rowsWithArea.map((r) => mapRowToFAQ(r as unknown as DbFAQ));

  return {
    faqs,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// ============================================================
// OBTENER FAQ POR ID
// ============================================================
export async function getFAQById(id: string): Promise<FAQDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('faqs')
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
    console.error('Error fetching FAQ:', error);
    throw new Error('Error al obtener FAQ');
  }

  const row = data as unknown as DbFAQ;

  // Si tiene area_id, obtener el área por separado
  let areaData: { id: string; name: string } | null = null;
  if (row.area_id) {
    const { data: areaRow } = await supabase
      .from('areas')
      .select('id, name')
      .eq('id', row.area_id)
      .maybeSingle();
    areaData = areaRow as { id: string; name: string } | null;
  }

  (row as any).area = areaData;

  return mapRowToFAQ(row as DbFAQ);
}

// ============================================================
// OBTENER FAQs RELACIONADAS
// ============================================================
export async function getRelatedFAQs(id: string, category: string, tags: string[], limit = 4): Promise<FAQListItem[]> {
  const supabase = await createClient();

  // Buscar por categoría o etiquetas similares
  let query = supabase
    .from('faqs')
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
    .neq('id', id) // Excluir la FAQ actual
    .order('view_count', { ascending: false })
    .limit(limit);

  // Priorizar por categoría, luego por etiquetas
  if (category) {
    query = query.eq('category', category);
  } else if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related FAQs:', error);
    return [];
  }

  // Obtener áreas por separado para cada FAQ relacionada
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

  return rowsWithArea.map((r) => mapRowToFAQ(r as unknown as DbFAQ));
}

// ============================================================
// CREAR FAQ
// ============================================================
export async function createFAQ(data: FAQFormData, authorId: string): Promise<FAQDetail> {
  const supabase = await createClient();

  const insertData: FAQInsert = {
    question: data.question,
    answer: data.answer,
    category: data.category || null,
    tags: data.tags || [],
    area_id: data.area_id || null,
    status: (data.status as any) || 'draft',
    display_order: data.display_order || 0,
    author_id: authorId,
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  };

  const { data: row, error } = await supabase
    .from('faqs')
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
    console.error('Error creating FAQ:', error);
    throw new Error('Error al crear FAQ');
  }

  return mapRowToFAQ(row as DbFAQ);
}

// ============================================================
// ACTUALIZAR FAQ
// ============================================================
export async function updateFAQ(id: string, data: Partial<FAQFormData>): Promise<FAQDetail> {
  const supabase = await createClient();

  const updateData: FAQUpdate = {
    question: data.question ?? null,
    answer: data.answer ?? null,
    category: data.category ?? null,
    tags: data.tags ?? null,
    area_id: data.area_id ?? null,
    status: (data.status as any) ?? null,
    display_order: data.display_order ?? null,
  };

  // Si se está publicando, registrar fecha
  if (data.status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { data: row, error } = await supabase
    .from('faqs')
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
    console.error('Error updating FAQ:', error);
    throw new Error('Error al actualizar FAQ');
  }

  if (!row) {
    throw new Error('FAQ no encontrada');
  }

  return mapRowToFAQ(row as DbFAQ);
}

// ============================================================
// ELIMINAR FAQ (SOFT DELETE)
// ============================================================
export async function deleteFAQ(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('faqs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    console.error('Error deleting FAQ:', error);
    throw new Error('Error al eliminar FAQ');
  }

  return true;
}

// ============================================================
// INCREMENTAR VISUALIZACIONES
// ============================================================
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_faq_view_count', { faq_id: id });

  if (error) {
    // Silenciar error - no es crítico
    console.warn('Error incrementing view count:', error.message);
  }
}

// ============================================================
// OBTENER CATEGORÍAS DE FAQs CON COLORES (desde la tabla categories)
// ============================================================
export interface FAQCategory {
  name: string;
  slug: string;
  color: string;
  description?: string;
}

export async function getFAQCategories(): Promise<FAQCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('name, slug, color, description')
    .eq('module_type', 'faq')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching FAQ categories:', error);
    return [];
  }

  return data || [];
}

// ============================================================
// OBTENER ÁREAS PARA FAQs
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
// OBTENER TAGS ÚNICOS DE FAQs
// ============================================================
export async function getFAQTags(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('faqs')
    .select('tags')
    .eq('status', 'published')
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching FAQ tags:', error);
    return [];
  }

  // Extraer tags únicos
  const allTags = data?.flatMap(row => row.tags || []) || [];
  return [...new Set(allTags)].sort();
}

// ============================================================
// VOTAR FAQ (UPVOTE/DOWNVOTE)
// ============================================================
export async function voteFAQ(id: string, vote: 'up' | 'down'): Promise<{ upvotes: number; downvotes: number }> {
  const supabase = await createClient();

  const column = vote === 'up' ? 'upvotes' : 'downvotes';

  const { data, error } = await supabase
    .from('faqs')
    .update({ [column]: supabase.rpc('increment', { x: 1, row_id: id, column_name: column }) })
    .eq('id', id)
    .select('upvotes, downvotes')
    .single();

  if (error) {
    console.error('Error voting FAQ:', error);
    throw new Error('Error al registrar voto');
  }

  return { upvotes: data.upvotes, downvotes: data.downvotes };
}
