-- ============================================================
-- KMS TOTTUS PERÚ - ESQUEMA DE BASE DE DATOS
-- Sistema de Gestión del Conocimiento
-- Versión: 1.0.0
-- Fecha: 2026-06-09
-- ============================================================

-- ============================================================
-- SECCIÓN 1: EXTENSIONES
-- ============================================================

-- Habilitar UUID para generación de IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar pg_trgm para búsqueda full-text
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- SECCIÓN 2: ENUMS (TIPOS DE DATOS PERSONALIZADOS)
-- ============================================================

-- Estados de usuario
CREATE TYPE user_status AS ENUM (
    'active',      -- Usuario activo en la empresa
    'inactive',    -- Usuario inactivo (vacaciones largas, etc.)
    'onboarding',  -- Usuario en proceso de onboarding
    'offboarding'  -- Usuario en proceso de salida
);

-- Estados de documento
CREATE TYPE document_status AS ENUM (
    'draft',       -- Borrador, no publicado
    'pending_review', -- Pendiente de revisión
    'published',   -- Publicado y visible
    'archived',    -- Archivado, solo visible para admins
    'deleted'      -- Eliminado (soft delete)
);

-- Niveles de acceso/recurso
CREATE TYPE access_level AS ENUM (
    'public',      -- Visible para todos
    'team',        -- Visible para el equipo
    'department',  -- Visible para el departamento
    'restricted'   -- Solo roles específicos
);

-- Estados de entrevista de salida
CREATE TYPE interview_status AS ENUM (
    'scheduled',   -- Entrevista programada
    'in_progress', -- En curso
    'completed',   -- Completada
    'cancelled',    -- Cancelada
    'pending_knowledge_extraction' -- Pendiente extracción de conocimiento
);

-- Estados de onboarding
CREATE TYPE onboarding_status AS ENUM (
    'not_started',  -- No iniciado
    'in_progress',   -- En curso
    'completed',     -- Completado
    'overdue'        -- Vencido
);

-- Prioridad de lección aprendida
CREATE TYPE lesson_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- ============================================================
-- SECCIÓN 3: TABLAS CORE - USUARIOS Y AUTENTICACIÓN
-- ============================================================

-- Tabla principal de perfiles de usuario
-- Se complementa con auth.users de Supabase
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencia a Supabase Auth (debe coincidir con auth.users)
    user_id UUID NOT NULL UNIQUE,
    
    -- Información personal
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Información corporativa Tottus
    employee_code VARCHAR(20) UNIQUE,  -- Código de empleado Tottus
    hire_date DATE,
    department_id UUID,
    area_id UUID,
    position VARCHAR(150),
    
    -- Gestión de estado
    status user_status DEFAULT 'active',
    is_expert BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ  -- Soft delete
);

-- Tabla de roles del sistema
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',  -- Array de permisos como JSON
    is_system BOOLEAN DEFAULT FALSE,  -- Roles del sistema no eliminables
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación usuario-rol (muchos a muchos)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Para evitar duplicados
    UNIQUE(user_id, role_id)
);

-- Tabla de departamentos de Tottus
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,  -- Código interno (ej: RRHH, LOG, VENTAS)
    description TEXT,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,  -- Jerarquía
    manager_id UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de áreas dentro de departamentos
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECCIÓN 4: TABLAS DE CONOCIMIENTO
-- ============================================================

-- Tabla de categorías de documentos (jerárquicas)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,  -- URL-friendly
    description TEXT,
    icon VARCHAR(50),  -- Nombre del icono
    color VARCHAR(7),  -- Color hex (ej: #00a651)
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,  -- Categoría padre
    order_index INTEGER DEFAULT 0,  -- Para ordenar en UI
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de documentos de conocimiento (artículos)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificación
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,  -- Resumen para previews y búsqueda
    
    -- Contenido
    content TEXT NOT NULL,  -- Contenido en formato markdown o HTML
    content_type VARCHAR(20) DEFAULT 'markdown',  -- markdown, html, rich_text
    
    -- Clasificación
    category_id UUID NOT NULL REFERENCES categories(id),
    access_level access_level DEFAULT 'public',
    
    -- Metadatos del autor
    author_id UUID NOT NULL REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    
    -- Estado y control de versiones
    status document_status DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES documents(id),  -- Link a versión anterior
    
    -- Información adicional
    tags TEXT[],  -- Array de tags
    attachments JSONB DEFAULT '[]',  -- URLs y metadata de archivos adjuntos
    
    -- Métricas de uso
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- Tiempos
    published_at TIMESTAMPTZ,
    scheduled_publish_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,  -- Para contenido temporal
    
    -- Control
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ  -- Soft delete
);

