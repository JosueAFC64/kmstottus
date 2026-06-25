-- ============================================================
-- FIX COMPLETO: Limpiar categorías y referencias
-- Ejecutar después del bloque 4 de la migración 010
-- ============================================================

BEGIN;

-- 1. Primero, limpiar las referencias en lesson_categories
UPDATE lesson_categories 
SET migrated_category_id = NULL;

-- 2. Eliminar la foreign key de lesson_categories (ya no es necesaria)
ALTER TABLE lesson_categories 
DROP CONSTRAINT IF EXISTS lesson_categories_migrated_category_id_fkey;

-- 3. Ahora sí podemos eliminar las categorías inactivas
DELETE FROM categories 
WHERE is_active = false;

-- 4. Verificar resultado
SELECT 
    'Departments' as table_name, COUNT(*) as count 
FROM departments WHERE is_active = true
UNION ALL
SELECT 
    'Areas' as table_name, COUNT(*) as count 
FROM areas WHERE is_active = true
UNION ALL
SELECT 
    'Categories' as table_name, COUNT(*) as count 
FROM categories WHERE is_active = true;

-- 5. Ver categorías por módulo
SELECT module_type, COUNT(*) as count, array_agg(name) as categories
FROM categories
WHERE is_active = true
GROUP BY module_type
ORDER BY module_type;

COMMIT;
