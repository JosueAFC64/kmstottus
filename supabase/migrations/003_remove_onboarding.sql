-- ============================================================
-- MIGRACIÓN 003: ELIMINAR MÓDULO DE ONBOARDING
-- ============================================================
-- Elimina todas las tablas, tipos, triggers e índices relacionados
-- con el módulo de onboarding que ya no se usa.
-- ============================================================

-- ============================================================
-- 1. ELIMINAR POLÍTICAS RLS (primero por las FK)
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated to view onboarding_progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Allow authenticated to insert onboarding_progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Allow authenticated to update onboarding_progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Allow authenticated to delete onboarding_progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Allow full access onboarding_progress" ON onboarding_progress;

DROP POLICY IF EXISTS "Allow authenticated to view onboarding_modules" ON onboarding_modules;
DROP POLICY IF EXISTS "Allow authenticated to insert onboarding_modules" ON onboarding_modules;
DROP POLICY IF EXISTS "Allow authenticated to update onboarding_modules" ON onboarding_modules;
DROP POLICY IF EXISTS "Allow authenticated to delete onboarding_modules" ON onboarding_modules;
DROP POLICY IF EXISTS "Allow full access onboarding_modules" ON onboarding_modules;

DROP POLICY IF EXISTS "Allow authenticated to view onboarding_paths" ON onboarding_paths;
DROP POLICY IF EXISTS "Allow authenticated to insert onboarding_paths" ON onboarding_paths;
DROP POLICY IF EXISTS "Allow authenticated to update onboarding_paths" ON onboarding_paths;
DROP POLICY IF EXISTS "Allow authenticated to delete onboarding_paths" ON onboarding_paths;
DROP POLICY IF EXISTS "Allow full access onboarding_paths" ON onboarding_paths;

-- ============================================================
-- 2. ELIMINAR RLS DE LAS TABLAS
-- ============================================================
ALTER TABLE onboarding_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_paths DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. ELIMINAR TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON onboarding_progress;
DROP TRIGGER IF EXISTS update_onboarding_modules_updated_at ON onboarding_modules;
DROP TRIGGER IF EXISTS update_onboarding_paths_updated_at ON onboarding_paths;

-- ============================================================
-- 4. ELIMINAR ÍNDICES
-- ============================================================
DROP INDEX IF EXISTS idx_onboarding_progress_user;
DROP INDEX IF EXISTS idx_onboarding_progress_status;
DROP INDEX IF EXISTS idx_onboarding_progress_path;
DROP INDEX IF EXISTS idx_onboarding_modules_path;
DROP INDEX IF EXISTS idx_onboarding_paths_target_role;
DROP INDEX IF EXISTS idx_onboarding_paths_department;

-- ============================================================
-- 5. ELIMINAR TABLAS (en orden inverso de dependencias)
-- ============================================================
-- progress depende de modules y paths
-- modules depende de paths
-- paths no tiene dependencias hacia tablas de onboarding
DROP TABLE IF EXISTS onboarding_progress;
DROP TABLE IF EXISTS onboarding_modules;
DROP TABLE IF EXISTS onboarding_paths;

-- ============================================================
-- 6. ELIMINAR ENUM
-- ============================================================
DROP TYPE IF EXISTS onboarding_status;

-- ============================================================
-- 7. ACTUALIZAR ROLES (quitar permisos de onboarding)
-- ============================================================
-- hr_manager
UPDATE roles
SET permissions = '["*"]'::jsonb
WHERE name = 'hr_manager';

-- hr
UPDATE roles
SET permissions = '["documents.view", "documents.create", "documents.edit", "lessons.view", "lessons.create", "lessons.edit", "faqs.view", "faqs.create", "faqs.edit", "experts.view", "experts.manage", "exit_interviews.view", "exit_interviews.create", "exit_interviews.manage", "users.view", "metrics.view"]'::jsonb
WHERE name = 'hr';

-- supervisor
UPDATE roles
SET permissions = '["documents.view", "documents.create", "documents.edit", "lessons.view", "lessons.create", "lessons.edit", "faqs.view", "faqs.create", "faqs.edit", "experts.view", "exit_interviews.view", "exit_interviews.create", "metrics.view"]'::jsonb
WHERE name = 'supervisor';

-- collaborator
UPDATE roles
SET permissions = '["documents.view", "documents.create", "documents.edit", "lessons.view", "lessons.create", "lessons.edit", "faqs.view", "faqs.create", "faqs.edit", "experts.view", "exit_interviews.view", "metrics.view"]'::jsonb
WHERE name = 'collaborator';

-- ============================================================
-- 8. VERIFICACIÓN
-- ============================================================
-- Tablas restantes (solo para verificar que se eliminaron las de onboarding)
-- Descomenta para ver:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name LIKE 'onboarding%';

-- Roles actualizados
SELECT name, display_name, permissions FROM roles ORDER BY name;