-- Tabla de tags (etiquetas) - Normalización para reutilización
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7),
    usage_count INTEGER DEFAULT 0,  -- Para mostrar tags populares
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación documentos-tags (muchos a muchos)
CREATE TABLE document_tags (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (document_id, tag_id)
);

-- Tabla de comentarios en documentos
CREATE TABLE document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    parent_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,  -- Para respuestas
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tabla de favoritos/marcadores de usuarios
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    notes TEXT,  -- Notas personales del usuario
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, document_id)
);

-- ============================================================
-- SECCIÓN 5: TABLAS DE ONBOARDING
-- ============================================================

-- Tabla de rutas de onboarding (journeys)
CREATE TABLE onboarding_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(150) NOT NULL,
    description TEXT,
    target_role VARCHAR(100),  -- Rol al que está dirigido (ej: "Cajero", "Supervisor")
    department_id UUID REFERENCES departments(id),
    
    -- Configuración
    estimated_days INTEGER DEFAULT 30,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadatos
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de módulos dentro de una ruta de onboarding
CREATE TABLE onboarding_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID NOT NULL REFERENCES onboarding_paths(id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,  -- Contenido del módulo (markdown)
    
    -- Configuración
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 30,
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Tipo de módulo
    module_type VARCHAR(30) DEFAULT 'content',  -- content, quiz, task, document
    quiz_questions JSONB DEFAULT '[]',  -- Preguntas si es quiz
    linked_document_id UUID REFERENCES documents(id),  -- Documento relacionado
    
    -- Recursos
    resources JSONB DEFAULT '[]',  -- URLs, archivos, videos
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progreso de onboarding por usuario
CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    path_id UUID NOT NULL REFERENCES onboarding_paths(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES onboarding_modules(id) ON DELETE CASCADE,
    
    -- Progreso
    status onboarding_status DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    
    -- Para quizzes
    quiz_score INTEGER,
    quiz_attempts INTEGER DEFAULT 0,
    
    -- Notas
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Evitar duplicados
    UNIQUE(user_id, module_id)
);

-- ============================================================
-- SECCIÓN 6: TABLAS DE ENTREVISTAS DE SALIDA
-- ============================================================

-- Tabla de entrevistas de salida
CREATE TABLE exit_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información del entrevistado
    employee_id UUID NOT NULL REFERENCES profiles(id),
    interviewer_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Fechas y scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Ubicación y formato
    location VARCHAR(200),
    interview_type VARCHAR(20) DEFAULT 'in_person',  -- in_person, virtual, phone
    meeting_link TEXT,
    
    -- Estado
    status interview_status DEFAULT 'scheduled',
    
    -- Preparación
    topics_to_cover JSONB DEFAULT '[]',
    documents_reviewed JSONB DEFAULT '[]',
    
    -- Resultado
    summary TEXT,  -- Resumen ejecutivo post-entrevista
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tabla de plantillas de preguntas de entrevista
CREATE TABLE interview_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),  -- technical, process, culture, general
    questions JSONB NOT NULL DEFAULT '[]',  -- Array de preguntas con tipos
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de respuestas de entrevistas
CREATE TABLE interview_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES exit_interviews(id) ON DELETE CASCADE,
    
    -- Pregunta
    template_id UUID REFERENCES interview_templates(id),
    question_text TEXT NOT NULL,
    question_order INTEGER,
    
    -- Respuesta
    answer TEXT,
    answer_type VARCHAR(30),  -- text, rating, multiple_choice, yes_no
    rating_value INTEGER,  -- Para respuestas de tipo rating (1-5)
    
    -- Para extracción de conocimiento
    contains_knowledge BOOLEAN DEFAULT FALSE,  -- Marca si contiene conocimiento valioso
    knowledge_category VARCHAR(100),  -- Categoría del conocimiento detectado
    extracted_content TEXT,  -- Contenido extraído para conocimiento tácito
    
    -- Calidad de respuesta
    confidence_level VARCHAR(20),  -- high, medium, low
    needs_review BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de piezas de conocimiento extraídas de entrevistas
CREATE TABLE extracted_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_response_id UUID REFERENCES interview_responses(id),
    
    -- Contenido extraído
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    knowledge_type VARCHAR(50),  -- process, tip, warning, best_practice, contacts
    
    -- Clasificación
    category_id UUID REFERENCES categories(id),
    tags TEXT[],
    
    -- Relacionar con documentos existentes
    related_document_id UUID REFERENCES documents(id),
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending_review',  -- pending_review, approved, published, rejected
    
    -- Metadatos de creación
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECCIÓN 7: TABLAS DE LECCIONES APRENDIDAS
-- ============================================================

