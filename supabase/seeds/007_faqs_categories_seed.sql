-- =====================================================
-- Seed: Categorías para el módulo de FAQs
-- =====================================================

-- Primero verificar si existe la restricción única
-- La tabla categories tiene una restricción única en (slug, module_type)

INSERT INTO categories (name, slug, description, color, order_index, is_active, module_type)
VALUES
    ('Operaciones', 'operaciones', 'Preguntas relacionadas con procesos operativos diarios', '#1a472a', 1, true, 'faq'),
    ('Herramientas', 'herramientas', 'Preguntas sobre uso de equipos y herramientas', '#495057', 2, true, 'faq'),
    ('Recursos Humanos', 'recursos-humanos', 'Consultas sobre políticas de personal y beneficios', '#0d6efd', 3, true, 'faq'),
    ('Seguridad', 'seguridad', 'Protocolos y procedimientos de seguridad', '#dc3545', 4, true, 'faq'),
    ('Procesos', 'procesos', 'Flujos de trabajo y procedimientos estandarizados', '#6610f2', 5, true, 'faq'),
    ('Clientes', 'clientes', 'Atención y servicio al cliente', '#fd7e14', 6, true, 'faq')
ON CONFLICT ON CONSTRAINT categories_slug_module_type_key DO UPDATE SET
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active;
