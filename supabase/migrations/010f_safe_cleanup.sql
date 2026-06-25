-- ============================================================
-- LIMPIEZA SEGURA: Ver y corregir duplicados paso a paso
-- ============================================================

BEGIN;

-- 1. Ver qué existe actualmente
SELECT id, name, slug, module_type FROM categories ORDER BY slug;

-- 2. Primero eliminar categorías problemáticas de lesson que tienen slugs duplicados
-- "capacitacion" existe tanto en document como en lesson
DELETE FROM categories 
WHERE slug = 'capacitacion-lesson' AND module_type = 'lesson';

-- 3. Eliminar duplicados exactos de lesson (general-general-lesson)
DELETE FROM categories 
WHERE slug = 'general-lesson' AND module_type = 'lesson';

-- 4. Eliminar categorías de best_practice sin sufijo
DELETE FROM categories 
WHERE module_type = 'best_practice' 
AND slug IN ('cocina', 'caja', 'delivery', 'inventarios', 'limpieza', 'trabajo-equipo');

-- 5. Eliminar categorías que están mal asignadas a document
DELETE FROM categories 
WHERE module_type = 'document' 
AND slug IN (
    'operaciones-cocina', 
    'atencion-cliente', 
    'control-calidad', 
    'gestion-inventario', 
    'seguridad-higiene', 
    'liderazgo-equipo'
);

-- 6. Si "general" de lesson tiene problema, agregar slug único
UPDATE categories 
SET slug = 'general-leccion'
WHERE name ILIKE '%General%' AND module_type = 'lesson' AND slug = 'general';

-- 7. Verificar resultado
SELECT module_type, COUNT(*) as count FROM categories GROUP BY module_type ORDER BY module_type;

-- 8. Mostrar todas
SELECT name, slug, module_type FROM categories WHERE is_active = true ORDER BY module_type, name;

COMMIT;
