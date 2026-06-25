-- ============================================================
-- KMS Papa Johns - Tabla de Buenas Prácticas
-- Sistema de Gestión del Conocimiento
-- Módulo: Buenas Prácticas Operativas
-- Fecha: 2026-06-23
-- ============================================================

-- ============================================================
-- SECCIÓN 1: ENUMS
-- ============================================================

-- Estados de buena práctica
CREATE TYPE best_practice_status AS ENUM (
    'draft',       -- Borrador, no publicada
    'published',   -- Publicada y visible
    'archived'     -- Archivado, solo visible para admins
);

-- Prioridad de buena práctica
CREATE TYPE best_practice_priority AS ENUM (
    'low',        -- Baja - nice to have
    'medium',     -- Media - recomendada
    'high',       -- Alta - muy importante
    'critical'    -- Crítica - crítica para operaciones
);

-- ============================================================
-- SECCIÓN 2: TABLA PRINCIPAL
-- ============================================================

-- Tabla de buenas prácticas
CREATE TABLE best_practices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identificación
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,  -- Resumen corto para tarjetas

    -- Contenido estructurado
    objective TEXT,              -- Objetivo de la práctica
    description TEXT,             -- Descripción detallada
    procedure JSONB DEFAULT '[]', -- Pasos ordenados: [{"step": 1, "title": "...", "description": "..."}]
    benefits TEXT,               -- Beneficios esperados
    situations TEXT,              -- Situaciones donde aplicar

    -- Clasificación
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    priority best_practice_priority DEFAULT 'medium',

    -- Metadatos
    tags TEXT[],                  -- Etiquetas para búsqueda y filtrado
    status best_practice_status DEFAULT 'draft',

    -- Conteos
    view_count INTEGER DEFAULT 0,

    -- Control de versiones y autor
    version INTEGER DEFAULT 1,
    author_id UUID NOT NULL REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),

    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ  -- Soft delete

    -- Relacion con lección aprendida origen (opcional)
    -- source_lesson_id UUID REFERENCES lessons_learned(id) ON DELETE SET NULL
);

-- ============================================================
-- SECCIÓN 3: ÍNDICES
-- ============================================================

-- Índices para búsqueda y filtrado
CREATE INDEX idx_best_practices_status ON best_practices(status);
CREATE INDEX idx_best_practices_priority ON best_practices(priority);
CREATE INDEX idx_best_practices_area ON best_practices(area_id);
CREATE INDEX idx_best_practices_category ON best_practices(category_id);
CREATE INDEX idx_best_practices_author ON best_practices(author_id);
CREATE INDEX idx_best_practices_created ON best_practices(created_at DESC);
CREATE INDEX idx_best_practices_view_count ON best_practices(view_count DESC);

-- Índice para búsqueda full-text
CREATE INDEX idx_best_practices_title_search ON best_practices USING gin(to_tsvector('spanish', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(objective, '')));

-- Índice para tags
CREATE INDEX idx_best_practices_tags ON best_practices USING gin(tags);

-- ============================================================
-- SECCIÓN 4: FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_best_practices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER update_best_practices_updated_at BEFORE UPDATE ON best_practices
    FOR EACH ROW EXECUTE FUNCTION update_best_practices_updated_at();

-- ============================================================
-- SECCIÓN 5: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE best_practices ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden ver prácticas publicadas
CREATE POLICY "Published best practices are viewable by all authenticated"
    ON best_practices FOR SELECT
    USING (
        status = 'published'
        OR author_id IN (
            SELECT id FROM profiles WHERE auth.uid() = user_id
        )
    );

-- Política: Usuarios pueden crear prácticas
CREATE POLICY "Authenticated users can create best practices"
    ON best_practices FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Autores pueden actualizar sus prácticas
CREATE POLICY "Authors can update their best practices"
    ON best_practices FOR UPDATE
    USING (author_id IN (
        SELECT id FROM profiles WHERE auth.uid() = user_id
    ));

-- Política: Soft delete - solo el autor o admin pueden eliminar
CREATE POLICY "Authors can soft delete their best practices"
    ON best_practices FOR DELETE
    USING (author_id IN (
        SELECT id FROM profiles WHERE auth.uid() = user_id
    ));

-- ============================================================
-- SECCIÓN 6: RPC PARA INCREMENTAR VISTAS
-- ============================================================

CREATE OR REPLACE FUNCTION increment_best_practice_view_count(practice_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE best_practices
    SET view_count = view_count + 1
    WHERE id = practice_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECCIÓN 7: SEED DATA - CATEGORÍAS
-- ============================================================

-- Nota: Las categorías se pueden agregar manualmente o mediante seed
-- INSERT INTO categories (name, slug, description, color, order_index)
-- VALUES ('Buenas Prácticas', 'buenas-practicas', 'Mejores prácticas operativas', '#ffb500', 9);

-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE best_practices IS 'Tabla de buenas prácticas operativas - conocimiento estandarizado';
COMMENT ON COLUMN best_practices.procedure IS 'JSON array de pasos: [{"step": 1, "title": "Título", "description": "Descripción"}]';
COMMENT ON COLUMN best_practices.source_lesson_id IS 'Referencia opcional a lección aprendida que originó esta práctica';