-- Tabla de lecciones aprendidas
CREATE TABLE lessons_learned (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificación
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    
    -- Contenido detallado
    situation TEXT NOT NULL,  -- Qué pasó
    actions_taken TEXT,       -- Qué se hizo
    result TEXT,              -- Qué resultado se obtuvo
    lessons TEXT NOT NULL,    -- Qué se aprendió
    recommendations TEXT,     -- Recomendaciones para el futuro
    
    -- Clasificación
    category VARCHAR(100),
    priority lesson_priority DEFAULT 'medium',
    
    -- Proyecto o contexto
    project_name VARCHAR(200),
    project_id VARCHAR(100),
    
    -- Involved parties
    involved_profiles UUID[],  -- Array de IDs de perfiles involucrados
    department_id UUID REFERENCES departments(id),
    
    -- Impacto
    impact_level VARCHAR(20),  -- low, medium, high, critical
    estimated_savings VARCHAR(200),  -- Ahorro estimado en tiempo/dinero
    
    -- Estado y control
    status VARCHAR(20) DEFAULT 'draft',  -- draft, in_review, published, archived
    author_id UUID NOT NULL REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    
    -- Aplicabilidad
    applicable_areas TEXT[],  -- Áreas donde aplica
    is_repeatable BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Tabla de categorías de lecciones aprendidas
CREATE TABLE lesson_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECCIÓN 8: TABLAS DE EXPERTOS INTERNOS
-- ============================================================

-- Tabla de expertos (perfil de conocimiento)
CREATE TABLE experts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Información profesional
    headline VARCHAR(200),  -- Título profesional (ej: "Experto en Gestión de Inventario")
    bio TEXT,
    
    -- Disponibilidad
    availability_status VARCHAR(20) DEFAULT 'available',  -- available, busy, unavailable
    preferred_contact VARCHAR(50),  -- email, phone, chat
    response_time VARCHAR(50),  -- "En 24 horas", "Esta semana", etc.
    
    -- Métricas
    total_consultations INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2),
    total_ratings INTEGER DEFAULT 0,
    
    -- Estado
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Redes sociales profesionales
    linkedin_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de habilidades/conocimientos de expertos
CREATE TABLE expert_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
    
    -- Información de la habilidad
    skill_name VARCHAR(100) NOT NULL,
    skill_category VARCHAR(100),
    
    -- Nivel de expertise
    expertise_level VARCHAR(20) DEFAULT 'intermediate',  -- beginner, intermediate, advanced, expert
    years_experience INTEGER,
    
    -- Certificaciones
    certifications TEXT[],
    
    -- Validación
    endorsements_count INTEGER DEFAULT 0,
    is_validated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de respaldo de endorsements (validaciones de otros usuarios)
CREATE TABLE skill_endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_skill_id UUID NOT NULL REFERENCES expert_skills(id) ON DELETE CASCADE,
    endorsed_by UUID NOT NULL REFERENCES profiles(id),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(expert_skill_id, endorsed_by)
);

-- ============================================================
-- SECCIÓN 9: TABLAS DE MÉTRICAS Y ANALYTICS
-- ============================================================

-- Tabla de logs de actividad general
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Quién y qué
    user_id UUID REFERENCES profiles(id),
    action_type VARCHAR(50) NOT NULL,  -- view, create, update, delete, search, etc.
    entity_type VARCHAR(50) NOT NULL,  -- document, lesson, interview, etc.
    entity_id UUID,
    
    -- Detalles
    metadata JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de vistas de documentos
CREATE TABLE document_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    time_spent_seconds INTEGER,  -- Tiempo en la página
    completion_percentage INTEGER  -- Qué tanto del documento leyó
);

-- Tabla de logs de búsqueda
CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    
    -- Información de búsqueda
    search_query TEXT NOT NULL,
    filters_applied JSONB DEFAULT '{}',
    
    -- Resultados
    results_count INTEGER DEFAULT 0,
    clicked_result_id UUID,  -- Qué documento clickeó
    
    -- Performance
    response_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de métricas diarias agregadas (para dashboards rápidos)
