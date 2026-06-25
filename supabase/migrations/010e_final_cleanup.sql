-- ============================================================
-- LIMPIEZA FINAL: Eliminar duplicados de categorías
-- ============================================================

BEGIN;

-- 1. ELIMINAR CATEGORÍAS DUPLICADAS DE best_practice
-- Quedarse con las que tienen sufijo -bp, eliminar las sin sufijo
DELETE FROM categories 
WHERE module_type = 'best_practice' 
AND slug IN ('cocina', 'caja', 'delivery', 'inventarios', 'limpieza', 'trabajo-equipo');

-- 2. ELIMINAR CATEGORÍAS DUPLICADAS DE document (las que deberían ser de otros módulos)
-- Estas categorías tienen nombres que no corresponden a documentos
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

-- 3. UNIFICAR CATEGORÍAS DE lesson
-- "General" aparece dos veces, quedarse con una
DELETE FROM categories 
WHERE module_type = 'lesson' 
AND slug = 'general-lesson';

-- 4. ACTUALIZAR SLUGS de lesson para que sean limpios
UPDATE categories SET slug = 'general' WHERE module_type = 'lesson' AND slug = 'general';
UPDATE categories SET slug = 'capacitacion' WHERE module_type = 'lesson' AND slug = 'capacitacion-lesson';

-- 5. ACTUALIZAR NOMBRES para que coincidan con slugs
UPDATE categories SET name = 'Manuales' WHERE slug = 'manuales';
UPDATE categories SET name = 'Manuales Operativos' WHERE slug = 'manuales-operativos';

-- 6. VERIFICAR resultado final
SELECT 
    module_type, 
    COUNT(*) as count,
    ARRAY_AGG(name ORDER BY name) as categories
FROM categories
WHERE is_active = true
GROUP BY module_type
ORDER BY module_type;

-- 7. Mostrar todas las categorías finales
SELECT name, slug, module_type, color
FROM categories
WHERE is_active = true
ORDER BY module_type, order_index, name;

COMMIT;
