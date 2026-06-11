-- ============================================================
-- MIGRACIÓN 002: TRIGGER DE CREACIÓN AUTOMÁTICA DE PERFIL + ROLES
-- ============================================================
-- Esta migración:
--   1. Inserta los 5 roles del sistema que la app espera
--      (admin, knowledge_manager, hr, supervisor, collaborator)
--   2. Crea la función handle_new_user() con SECURITY DEFINER
--   3. Crea el trigger on_auth_user_created en auth.users
--   4. Script de reparación: crea perfiles retroactivamente
--      para usuarios que ya existen en auth.users sin perfil
--   5. Asigna rol 'collaborator' a usuarios existentes sin rol
-- ============================================================
-- ⚠️  Ejecutar DESPUÉS de haber corrido 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. ROLES DEL SISTEMA (idempotente)
-- ============================================================
-- Usa ON CONFLICT para no romper si ya ejecutaste el seed original
INSERT INTO roles (name, display_name, description, permissions, is_system) VALUES
  ('admin', 'Administrador', 'Acceso completo al sistema',
   '["*"]'::jsonb, TRUE),
  ('knowledge_manager', 'Gestor del Conocimiento', 'Gestiona el repositorio de conocimiento',
   '["documents.view", "documents.create", "documents.edit", "documents.publish", "documents.review", "lessons.view", "lessons.create", "lessons.approve", "faqs.view", "faqs.create", "faqs.edit", "experts.view", "experts.manage", "metrics.view"]'::jsonb, TRUE),
  ('hr', 'RRHH', 'Gestiona onboarding y entrevistas de salida',
   '["documents.view", "lessons.view", "lessons.create", "lessons.edit", "faqs.view", "faqs.create", "faqs.edit", "experts.view", "onboarding.view", "onboarding.create", "onboarding.assign", "onboarding.manage", "exit_interviews.view", "exit_interviews.create", "exit_interviews.manage", "users.view", "metrics.view"]'::jsonb, TRUE),
  ('supervisor', 'Supervisor', 'Supervisa su área y equipo',
   '["documents.view", "documents.create", "documents.edit", "lessons.view", "lessons.create", "lessons.edit", "faqs.view", "faqs.create", "faqs.edit", "experts.view", "onboarding.view", "onboarding.assign", "exit_interviews.view", "metrics.view"]'::jsonb, TRUE),
  ('collaborator', 'Colaborador', 'Acceso básico al sistema',
   '["documents.view", "lessons.view", "faqs.view", "experts.view", "onboarding.view"]'::jsonb, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. FUNCIÓN: crear perfil automáticamente al registrarse
-- ============================================================
-- SECURITY DEFINER: se ejecuta con permisos del owner de la función,
-- bypaseando RLS para poder hacer INSERT en profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    new_profile_id    UUID;
    default_role_id   UUID;
    first_name_value  TEXT;
    last_name_value   TEXT;
BEGIN
    -- Extraer first_name y last_name de los metadatos del signup
    -- (los pusimos en signUp options.data)
    first_name_value := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    last_name_value  := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

    -- Si no hay metadatos, derivar del email como fallback
    IF first_name_value = '' THEN
        first_name_value := split_part(NEW.email, '@', 1);
    END IF;
    IF last_name_value = '' THEN
        last_name_value := '—';
    END IF;

    -- 1. Crear perfil
    INSERT INTO public.profiles (user_id, email, first_name, last_name, status)
    VALUES (NEW.id, NEW.email, first_name_value, last_name_value, 'active')
    RETURNING id INTO new_profile_id;

    -- 2. Asignar rol 'collaborator' por defecto
    SELECT id INTO default_role_id
    FROM public.roles
    WHERE name = 'collaborator'
    LIMIT 1;

    IF default_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id, assigned_by)
        VALUES (new_profile_id, default_role_id, new_profile_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- No bloquear la creación del usuario en auth.users
        -- Loguear el error en consola (visible desde Supabase Logs)
        RAISE WARNING 'handle_new_user falló para %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- ============================================================
-- 3. TRIGGER: AFTER INSERT en auth.users
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. REPARACIÓN: perfiles retroactivos para usuarios existentes
--    (el que se registró antes de que existiera el trigger)
-- ============================================================
INSERT INTO public.profiles (user_id, email, first_name, last_name, status)
SELECT
    au.id,
    au.email,
    COALESCE(NULLIF(au.raw_user_meta_data->>'first_name', ''), split_part(au.email, '@', 1)),
    COALESCE(NULLIF(au.raw_user_meta_data->>'last_name', ''), '—'),
    'active'
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 5. REPARACIÓN: asignar rol collaborator a usuarios sin rol
-- ============================================================
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT p.id, r.id, p.id
FROM public.profiles p
CROSS JOIN public.roles r
WHERE r.name = 'collaborator'
  AND NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id
  )
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================
-- 6. VERIFICACIÓN (opcional, solo para que veas los resultados)
-- ============================================================
-- Descomenta estas líneas si quieres ver el estado después de correr:
-- SELECT 'roles' AS tabla, COUNT(*)::text AS total FROM roles
-- UNION ALL SELECT 'profiles', COUNT(*)::text FROM profiles
-- UNION ALL SELECT 'user_roles', COUNT(*)::text FROM user_roles
-- UNION ALL SELECT 'auth.users sin perfil',
--     (SELECT COUNT(*)::text FROM auth.users au
--      LEFT JOIN profiles p ON p.user_id = au.id
--      WHERE p.id IS NULL);
