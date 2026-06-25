-- ============================================================
-- MIGRACIÓN 010: REESTRUCTURACIÓN ORGANIZACIONAL Y CATEGORÍAS
-- Fecha: 2026-06-23
-- ============================================================
-- Esta migración:
-- 1. Reestructura departments con nueva jerarquía
-- 2. Reestructura areas como sub-áreas de departments
-- 3. Limpia categories por módulo sin duplicados
-- 4. Mantiene integridad referencial
-- ============================================================

BEGIN;

-- ============================================================
-- 1. LIMPIAR Y REESTRUCTURAR DEPARTMENTS
-- ============================================================

-- Primero, crear tabla temporal con nuevos departments
CREATE TEMP TABLE temp_departments AS
SELECT * FROM departments;

-- Limpiar departments existentes
TRUNCATE departments RESTART IDENTITY CASCADE;

-- Insertar nuevos departments
INSERT INTO departments (id, name, code, description, is_active, created_at, updated_at)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'Gerencia General', 'GER', 'Dirección estratégica de la empresa', true, NOW(), NOW()),
    ('d0000002-0000-0000-0000-000000000002', 'Operaciones', 'OPS', 'Producción y servicio en tienda', true, NOW(), NOW()),
    ('d0000003-0000-0000-0000-000000000003', 'Recursos Humanos', 'RRHH', 'Gestión del talento humano', true, NOW(), NOW()),
    ('d0000004-0000-0000-0000-000000000004', 'Logística', 'LOG', 'Cadena de suministro y distribución', true, NOW(), NOW()),
    ('d0000005-0000-0000-0000-000000000005', 'Administración y Finanzas', 'ADM', 'Finanzas, contabilidad y administración', true, NOW(), NOW()),
    ('d0000006-0000-0000-0000-000000000006', 'Marketing', 'MKT', 'Publicidad, marca y comunicaciones', true, NOW(), NOW()),
    ('d0000007-0000-0000-0000-000000000007', 'Tecnología', 'TI', 'Sistemas, tecnología e información', true, NOW(), NOW()),
    ('d0000008-0000-0000-0000-000000000008', 'Seguridad y Prevención', 'SEG', 'Higiene alimentaria y prevención de riesgos', true, NOW(), NOW());

-- ============================================================
-- 2. LIMPIAR Y REESTRUCTURAR AREAS
-- ============================================================

-- Primero, crear tabla temporal con áreas existentes
CREATE TEMP TABLE temp_areas AS
SELECT * FROM areas;

-- Limpiar areas existentes
TRUNCATE areas RESTART IDENTITY CASCADE;

