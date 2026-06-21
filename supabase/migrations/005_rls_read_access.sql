-- ============================================================
-- MIGRACIÓN 005: RLS para acceso de lectura pública
-- ============================================================
-- Permite que usuarios autenticados lean categorías, tags, profiles
-- para que el sistema funcione correctamente
-- Fecha: 2026-06-20
-- ============================================================

-- ============================================================
-- CATEGORIES: lectura para todos los autenticados
-- ============================================================
DROP POLICY IF EXISTS "Categories are viewable by all authenticated" ON categories;
CREATE POLICY "Categories are viewable by all authenticated" ON categories
    FOR SELECT TO authenticated
    USING (true);

-- Permitir insert/update/delete para autenticados (para desarrollo)
DROP POLICY IF EXISTS "Categories are editable by authenticated" ON categories;
CREATE POLICY "Categories are editable by authenticated" ON categories
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- TAGS: lectura para todos los autenticados
-- ============================================================
DROP POLICY IF EXISTS "Tags are viewable by all authenticated" ON tags;
CREATE POLICY "Tags are viewable by all authenticated" ON tags
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Tags are editable by authenticated" ON tags;
CREATE POLICY "Tags are editable by authenticated" ON tags
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- PROFILES: lectura para todos los autenticados
-- (para mostrar nombre de autores en documentos)
-- ============================================================
DROP POLICY IF EXISTS "Profiles are viewable by all authenticated" ON profiles;
CREATE POLICY "Profiles are viewable by all authenticated" ON profiles
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Profiles are editable by authenticated" ON profiles;
CREATE POLICY "Profiles are editable by authenticated" ON profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- DEPARTMENTS / AREAS: lectura para todos
-- ============================================================
DROP POLICY IF EXISTS "Departments are viewable by all authenticated" ON departments;
CREATE POLICY "Departments are viewable by all authenticated" ON departments
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Areas are viewable by all authenticated" ON areas;
CREATE POLICY "Areas are viewable by all authenticated" ON areas
    FOR SELECT TO authenticated
    USING (true);

-- ============================================================
-- DOCUMENTS: lectura según status, escritura libre para desarrollo
-- ============================================================
DROP POLICY IF EXISTS "Published documents are viewable by all authenticated" ON documents;
CREATE POLICY "Published documents are viewable by all authenticated" ON documents
    FOR SELECT TO authenticated
    USING (
        status = 'published' OR
        author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Permitir insert/update/delete para desarrollo
DROP POLICY IF EXISTS "Documents are editable by authenticated" ON documents;
CREATE POLICY "Documents are editable by authenticated" ON documents
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
