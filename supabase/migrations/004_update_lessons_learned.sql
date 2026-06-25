-- ============================================================
-- MIGRACIÓN 004: ACTUALIZAR TABLA LESSONS_LEARNED
-- ============================================================
-- Agrega campos faltantes según el spec del módulo:
-- - problema_identificado
-- - causa_raiz
-- - view_count
-- - area_id (para filtrar por área)
-- - Actualiza valores de status
-- - Agrega índices necesarios
-- - Configura RLS policies
-- ============================================================

-- ============================================================
-- 1. AGREGAR COLUMNAS FALTANTES
-- ============================================================
ALTER TABLE lessons_learned
ADD COLUMN IF NOT EXISTS problema_identificado TEXT,
ADD COLUMN IF NOT EXISTS causa_raiz TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id);

-- Migrar datos existentes de department_id a area_id (si hay relación directa)
-- Si un área tiene un departamento, intentamos encontrar el área correspondiente
UPDATE lessons_learned ll
SET area_id = (
    SELECT a.id FROM areas a 
    WHERE a.department_id = ll.department_id 
    LIMIT 1
)
WHERE ll.department_id IS NOT NULL AND ll.area_id IS NULL;

-- ============================================================
-- 2. AGREGAR ÍNDICES PARA BÚSQUEDA Y FILTROS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lessons_department ON lessons_learned(department_id);
CREATE INDEX IF NOT EXISTS idx_lessons_author ON lessons_learned(author_id);
CREATE INDEX IF NOT EXISTS idx_lessons_tags ON lessons_learned USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted_at ON lessons_learned(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_view_count ON lessons_learned(view_count DESC);

-- ============================================================
-- 3. CREAR TABLA DE CATEGORÍAS SI NO EXISTE
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categorías por defecto
INSERT INTO lesson_categories (name, description, color, icon, order_index) VALUES
    ('Error Operativo', 'Errores frecuentes durante la operación diaria', '#dc3545', 'alert-circle', 1),
    ('Mejora de Proceso', 'Mejoras implementadas en procesos existentes', '#28a745', 'trending-up', 2),
    ('Problema en Campaña', 'Problemas ocurridos durante campañas', '#ffc107', 'megaphone', 3),
    ('Capacitación', 'Recomendaciones para capacitar nuevos colaboradores', '#17a2b8', 'book-open', 4),
    ('Incidencia Operativa', 'Soluciones a incidencias operativas', '#6c757d', 'alert-triangle', 5),
    ('Proyecto', 'Lecciones de proyectos específicos', '#6610f2', 'folder', 6),
    ('General', 'Lecciones generales aplicables a múltiples áreas', '#495057', 'info', 7)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. HABILITAR RLS PARA lesson_categories SI NO ESTÁ
-- ============================================================
ALTER TABLE lesson_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. POLÍTICAS RLS PARA lesson_categories
-- ============================================================

-- cualquier usuario autenticado puede ver categorías activas
CREATE POLICY "Lesson categories: anyone can view" ON lesson_categories
    FOR SELECT USING (is_active = true);

-- Solo admins pueden insertar/actualizar/eliminar categorías
CREATE POLICY "Lesson categories: admin can manage" ON lesson_categories
    FOR ALL USING (true);

-- ============================================================
-- 5b. POLÍTICAS RLS PARA areas
-- ============================================================
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario puede ver áreas activas
CREATE POLICY "Areas: anyone can view" ON areas
    FOR SELECT USING (is_active = true);

-- Solo admins pueden gestionar áreas
CREATE POLICY "Areas: admin can manage" ON areas
    FOR ALL USING (true);

-- ============================================================
-- 6. POLÍTICAS RLS PARA LECCIONES
-- ============================================================

-- Política de lectura: usuarios autenticados ven published
-- Autores ven sus propias lecciones (incluyendo borradores)
-- Admins ven todo
DROP POLICY IF EXISTS "Lessons: anyone can view published" ON lessons_learned;
CREATE POLICY "Lessons: anyone can view published" ON lessons_learned
    FOR SELECT USING (
        status = 'published'
        OR author_id = (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Política de inserción: cualquier usuario autenticado
DROP POLICY IF EXISTS "Lessons: authenticated can create" ON lessons_learned;
CREATE POLICY "Lessons: authenticated can create" ON lessons_learned
    FOR INSERT WITH CHECK (
        author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Política de actualización: autor o admin
DROP POLICY IF EXISTS "Lessons: author can update" ON lessons_learned;
CREATE POLICY "Lessons: author can update" ON lessons_learned
    FOR UPDATE USING (
        author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Política de eliminación: soft delete, solo author o admin
DROP POLICY IF EXISTS "Lessons: author can delete" ON lessons_learned;
CREATE POLICY "Lessons: author can delete" ON lessons_learned
    FOR DELETE USING (
        author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- 7. FUNCIÓN PARA INCREMENTAR VIEW_COUNT
-- ============================================================
CREATE OR REPLACE FUNCTION increment_lesson_view_count(lesson_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE lessons_learned
    SET view_count = view_count + 1
    WHERE id = lesson_id AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. VERIFICACIÓN
-- ============================================================
-- Descomenta para verificar:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'lessons_learned'
-- ORDER BY ordinal_position;
