/**
 * Tipos TypeScript para la base de datos de Supabase
 * En un proyecto real, estos se generan automáticamente con `supabase gen types typescript`
 * Aquí los definimos manualmente para mayor control
 */

// Tipos de enums para Best Practices
export type BestPracticeStatus = 'draft' | 'published' | 'archived';
export type BestPracticePriority = 'low' | 'medium' | 'high' | 'critical';

export interface BestPracticeCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface BestPractice {
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
  priority: BestPracticePriority;
  tags: string[];
  status: BestPracticeStatus;
  view_count: number;
  version: number;
  author_id: string;
  reviewed_by?: string;
  approved_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Tipos para los pasos del procedimiento
export interface BestPracticeStep {
  step: number;
  title: string;
  description: string;
}

export interface BestPracticeListItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  objective?: string;
  priority: BestPracticePriority;
  status: BestPracticeStatus;
  view_count: number;
  tags: string[];
  created_at: string;
  published_at?: string;
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
  category?: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface BestPracticeDetail extends BestPracticeListItem {
  description?: string;
  procedure: BestPracticeStep[];
  benefits?: string;
  situations?: string;
  updated_at: string;
}

export interface BestPracticeListResponse {
  bestPractices: BestPracticeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BestPracticeFilters {
  search?: string;
  area?: string;
  category?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'view_count' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface BestPracticeFormData {
  title: string;
  summary?: string;
  objective?: string;
  description?: string;
  procedure?: BestPracticeStep[];
  benefits?: string;
  situations?: string;
  area_id?: string;
  category_id?: string;
  priority?: BestPracticePriority;
  tags?: string[];
  status?: BestPracticeStatus;
}

// Para conversión desde Lección Aprendida
export interface BestPracticeFromLesson {
  title: string;
  summary?: string;
  objective?: string;
  description?: string;
  benefits?: string;
  situations?: string;
  area_id?: string;
  tags?: string[];
  priority?: BestPracticePriority;
}
