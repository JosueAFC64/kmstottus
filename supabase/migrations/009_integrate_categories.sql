-- ============================================================
-- MIGRACIÓN 009: INTEGRAR lesson_categories EN categories
-- Fecha: 2026-06-23
-- ============================================================
-- Objetivo: Unificar todas las categorías en una sola tabla
-- Las lecciones aprendidas usarán categories con module_type = 'lesson'
-- Las buenas prácticas usarán categories con module_type = 'best_practice'
-- Los documentos usarán categories con module_type = 'document'
-- ============================================================

-- ============================================================
-- 1. ASEGURAR QUE categories TENGA module_type
-- ============================================================
-- (Si no existe la columna, la crea. Si ya existe, no hace nada)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'module_type'
    ) THEN
        ALTER TABLE categories 
        ADD COLUMN module_type VARCHAR(50) DEFAULT 'document';
        
        CREATE INDEX IF NOT EXISTS idx_categories_module_type ON categories(module_type);
    END IF;
END $$;

-- ============================================================
-- 2. MIGRAR DATOS DE lesson_categories A categories
-- ============================================================

-- Función para generar slug desde name
CREATE OR REPLACE FUNCTION generate_category_slug(name VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
            '\s+',
            '-',
            'g'
        )
    ) || '-' || LEFT(MD5(RANDOM()::TEXT), 4);  -- Sufijo único para evitar duplicados
END;
$$ LANGUAGE plpgsql;

-- Insertar categorías de lecciones en categories
-- Usa ON CONFLICT para manejar duplicados
INSERT INTO categories (name, slug, description, color, icon, module_type, order_index, is_active)
SELECT 
    lc.name,
    COALESCE(
        (SELECT slug FROM categories WHERE name = lc.name AND module_type = 'lesson' LIMIT 1),
        generate_category_slug(lc.name)
    ) AS slug,
    lc.description,
    lc.color,
    lc.icon,
    'lesson' AS module_type,
    lc.order_index,
    lc.is_active
FROM lesson_categories lc
WHERE lc.is_active = true
ON CONFLICT (slug) DO UPDATE SET
    module_type = EXCLUDED.module_type,
    description = COALESCE(categories.description, EXCLUDED.description),
    color = COALESCE(categories.color, EXCLUDED.color),
    icon = COALESCE(categories.icon, EXCLUDED.icon),
    order_index = COALESCE(categories.order_index, EXCLUDED.order_index);

-- ============================================================
-- 3. ACTUALIZAR lesson_categories PARA QUE APUNTE A categories
-- ============================================================

-- Agregar columna para guardar la referencia al ID en categories
ALTER TABLE lesson_categories 
ADD COLUMN IF NOT EXISTS migrated_category_id UUID REFERENCES categories(id);

-- Actualizar la referencia
UPDATE lesson_categories lc
SET migrated_category_id = c.id
FROM categories c
WHERE c.name = lc.name AND c.module_type = 'lesson';

-- ============================================================
-- 4. CREAR CATEGORÍAS DE BUENAS PRÁCTICAS SI NO EXISTEN
-- ============================================================

INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
VALUES 
    ('Operaciones de Cocina', 'operaciones-cocina', 'Prácticas relacionadas con la preparación en cocina', '#e31837', 'best_practice', 10, true),
    ('Atención al Cliente', 'atencion-cliente', 'Prácticas para mejorar la atención al cliente', '#0077b6', 'best_practice', 11, true),
    ('Control de Calidad', 'control-calidad', 'Prácticas de control de calidad', '#ffb500', 'best_practice', 12, true),
    ('Gestión de Inventario', 'gestion-inventario', 'Prácticas para gestión de inventarios y stock', '#1a472a', 'best_practice', 13, true),
    ('Seguridad e Higiene', 'seguridad-higiene', 'Prácticas de seguridad e higiene alimentaria', '#dc3545', 'best_practice', 14, true),
    ('Liderazgo y Trabajo en Equipo', 'liderazgo-equipo', 'Prácticas de liderazgo y trabajo en equipo', '#6610f2', 'best_practice', 15, true)
ON CONFLICT (slug) DO NOTHING;

-- Actualizar module_type de categorías existentes de documentos
UPDATE categories SET module_type = 'document' 
WHERE slug IN (
    'manuales-operativos',
    'politicas',
    'procesos',
    'capacitacion',
    'seguridad',
    'recursos-humanos',
    'tecnologia'
) AND (module_type IS NULL OR module_type = 'document');

-- Nota: 'mejores-practicas' se mantiene como categoría de documentos
-- (el usuario decidió no moverla a best_practice)

-- ============================================================
-- 5. NOTA SOBRE LA ELIMINACIÓN DE lesson_categories
-- ============================================================
-- Esta tabla se puede eliminar después de verificar que todo funciona
-- Para eliminarla, ejecutar:
-- DROP TABLE IF EXISTS lesson_categories;
-- 
-- Por ahora se mantiene por seguridad, pero ya no se usa en el código

-- ============================================================
-- 6. COMENTARIOS
-- ============================================================
COMMENT ON COLUMN categories.module_type IS 'Módulo: document, lesson, best_practice, o NULL';
COMMENT ON TABLE lesson_categories IS 'TABLA EN DESUSO - Migrada a categories. Mantener por seguridad temporal.';
