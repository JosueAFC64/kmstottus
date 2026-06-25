-- ============================================================
-- FIX: Actualizar referencias a categorías antes de limpiar
-- Ejecutar ANTES del bloque 5 de la migración 010
-- ============================================================

-- 1. Ver qué categorías están siendo usadas por documentos
SELECT c.id, c.name, c.slug, COUNT(d.id) as document_count
FROM categories c
LEFT JOIN documents d ON d.category_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY document_count DESC;

-- 2. Encontrar la categoría "Manuales" (la primera de documentos) para usarla como默认值
-- Si no existe, buscar cualquier categoría activa de documentos
DO $$
DECLARE
    default_category_id UUID;
BEGIN
    -- Buscar la categoría "Manuales" o la primera disponible de documentos
    SELECT id INTO default_category_id
    FROM categories
    WHERE slug = 'manuales' AND is_active = true
    LIMIT 1;
    
    -- Si no existe "Manuales", buscar cualquier categoría activa
    IF default_category_id IS NULL THEN
        SELECT id INTO default_category_id
        FROM categories
        WHERE is_active = true
        ORDER BY order_index
        LIMIT 1;
    END IF;
    
    -- Si encontramos una categoría, actualizar los documentos que referencian categorías eliminadas
    IF default_category_id IS NOT NULL THEN
        -- Actualizar documentos con categorías eliminadas (is_active = false)
        UPDATE documents
        SET category_id = default_category_id
        WHERE category_id IN (
            SELECT id FROM categories WHERE is_active = false
        );
        
        RAISE NOTICE 'Documentos actualizados a categoría default: %', default_category_id;
    ELSE
        RAISE NOTICE 'ADVERTENCIA: No se encontró categoría default para reasignar';
    END IF;
END $$;

-- 3. Ahora sí podemos eliminar las categorías inactivas (si no tienen otras referencias)
-- NOTA: lessons_learned usa 'category' (VARCHAR con nombre), no category_id (UUID)
DELETE FROM categories 
WHERE is_active = false
AND id NOT IN (SELECT category_id FROM documents WHERE category_id IS NOT NULL)
AND id NOT IN (SELECT category_id FROM best_practices WHERE category_id IS NOT NULL);

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