CREATE TABLE daily_metrics (
    id DATE PRIMARY KEY,
    
    -- Documentos
    total_documents INTEGER DEFAULT 0,
    new_documents INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    
    -- Usuarios
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    
    -- Contenido
    articles_published INTEGER DEFAULT 0,
    lessons_learned_count INTEGER DEFAULT 0,
    interviews_completed INTEGER DEFAULT 0,
    
    -- Engagement
    total_bookmarks INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECCIÓN 10: TABLAS DE FAQs
-- ============================================================

-- Tabla de FAQs
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    
    -- Clasificación
    category VARCHAR(100),
    tags TEXT[],
    
    -- Relacionar con documentos
    related_document_id UUID REFERENCES documents(id),
    
    -- Metadatos
    author_id UUID REFERENCES profiles(id),
    status VARCHAR(20) DEFAULT 'published',  -- draft, published, archived
    
    -- Votación
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Orden
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de votos de FAQs
CREATE TABLE faq_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faq_id UUID NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL,  -- up, down
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(faq_id, user_id)
);

-- ============================================================
-- SECCIÓN 11: ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ============================================================

-- Índices para documentos
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_author ON documents(author_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created ON documents(created_at DESC);
CREATE INDEX idx_documents_title_search ON documents USING gin(to_tsvector('spanish', title || ' ' || summary));

-- Índices para categorías
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = TRUE;

-- Índices para usuarios
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_profiles_area ON profiles(area_id);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Índices para onboarding
CREATE INDEX idx_onboarding_progress_user ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_status ON onboarding_progress(status);

-- Índices para exit interviews
CREATE INDEX idx_exit_interviews_employee ON exit_interviews(employee_id);
CREATE INDEX idx_exit_interviews_status ON exit_interviews(status);

-- Índices para lecciones aprendidas
CREATE INDEX idx_lessons_category ON lessons_learned(category);
CREATE INDEX idx_lessons_priority ON lessons_learned(priority);
CREATE INDEX idx_lessons_status ON lessons_learned(status);

-- Índices para métricas
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_document_views_document ON document_views(document_id);
CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_created ON search_logs(created_at DESC);

-- Índices para expertos
CREATE INDEX idx_expert_skills_expert ON expert_skills(expert_id);
CREATE INDEX idx_expert_skills_name ON expert_skills(skill_name);

-- ============================================================
-- SECCIÓN 12: FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_paths_updated_at BEFORE UPDATE ON onboarding_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_modules_updated_at BEFORE UPDATE ON onboarding_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exit_interviews_updated_at BEFORE UPDATE ON exit_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_responses_updated_at BEFORE UPDATE ON interview_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extracted_knowledge_updated_at BEFORE UPDATE ON extracted_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_learned_updated_at BEFORE UPDATE ON lessons_learned
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar usage_count en tags
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_usage_on_document_tags
    AFTER INSERT OR DELETE ON document_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- ============================================================
-- SECCIÓN 13: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_learned ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_votes ENABLE ROW LEVEL SECURITY;

-- Políticas base (ejemplos - ajustar según necesidades)
-- Nota: Estas son políticas mínimas, ajustar según el modelo de negocio

-- Profiles: usuarios ven su propio perfil y admins ven todos
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Documents: según status y access_level
CREATE POLICY "Published documents are viewable by all authenticated" ON documents
    FOR SELECT USING (
        status = 'published' OR 
        author_id = (SELECT user_id FROM profiles WHERE auth.uid() = user_id)
    );

-- Para admins, todas las políticas son más permissivas
-- (se maneja con roles específicos en el código de aplicación)

-- ============================================================
-- SECCIÓN 14: SEED DATA - DATOS INICIALES
-- ============================================================

-- Roles del sistema
INSERT INTO roles (name, display_name, description, permissions, is_system) VALUES
('admin', 'Administrador', 'Acceso completo al sistema', '["*"]', TRUE),
('editor', 'Editor', 'Puede crear y editar contenido', '["documents.create", "documents.edit", "documents.delete", "lessons.create", "lessons.edit"]', TRUE),
('contributor', 'Contribuidor', 'Puede crear contenido en draft', '["documents.create", "documents.edit_own"]', TRUE),
('viewer', 'Espectador', 'Solo puede ver contenido publicado', '["documents.view"]', TRUE),
('hr_manager', 'Gestor RH', 'Gestiona onboarding y entrevistas', '["onboarding.manage", "exit_interviews.manage"]', TRUE);

-- Departamentos de Tottus
INSERT INTO departments (name, code, description) VALUES
('Recursos Humanos', 'RRHH', 'Gestión de personal y desarrollo organizacional'),
('Operaciones', 'OPS', 'Operaciones de tienda y logística'),
('Ventas', 'VTAS', 'Ventas y atención al cliente'),
('Logística', 'LOG', 'Cadena de suministro y distribución'),
('Administración y Finanzas', 'ADMIN', 'Finanzas, contabilidad y administración'),
('Marketing', 'MKT', 'Marketing y comunicaciones'),
('Tecnología', 'TI', 'Sistemas y tecnología'),
('Seguridad', 'SEG', 'Seguridad corporativa y prevención');

-- Áreas por departamento
INSERT INTO areas (name, code, department_id) 
SELECT 'Reclutamiento y Selección', 'RRHH-RECLUT', id FROM departments WHERE code = 'RRHH'
UNION ALL
SELECT 'Capacitación y Desarrollo', 'RRHH-CAPAC', id FROM departments WHERE code = 'RRHH'
UNION ALL
SELECT 'Nómina y Beneficios', 'RRHH-NOMINA', id FROM departments WHERE code = 'RRHH'
UNION ALL
SELECT 'Operaciones de Tienda', 'OPS-TIENDA', id FROM departments WHERE code = 'OPS'
UNION ALL
SELECT 'Control de Calidad', 'OPS-CALIDAD', id FROM departments WHERE code = 'OPS'
UNION ALL
SELECT 'Cajas y Cobranzas', 'VTAS-CAJAS', id FROM departments WHERE code = 'VTAS'
UNION ALL
SELECT 'Atención al Cliente', 'VTAS-ATCLIE', id FROM departments WHERE code = 'VTAS'
UNION ALL
SELECT 'Depósito y Distribución', 'LOG-DEPOS', id FROM departments WHERE code = 'LOG'
UNION ALL
SELECT 'Compras', 'LOG-COMPRAS', id FROM departments WHERE code = 'LOG';

-- Categorías de documentos
INSERT INTO categories (name, slug, description, icon, color, order_index) VALUES
('Manuales Operativos', 'manuales-operativos', 'Procedimientos y manuales de operación', '📋', '#00a651', 1),
('Políticas', 'politicas', 'Políticas corporativas y regulaciones', '📜', '#f7941d', 2),
('Procesos', 'procesos', 'Descripción de procesos de negocio', '🔄', '#00b4d8', 3),
('Capacitación', 'capacitacion', 'Materiales de entrenamiento', '🎓', '#6610f2', 4),
('Seguridad', 'seguridad', 'Protocolos de seguridad', '🛡️', '#dc3545', 5),
('Recursos Humanos', 'recursos-humanos', 'Políticas y procedimientos de RRHH', '👥', '#e83e8c', 6),
('Tecnología', 'tecnologia', 'Guías técnicas y de sistemas', '💻', '#20c997', 7),
('Mejores Prácticas', 'mejores-practicas', 'Best practices y tips', '⭐', '#fd7e14', 8);

-- Categorías de lecciones aprendidas
INSERT INTO lesson_categories (name, description, color, order_index) VALUES
('Éxito', 'Logramos un resultado positivo', '#00a651', 1),
('Error', ' Cometimos un error que debemos aprender', '#dc3545', 2),
('Mejora', 'Encontramos una forma de mejorar', '#f7941d', 3),
('Innovación', 'Innovamos exitosamente', '#00b4d8', 4),
('Riesgo', 'Identificamos un riesgo', '#6610f2', 5);

-- Plantillas de entrevista de salida
INSERT INTO interview_templates (name, description, category, questions, created_by) VALUES
('Entrevista General', 'Entrevista estándar de salida', 'general', '[
    {"order": 1, "question": "¿Cuáles fueron sus principales logros durante su tiempo en Tottus?", "type": "text", "required": true},
    {"order": 2, "question": "¿Qué aspectos de la cultura organizacional le gustaron más?", "type": "text", "required": false},
    {"order": 3, "question": "¿Qué mejoras sugeriría para su área de trabajo?", "type": "text", "required": true},
    {"order": 4, "question": "¿Recomendaría Tottus como lugar de trabajo? (1-5)", "type": "rating", "required": true},
    {"order": 5, "question": "¿Hay conocimiento específico que considera importante transferir?", "type": "yes_no", "required": true}
]', NULL),
('Entrevista Técnica', 'Entrevista enfocada en conocimiento técnico', 'technical', '[
    {"order": 1, "question": "¿Cuáles son los procesos técnicos que domina?", "type": "text", "required": true},
    {"order": 2, "question": "¿Qué herramientas o sistemas conoce que otros deberían aprender?", "type": "text", "required": true},
    {"order": 3, "question": "¿Hay algún proceso que podría automatizarse?", "type": "text", "required": false},
    {"order": 4, "question": "¿Quién debería asumir sus responsabilidades técnicas?", "type": "text", "required": true}
]', NULL);

-- Mensaje de éxito
COMMENT ON SCHEMA public IS 'KMS Tottus Perú - Sistema de Gestión del Conocimiento';