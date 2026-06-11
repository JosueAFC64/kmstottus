-- ============================================================
-- MIGRACIÓN 003: POLÍTICAS RLS MÍNIMAS DE SESIÓN
-- ============================================================
-- Esta migración agrega las políticas RLS que faltaban para que
-- un usuario autenticado pueda leer:
--   1. Su propia fila en `user_roles`
--   2. La lista de `roles` del sistema (es data de referencia, no personal)
--
-- ANTES de esta migración, getSession() del lado del servidor con
-- anon key devolvía NULL incluso con sesión válida, porque:
--   - `profiles` tenía política `auth.uid() = user_id` (OK)
--   - `user_roles` no tenía política de SELECT → 0 filas
--   - `roles` no tenía política de SELECT → 0 filas
-- Resultado: redirect loop entre /dashboard y /login.
--
-- Aunque el código de la app ya usa service_role en getSession() para
-- evitar este problema, dejamos las políticas aquí como defensa en
-- profundidad (para queries futuras con anon key que sí sean legítimas).
-- ============================================================

-- ============================================================
-- 1. POLÍTICAS PARA `roles` (catálogo del sistema)
-- ============================================================
-- Los roles son datos de referencia (no son datos personales del usuario).
-- Cualquier usuario autenticado puede ver la lista de roles.
CREATE POLICY "Authenticated users can view roles" ON roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins del sistema pueden crear/modificar roles
-- (esta política la agregamos en una migración futura de admin)
-- CREATE POLICY "Only service_role can modify roles" ON roles
--     FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 2. POLÍTICAS PARA `user_roles` (asignación de roles a usuarios)
-- ============================================================
-- Un usuario puede ver sus propias asignaciones de rol
CREATE POLICY "Users can view own user_roles" ON user_roles
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Solo el sistema (trigger con SECURITY DEFINER) puede insertar
-- asignaciones de rol a un usuario nuevo. Los usuarios no deberían
-- poder asignarse roles a sí mismos.
-- Por seguridad, NO agregamos política de INSERT/UPDATE/DELETE para usuarios
-- normales. Solo service_role y funciones SECURITY DEFINER pueden escribir.

-- ============================================================
-- 3. VERIFICACIÓN (descomentar para ver resultados)
-- ============================================================
-- SELECT 'roles policies' AS tabla, COUNT(*)::text AS total FROM pg_policies
-- WHERE tablename = 'roles'
-- UNION ALL
-- SELECT 'user_roles policies', COUNT(*)::text FROM pg_policies
-- WHERE tablename = 'user_roles';
