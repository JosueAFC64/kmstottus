-- ============================================================
-- VERIFICAR Y ARREGLAR
-- ============================================================

-- 1. Ver estado actual
SELECT id, name, slug, module_type FROM categories ORDER BY slug;

-- 2. Verificar si "general-leccion" ya existe
-- Si ya existe, solo eliminar "Manuales" duplicado

-- 3. Eliminar "Manuales" duplicado (quedarse con "Manuales Operativos")
DELETE FROM categories WHERE slug = 'manuales' AND module_type = 'document';

-- 4. Verificar si "capacitacion-leccion" existe
-- Si no existe, agregarla
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'capacitacion-leccion') THEN
        INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
        VALUES ('Capacitación', 'capacitacion-leccion', 'Aprendizajes para capacitación', '#17a2b8', 'lesson', 4, true);
    END IF;
END $$;

-- 5. Verificar resultado final
SELECT 
    module_type, 
    COUNT(*) as total
FROM categories
WHERE is_active = true
GROUP BY module_type
ORDER BY module_type;
