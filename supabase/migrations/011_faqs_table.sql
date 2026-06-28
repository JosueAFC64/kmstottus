-- =====================================================
-- Tabla: FAQs (Preguntas Frecuentes)
-- =====================================================

-- Crear tabla FAQs
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Índice para búsqueda de texto
CREATE INDEX IF NOT EXISTS idx_faqs_search ON faqs USING GIN (to_tsvector('spanish', question || ' ' || answer));

-- Índice para filtros
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status);
CREATE INDEX IF NOT EXISTS idx_faqs_area ON faqs(area_id);
CREATE INDEX IF NOT EXISTS idx_faqs_view_count ON faqs(view_count DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Política: Cualquier usuario autenticado puede ver FAQs publicados
DROP POLICY IF EXISTS "FAQs: anyone can view published" ON faqs;
CREATE POLICY "FAQs: anyone can view published" ON faqs
    FOR SELECT USING (
        status = 'published'
    );

-- Política: Cualquier usuario autenticado puede crear FAQs
DROP POLICY IF EXISTS "FAQs: authenticated can create" ON faqs;
CREATE POLICY "FAQs: authenticated can create" ON faqs
    FOR INSERT WITH CHECK (true);

-- Política: Cualquier usuario autenticado puede actualizar FAQs
DROP POLICY IF EXISTS "FAQs: authenticated can update" ON faqs;
CREATE POLICY "FAQs: authenticated can update" ON faqs
    FOR UPDATE USING (true);

-- Política: Cualquier usuario autenticado puede eliminar FAQs (soft delete)
DROP POLICY IF EXISTS "FAQs: authenticated can delete" ON faqs;
CREATE POLICY "FAQs: authenticated can delete" ON faqs
    FOR DELETE USING (true);

-- =====================================================
-- Función RPC para incrementar visualizaciones
-- =====================================================

CREATE OR REPLACE FUNCTION increment_faq_view_count(faq_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE faqs SET view_count = view_count + 1 WHERE id = faq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permiso para ejecutar la función
GRANT EXECUTE ON FUNCTION increment_faq_view_count TO authenticated;

-- =====================================================
-- Comentarios
-- =====================================================

COMMENT ON TABLE faqs IS 'Preguntas Frecuentes - Centraliza conocimiento explícito reutilizable';
COMMENT ON COLUMN faqs.question IS 'Pregunta formulada por los colaboradores';
COMMENT ON COLUMN faqs.answer IS 'Respuesta detallada y verificada';
COMMENT ON COLUMN faqs.category IS 'Categoría de la FAQ (operaciones, herramientas, procesos, etc.)';
COMMENT ON COLUMN faqs.tags IS 'Etiquetas para búsqueda y relaciones';
COMMENT ON COLUMN faqs.view_count IS 'Contador de visualizaciones para ordenar por popularidad';
