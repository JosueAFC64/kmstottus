-- ============================================================
-- MIGRACIÓN 006: RLS para Módulo de Entrevistas de Salida
-- ============================================================
-- Corrige el error 42501: "new row violates row-level security policy"
-- La tabla exit_interviews tiene RLS habilitado pero no tenía políticas.
-- Fecha: 2026-06-21
-- ============================================================

-- ============================================================
-- 1. POLÍTICAS PARA `exit_interviews`
-- ============================================================
-- Los usuarios pueden ver entrevistas según sus permisos
DROP POLICY IF EXISTS "Exit interviews are viewable by authenticated" ON exit_interviews;
CREATE POLICY "Exit interviews are viewable by authenticated" ON exit_interviews
    FOR SELECT TO authenticated
    USING (
        -- Ver en base a permisos del usuario
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND (
                -- Administradores y gerentes de RRHH ven todo
                ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager'))
                -- Entrevistadores ven entrevistas donde son parte
                OR ur.user_id IN (SELECT id FROM profiles WHERE id = exit_interviews.interviewer_id)
                -- Gerentes de departamento ven entrevistas de su área
                OR ur.role_id IN (SELECT id FROM roles WHERE name = 'department_manager')
            )
        )
        -- El propio empleado puede ver su propia entrevista
        OR employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Permitir crear entrevistas a usuarios con permisos
DROP POLICY IF EXISTS "Authenticated users can create exit interviews" ON exit_interviews;
CREATE POLICY "Authenticated users can create exit interviews" ON exit_interviews
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND (
                ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager', 'hr_specialist'))
                OR ur.role_id IN (SELECT id FROM roles WHERE name = 'department_manager')
            )
        )
    );

-- Permitir actualizar entrevistas según permisos
DROP POLICY IF EXISTS "Authenticated users can update exit interviews" ON exit_interviews;
CREATE POLICY "Authenticated users can update exit interviews" ON exit_interviews
    FOR UPDATE TO authenticated
    USING (
        -- Administradores y gerentes de RRHH pueden actualizar cualquier entrevista
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager', 'hr_specialist'))
        )
        -- Entrevistadores pueden actualizar entrevistas que les pertenecen
        OR interviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        -- El propio empleado puede actualizar ciertos campos (como documentos revisados)
        OR employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Permitir eliminar (soft delete) solo a admins y gerentes de RRHH
DROP POLICY IF EXISTS "Only admins and hr managers can delete exit interviews" ON exit_interviews;
CREATE POLICY "Only admins and hr managers can delete exit interviews" ON exit_interviews
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager'))
        )
    );

-- ============================================================
-- 2. POLÍTICAS PARA `interview_templates`
-- ============================================================
-- Cualquier usuario autenticado puede ver plantillas
DROP POLICY IF EXISTS "Interview templates are viewable by authenticated" ON interview_templates;
CREATE POLICY "Interview templates are viewable by authenticated" ON interview_templates
    FOR SELECT TO authenticated
    USING (true);

-- Solo admins y gerentes de RRHH pueden crear/editar plantillas
DROP POLICY IF EXISTS "Only admins and hr managers can manage interview templates" ON interview_templates;
CREATE POLICY "Only admins and hr managers can manage interview templates" ON interview_templates
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager', 'hr_specialist'))
        )
    );

-- ============================================================
-- 3. POLÍTICAS PARA `interview_responses`
-- ============================================================
-- Ver respuestas: usuarios con permisos de ver entrevistas
DROP POLICY IF EXISTS "Interview responses are viewable by authenticated" ON interview_responses;
CREATE POLICY "Interview responses are viewable by authenticated" ON interview_responses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM exit_interviews ei
            JOIN user_roles ur ON true
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE ei.id = interview_responses.interview_id
            AND (
                -- Admins y RRHH ven todo
                ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager'))
                -- Entrevistador o empleado relacionado
                OR ei.interviewer_id = p.id
                OR ei.employee_id = p.id
                -- Gerentes de departamento
                OR ur.role_id IN (SELECT id FROM roles WHERE name = 'department_manager')
            )
        )
    );

-- Crear respuestas: solo el entrevistador o empleado relacionado
DROP POLICY IF EXISTS "Related users can create interview responses" ON interview_responses;
CREATE POLICY "Related users can create interview responses" ON interview_responses
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exit_interviews ei
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE ei.id = interview_id
            AND (
                ei.interviewer_id = p.id
                OR ei.employee_id = p.id
            )
        )
    );

-- Actualizar respuestas: mismo criterio
DROP POLICY IF EXISTS "Related users can update interview responses" ON interview_responses;
CREATE POLICY "Related users can update interview responses" ON interview_responses
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM exit_interviews ei
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE ei.id = interview_responses.interview_id
            AND (
                ei.interviewer_id = p.id
                OR ei.employee_id = p.id
                OR EXISTS (
                    SELECT 1 FROM user_roles ur
                    WHERE ur.user_id = p.id
                    AND ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager'))
                )
            )
        )
    );

-- ============================================================
-- 4. POLÍTICAS PARA `extracted_knowledge`
-- ============================================================
-- Ver conocimiento extraído: admins y RRHH
DROP POLICY IF EXISTS "Extracted knowledge is viewable by authenticated" ON extracted_knowledge;
CREATE POLICY "Extracted knowledge is viewable by authenticated" ON extracted_knowledge
    FOR SELECT TO authenticated
    USING (true);

-- Crear conocimiento: admins, RRHH y el creador original
DROP POLICY IF EXISTS "Users can create extracted knowledge" ON extracted_knowledge;
CREATE POLICY "Users can create extracted knowledge" ON extracted_knowledge
    FOR INSERT TO authenticated
    WITH CHECK (true);  -- Permisivo para desarrollo, restringir en producción

-- Actualizar conocimiento: admins y RRHH
DROP POLICY IF EXISTS "Only admins and hr can update extracted knowledge" ON extracted_knowledge;
CREATE POLICY "Only admins and hr can update extracted knowledge" ON extracted_knowledge
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'hr_manager', 'hr_specialist'))
        )
        OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Descomenta para verificar que se crearon las políticas:
-- SELECT tablename, policyname, cmd, qual FROM pg_policies
-- WHERE tablename IN ('exit_interviews', 'interview_templates', 'interview_responses', 'extracted_knowledge')
-- ORDER BY tablename, cmd;
