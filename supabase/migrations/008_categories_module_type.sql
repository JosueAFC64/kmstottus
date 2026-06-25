-- ============================================================
-- Agregar columna module_type a categories
-- Permite diferenciar categorías por módulo (documentos, lecciones, buenas prácticas)
-- Fecha: 2026-06-23
-- ============================================================

-- Añadir columna module_type a la tabla categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS module_type VARCHAR(50) DEFAULT 'document';

-- Valores permitidos:
-- 'document'    - Categorías para el repositorio de documentos
-- 'lesson'      - Categorías para lecciones aprendidas
-- 'best_practice' - Categorías para buenas prácticas
-- NULL o 'all' - Categorías compartidas entre módulos

-- Crear índice para filtrado eficiente
CREATE INDEX IF NOT EXISTS idx_categories_module_type ON categories(module_type);

-- Actualizar categorías existentes según su propósito original
-- Categorías de documentos (repositorio)
UPDATE categories SET module_type = 'document' WHERE slug IN (
    'manuales-operativos',
    'politicas',
    'procesos',
    'capacitacion',
    'seguridad',
    'recursos-humanos',
    'tecnologia'
);

-- La categoría 'mejores-practicas' ahora apunta a buenas prácticas
-- (aunque técnicamente no es necesaria si cada módulo tiene sus propias categorías)
UPDATE categories SET module_type = 'best_practice' WHERE slug = 'mejores-practicas';

-- Actualizar categorías de lecciones aprendidas (si ya existen)
-- Nota: Si no existen, se crean en el siguiente paso

-- Insertar categorías específicas para Buenas Prácticas si no existen
INSERT INTO categories (name, slug, description, color, module_type, order_index, is_active)
VALUES 
    ('Operaciones de Cocina', 'operaciones-cocina', 'Prácticas relacionadas con la preparación en cocina', '#e31837', 'best_practice', 10, true),
    ('Atención al Cliente', 'atencion-cliente', 'Prácticas para mejorar la atención al cliente', '#0077b6', 'best_practice', 11, true),
    ('Control de Calidad', 'control-calidad', 'Prácticas de control de calidad', '#ffb500', 'best_practice', 12, true),
    ('Gestión de Inventario', 'gestion-inventario', 'Prácticas para gestión de inventarios y stock', '#1a472a', 'best_practice', 13, true),
    ('Seguridad e Higiene', 'seguridad-higiene', 'Prácticas de seguridad e higiene alimentaria', '#dc3545', 'best_practice', 14, true),
    ('Liderazgo y Trabajo en Equipo', 'liderazgo-equipo', 'Prácticas de liderazgo y trabajo en equipo', '#6610f2', 'best_practice', 15, true)
ON CONFLICT (slug) DO NOTHING;

-- Actualizar las categorías insertadas
UPDATE categories SET module_type = 'best_practice' 
WHERE slug IN (
    'operaciones-cocina',
    'atencion-cliente',
    'control-calidad',
    'gestion-inventario',
    'seguridad-higiene',
    'liderazgo-equipo'
);

-- Comentarios
COMMENT ON COLUMN categories.module_type IS 'Módulo al que pertenece: document, lesson, best_practice, o NULL/all para categorías compartidas';
