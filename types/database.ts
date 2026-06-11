/**
 * Tipos TypeScript para la base de datos de Supabase
 * En un proyecto real, estos se generan automáticamente con `supabase gen types typescript`
 * Aquí los definimos manualmente para mayor control
 */

export type UserStatus = 'active' | 'inactive' | 'onboarding' | 'offboarding';
export type DocumentStatus = 'draft' | 'pending_review' | 'published' | 'archived' | 'deleted';
export type AccessLevel = 'public' | 'team' | 'department' | 'restricted';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending_knowledge_extraction';
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';
export type LessonPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  employee_code?: string;
  hire_date?: string;
  department_id?: string;
  area_id?: string;
  position?: string;
  status: UserStatus;
  is_expert: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  deleted_at?: string;
}

export interface Role {
  id: string;
  name: UserRole;
  display_name: string;
  description?: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  parent_id?: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  name: string;
  code: string;
  department_id: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  order_index: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  content_type: string;
  category_id: string;
  access_level: AccessLevel;
  author_id: string;
  reviewed_by?: string;
  approved_by?: string;
  status: DocumentStatus;
  version: number;
  previous_version_id?: string;
  tags: string[];
  attachments: any[];
  view_count: number;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  published_at?: string;
  scheduled_publish_at?: string;
  expires_at?: string;
  is_featured: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & {
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
        };
        Update: Partial<Profile>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Role>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'id' | 'assigned_at'>;
        Update: Partial<UserRole>;
      };
      departments: {
        Row: Department;
        Insert: Omit<Department, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Department>;
      };
      areas: {
        Row: Area;
        Insert: Omit<Area, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Area>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Category>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count' | 'bookmark_count'>;
        Update: Partial<Document>;
      };
    };
  };
}