-- ============================================================
-- VERIFICACIÓN COMPLETA DEL ESTADO FINAL
-- ============================================================

-- 1. Ver categorías por módulo
SELECT module_type, name, slug, color FROM categories 
WHERE is_active = true 
ORDER BY module_type, order_index, name;

-- 2. Verificar departments
SELECT name, code FROM departments WHERE is_active = true ORDER BY code;

-- 3. Verificar areas por departamento
SELECT d.name as departamento, a.name as area, a.code
FROM areas a
JOIN departments d ON d.id = a.department_id
WHERE a.is_active = true
ORDER BY d.code, a.code;

-- 4. Contadores finales
SELECT 
    'Departamentos' as entidad, COUNT(*) as cantidad FROM departments WHERE is_active = true
UNION ALL
SELECT 
    'Áreas' as entidad, COUNT(*) as cantidad FROM areas WHERE is_active = true
UNION ALL
SELECT 
    'Categorías' as entidad, COUNT(*) as cantidad FROM categories WHERE is_active = true;