-- Insertar nuevas áreas organizadas por departamento
INSERT INTO areas (id, name, code, department_id, is_active, created_at, updated_at)
VALUES
    -- Gerencia General
    ('a0000001-0000-0000-0000-000000000001', 'Dirección Estratégica', 'GER-DIR', 'd0000001-0000-0000-0000-000000000001', true, NOW(), NOW()),
    ('a0000001-0000-0000-0000-000000000002', 'Planeamiento', 'GER-PLA', 'd0000001-0000-0000-0000-000000000001', true, NOW(), NOW()),
    
    -- Operaciones
    ('a0000002-0000-0000-0000-000000000001', 'Cocina/Producción', 'OPS-COC', 'd0000002-0000-0000-0000-000000000002', true, NOW(), NOW()),
    ('a0000002-0000-0000-0000-000000000002', 'Caja y Atención', 'OPS-CAJ', 'd0000002-0000-0000-0000-000000000002', true, NOW(), NOW()),
    ('a0000002-0000-0000-0000-000000000003', 'Delivery', 'OPS-DEL', 'd0000002-0000-0000-0000-000000000002', true, NOW(), NOW()),
    ('a0000002-0000-0000-0000-000000000004', 'Repostería', 'OPS-REP', 'd0000002-0000-0000-0000-000000000002', true, NOW(), NOW()),
    ('a0000002-0000-0000-0000-000000000005', 'Limpieza', 'OPS-LIM', 'd0000002-0000-0000-0000-000000000002', true, NOW(), NOW()),
    ('a0000002-0000-0000-0000-000000000006', 'Control de Calidad', 'OPS-CAL', 'd0000002-0000-0000-0000-000000000002', true, NOW(), NOW()),
    ('a0000002-0000-0000-0000-000000000007', 'Supervisión de Tienda', 'OPS-SUP', 'd0000002-0000-0000-0000-000000000002', true, NOW(), NOW()),
    
    -- Recursos Humanos
    ('a0000003-0000-0000-0000-000000000001', 'Reclutamiento y Selección', 'RRHH-REC', 'd0000003-0000-0000-0000-000000000003', true, NOW(), NOW()),
    ('a0000003-0000-0000-0000-000000000002', 'Nómina y Beneficios', 'RRHH-NOM', 'd0000003-0000-0000-0000-000000000003', true, NOW(), NOW()),
    ('a0000003-0000-0000-0000-000000000003', 'Capacitación y Desarrollo', 'RRHH-CAP', 'd0000003-0000-0000-0000-000000000003', true, NOW(), NOW()),
    
    -- Logística
    ('a0000004-0000-0000-0000-000000000001', 'Depósito y Almacén', 'LOG-ALM', 'd0000004-0000-0000-0000-000000000004', true, NOW(), NOW()),
    ('a0000004-0000-0000-0000-000000000002', 'Compras', 'LOG-COM', 'd0000004-0000-0000-0000-000000000004', true, NOW(), NOW()),
    ('a0000004-0000-0000-0000-0000-000000000003', 'Distribución', 'LOG-DIS', 'd0000004-0000-0000-0000-000000000004', true, NOW(), NOW()),
    
    -- Administración y Finanzas
    ('a0000005-0000-0000-0000-000000000001', 'Contabilidad', 'ADM-CON', 'd0000005-0000-0000-0000-000000000005', true, NOW(), NOW()),
    ('a0000005-0000-0000-0000-000000000002', 'Facturación', 'ADM-FAC', 'd0000005-0000-0000-0000-000000000005', true, NOW(), NOW()),
    ('a0000005-0000-0000-0000-000000000003', 'Tesorería', 'ADM-TES', 'd0000005-0000-0000-0000-000000000005', true, NOW(), NOW()),
    
    -- Marketing
    ('a0000006-0000-0000-0000-000000000001', 'Publicidad', 'MKT-PUB', 'd0000006-0000-0000-0000-000000000006', true, NOW(), NOW()),
    ('a0000006-0000-0000-0000-000000000002', 'Redes Sociales', 'MKT-RED', 'd0000006-0000-0000-0000-000000000006', true, NOW(), NOW()),
    
    -- Tecnología
    ('a0000007-0000-0000-0000-000000000001', 'Sistemas', 'TI-SIS', 'd0000007-0000-0000-0000-000000000007', true, NOW(), NOW()),
    ('a0000007-0000-0000-0000-000000000002', 'Soporte Técnico', 'TI-SOP', 'd0000007-0000-0000-0000-000000000007', true, NOW(), NOW()),
    
    -- Seguridad y Prevención
    ('a0000008-0000-0000-0000-000000000001', 'Higiene Alimentaria', 'SEG-HIG', 'd0000008-0000-0000-0000-000000000008', true, NOW(), NOW()),
    ('a0000008-0000-0000-0000-000000000002', 'Prevención de Riesgos', 'SEG-PRI', 'd0000008-0000-0000-0000-000000000008', true, NOW(), NOW());

-- ============================================================
-- 3. LIMPIAR Y REESTRUCTURAR CATEGORIES
-- ============================================================

-- Limpiar categories manteniendo solo las que correspondan
-- Primero, desactivar todas
UPDATE categories SET is_active = false;

-- Insertar/Actualizar categorías por módulo

-- CATEGORÍAS PARA REPOSITORIO (documentos)
INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
VALUES 
    ('Manuales', 'manuales', 'Manuales operativos y guías de referencia', '#1a472a', 'document', 1, true),
    ('Políticas', 'politicas', 'Políticas corporativas y regulaciones', '#e31837', 'document', 2, true),
    ('Procedimientos', 'procedimientos', 'Descripción de procedimientos operativos', '#0077b6', 'document', 3, true),
    ('Instructivos', 'instructivos', 'Instructivos paso a paso', '#ffb500', 'document', 4, true),
    ('Fichas Técnicas', 'fichas-tecnicas', 'Fichas técnicas de productos', '#6610f2', 'document', 5, true),
    ('Plantillas', 'plantillas', 'Modelos y formatos reutilizables', '#20c997', 'document', 6, true),
    ('Recursos Humanos', 'recursos-humanos', 'Documentos de RRHH', '#e83e8c', 'document', 7, true),
    ('Tecnología', 'tecnologia', 'Guías técnicas y de sistemas', '#17a2b8', 'document', 8, true)
