-- ============================================================
-- FIX DEFINITIVO: Actualizar categorías SIN eliminar nada
-- Ejecutar después de los bloques 1-4 de la migración 010
-- NO elimina categorías existentes - solo actualiza module_type y agrega nuevas
-- ============================================================

BEGIN;

-- 1. Asegurar que module_type exista (si no fue creado en migración anterior)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'module_type'
    ) THEN
        ALTER TABLE categories 
        ADD COLUMN module_type VARCHAR(50) DEFAULT 'document';
    END IF;
END $$;

-- 2. ACTUALIZAR module_type de categorías existentes (NO eliminar)
-- Categorías de REPOSITORIO/DOCUMENTOS (las que ya existían)
UPDATE categories SET module_type = 'document', is_active = true
WHERE slug IN (
    'manuales-operativos', 'politicas', 'procesos', 'capacitacion', 
    'seguridad', 'recursos-humanos', 'tecnologia', 'mejores-practicas',
    -- También los que se agregaron en migración 008
    'operaciones-cocina', 'atencion-cliente', 'control-calidad',
    'gestion-inventario', 'seguridad-higiene', 'liderazgo-equipo'
);

-- 3. AGREGAR categorías de LECCIONES que falten (no tocar las existentes)
INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
SELECT * FROM (VALUES
    ('Incidencia', 'incidencia', 'Incidencias y problemas operativos', '#dc3545', 'lesson', 1, true),
    ('Mejora', 'mejora', 'Mejoras implementadas exitosamente', '#28a745', 'lesson', 2, true),
    ('Proyecto', 'proyecto', 'Lecciones de proyectos específicos', '#6610f2', 'lesson', 3, true),
    ('Capacitación', 'capacitacion-lesson', 'Aprendizajes para capacitación', '#17a2b8', 'lesson', 4, true),
    ('General', 'general-lesson', 'Lecciones generales aplicables', '#6c757d', 'lesson', 5, true)
) AS v(name, slug, description, color, module_type, order_index, is_active)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = v.slug AND module_type = 'lesson');

-- 4. AGREGAR categorías de BUENAS PRÁCTICAS que falten
INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
SELECT * FROM (VALUES
    ('Cocina', 'cocina-bp', 'Prácticas de preparación en cocina', '#e31837', 'best_practice', 1, true),
    ('Caja', 'caja-bp', 'Prácticas de caja y cobro', '#0077b6', 'best_practice', 2, true),
    ('Delivery', 'delivery-bp', 'Prácticas de delivery y repartición', '#ffb500', 'best_practice', 3, true),
    ('Inventarios', 'inventarios-bp', 'Prácticas de gestión de inventarios', '#1a472a', 'best_practice', 4, true),
    ('Limpieza', 'limpieza-bp', 'Prácticas de limpieza e higiene', '#20c997', 'best_practice', 5, true),
    ('Trabajo en Equipo', 'trabajo-equipo-bp', 'Prácticas de liderazgo y trabajo en equipo', '#6610f2', 'best_practice', 6, true)
) AS v(name, slug, description, color, module_type, order_index, is_active)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = v.slug AND module_type = 'best_practice');

-- 5. Actualizar categorías de lecciones原来的 (lesson_categories迁移过来的)
-- Si tienen slug duplicado con documentos, agregar sufijo
UPDATE categories 
SET slug = slug || '-old'
WHERE module_type = 'lesson' 
AND slug IN (
    SELECT slug FROM categories WHERE module_type = 'document'
);

-- 6. Limpiar lección_categories (ya no se usa, pero mantener por seguridad)
-- No eliminar, solo marcar como inactiva
-- DELETE FROM lesson_categories; -- DESCOMENTA si quieres eliminar definitivamente

-- 7. Verificar resultado
SELECT 
    'Departments' as table_name, COUNT(*) as count 
FROM departments WHERE is_active = true
UNION ALL
SELECT 
    'Areas' as table_name, COUNT(*) as count 
FROM areas WHERE is_active = true
UNION ALL
SELECT 
    'Categories Total' as table_name, COUNT(*) as count 
FROM categories
UNION ALL
SELECT 
    'Categories Activas' as table_name, COUNT(*) as count 
FROM categories WHERE is_active = true;

-- Ver categorías por módulo
SELECT module_type, COUNT(*) as count
FROM categories
GROUP BY module_type
ORDER BY module_type;

COMMIT;