ON CONFLICT (slug) DO UPDATE SET
    module_type = EXCLUDED.module_type,
    order_index = EXCLUDED.order_index,
    is_active = true,
    description = EXCLUDED.description,
    color = EXCLUDED.color;

-- CATEGORÍAS PARA LECCIONES APRENDIDAS
INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
VALUES 
    ('Incidencia', 'incidencia', 'Incidencias y problemas operativos', '#dc3545', 'lesson', 1, true),
    ('Mejora', 'mejora', 'Mejoras implementadas exitosamente', '#28a745', 'lesson', 2, true),
    ('Proyecto', 'proyecto', 'Lecciones de proyectos específicos', '#6610f2', 'lesson', 3, true),
    ('Capacitación', 'capacitacion', 'Aprendizajes para capacitación', '#17a2b8', 'lesson', 4, true),
    ('General', 'general', 'Lecciones generales aplicables', '#6c757d', 'lesson', 5, true)
ON CONFLICT (slug) DO UPDATE SET
    module_type = EXCLUDED.module_type,
    order_index = EXCLUDED.order_index,
    is_active = true,
    description = EXCLUDED.description,
    color = EXCLUDED.color;

-- CATEGORÍAS PARA BUENAS PRÁCTICAS
INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
VALUES 
    ('Cocina', 'cocina', 'Prácticas de preparación en cocina', '#e31837', 'best_practice', 1, true),
    ('Caja', 'caja', 'Prácticas de caja y cobro', '#0077b6', 'best_practice', 2, true),
    ('Delivery', 'delivery', 'Prácticas de delivery y repartición', '#ffb500', 'best_practice', 3, true),
    ('Inventarios', 'inventarios', 'Prácticas de gestión de inventarios', '#1a472a', 'best_practice', 4, true),
    ('Limpieza', 'limpieza', 'Prácticas de limpieza e higiene', '#20c997', 'best_practice', 5, true),
    ('Trabajo en Equipo', 'trabajo-equipo', 'Prácticas de liderazgo y trabajo en equipo', '#6610f2', 'best_practice', 6, true)
ON CONFLICT (slug) DO UPDATE SET
    module_type = EXCLUDED.module_type,
    order_index = EXCLUDED.order_index,
    is_active = true,
    description = EXCLUDED.description,
    color = EXCLUDED.color;

-- ============================================================
-- 4. ACTUALIZAR REFERENCES EN OTRAS TABLAS
-- ============================================================

-- Actualizar department_id en profiles si hay referencias antiguas
-- Esto mapea los antiguos departments a los nuevos
UPDATE profiles p
SET department_id = 
    CASE 
        -- Mapear según códigos antiguos a nuevos
        WHEN d.code = 'RRHH' THEN 'd0000003-0000-0000-0000-000000000003'
        WHEN d.code = 'OPS' THEN 'd0000002-0000-0000-0000-000000000002'
        WHEN d.code = 'VTAS' THEN 'd0000002-0000-0000-0000-000000000002'
        WHEN d.code = 'LOG' THEN 'd0000004-0000-0000-0000-000000000004'
        WHEN d.code = 'ADMIN' THEN 'd0000005-0000-0000-0000-000000000005'
        WHEN d.code = 'MKT' THEN 'd0000006-0000-0000-0000-000000000006'
        WHEN d.code = 'TI' THEN 'd0000007-0000-0000-0000-000000000007'
        WHEN d.code = 'SEG' THEN 'd0000008-0000-0000-0000-000000000008'
        ELSE p.department_id
    END
FROM departments d
WHERE p.department_id = d.id;

-- ============================================================
-- 5. LIMPIEZA FINAL
-- ============================================================

-- Eliminar categorías duplicadas o sin módulo
DELETE FROM categories 
WHERE is_active = false 
OR module_type IS NULL;

-- Actualizar orden de categories para evitar gaps
WITH ranked AS (
    SELECT id, module_type, 
           ROW_NUMBER() OVER (PARTITION BY module_type ORDER BY order_index) as new_order
    FROM categories
    WHERE is_active = true
)
UPDATE categories c
SET order_index = ranked.new_order
FROM ranked
WHERE c.id = ranked.id;

COMMIT;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Ejecutar para verificar:
-- 
-- SELECT 'Departments' as table_name, COUNT(*) as count FROM departments WHERE is_active = true
-- UNION ALL
-- SELECT 'Areas' as table_name, COUNT(*) as count FROM areas WHERE is_active = true
-- UNION ALL
-- SELECT 'Categories' as table_name, COUNT(*) as count FROM categories WHERE is_active = true;
