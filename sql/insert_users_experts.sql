-- ============================================================
-- INSERTAR USUARIOS DE EJEMPLO PARA DIRECTORIO DE EXPERTOS
-- Habilitar extensión para generar UUIDs si no existe
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------
-- 1. PROFILES (usuarios con department_id y area_id consistentes)
-- Nota: id y user_id son el mismo UUID (referencia a auth.users)
-- ----------------------------------------------------------

INSERT INTO profiles (id, user_id, first_name, last_name, email, phone, employee_code, hire_date, department_id, area_id, position, status, is_expert, created_at, updated_at)
VALUES
-- GERENCIA GENERAL
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Carlos', 'Mendoza Sánchez', 'carlos.mendoza@tottus.com', '+51 987 654 321', 'EMP-001', '2020-01-15', 'd0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Director General', 'active', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Patricia', 'Vega Ramírez', 'patricia.vega@tottus.com', '+51 987 654 322', 'EMP-002', '2019-06-01', 'd0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'Jefe de Planeamiento', 'active', true, NOW(), NOW()),

-- OPERACIONES
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Jorge', 'López Paredes', 'jorge.lopez@tottus.com', '+51 987 654 323', 'EMP-003', '2018-03-20', 'd0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000001', 'Chef Ejecutivo', 'active', true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'María', 'Torres Castro', 'maria.torres@tottus.com', '+51 987 654 324', 'EMP-004', '2020-08-10', 'd0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', 'Supervisor de Caja', 'active', false, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Roberto', 'Díaz Morales', 'roberto.diaz@tottus.com', '+51 987 654 325', 'EMP-005', '2019-11-05', 'd0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000003', 'Coordinador Delivery', 'active', false, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Lucía', 'Fernández Quiroz', 'lucia.fernandez@tottus.com', '+51 987 654 326', 'EMP-006', '2021-02-15', 'd0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000004', 'Pastelera Principal', 'active', true, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'Miguel', 'Huerta Flores', 'miguel.huerta@tottus.com', '+51 987 654 327', 'EMP-007', '2017-09-01', 'd0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000006', 'Analista de Calidad', 'active', true, NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'Carmen', 'Sosa Villareal', 'carmen.sosa@tottus.com', '+51 987 654 328', 'EMP-008', '2020-05-20', 'd0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000007', 'Supervisor de Tienda', 'active', false, NOW(), NOW()),

-- RECURSOS HUMANOS
('99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', 'Ana', 'Cruz Mendoza', 'ana.cruz@tottus.com', '+51 987 654 329', 'EMP-009', '2016-04-10', 'd0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000001', 'Gerente de RRHH', 'active', true, NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fernando', 'Reyes Palomino', 'fernando.reyes@tottus.com', '+51 987 654 330', 'EMP-010', '2019-07-15', 'd0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000002', 'Analista de Nómina', 'active', false, NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sandra', 'Mejía Guzmán', 'sandra.mejia@tottus.com', '+51 987 654 331', 'EMP-011', '2021-01-08', 'd0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', 'Capacitadora Senior', 'active', true, NOW(), NOW()),

-- LOGÍSTICA
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pedro', 'Navarro Jiménez', 'pedro.navarro@tottus.com', '+51 987 654 332', 'EMP-012', '2018-10-20', 'd0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000001', 'Jefe de Almacén', 'active', true, NOW(), NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Laura', 'Espinoza Vargas', 'laura.espinoza@tottus.com', '+51 987 654 333', 'EMP-013', '2020-03-12', 'd0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000002', 'Analista de Compras', 'active', false, NOW(), NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Diego', 'Castro Rivera', 'diego.castro@tottus.com', '+51 987 654 334', 'EMP-014', '2019-08-25', 'd0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000003', 'Coordinador de Distribución', 'active', false, NOW(), NOW()),

-- ADMINISTRACIÓN Y FINANZAS
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Rosa', 'Herrera Mendoza', 'rosa.herrera@tottus.com', '+51 987 654 335', 'EMP-015', '2017-05-30', 'd0000005-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000001', 'Contadora General', 'active', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alberto', 'Silva Díaz', 'alberto.silva@tottus.com', '+51 987 654 336', 'EMP-016', '2020-09-18', 'd0000005-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000002', 'Facturador Senior', 'active', false, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Verónica', 'Leguía Torres', 'veronica.leguia@tottus.com', '+51 987 654 337', 'EMP-017', '2018-12-01', 'd0000005-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000003', 'Tesorera', 'active', false, NOW(), NOW()),

-- MARKETING
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Claudia', 'Montero Astete', 'claudia.montero@tottus.com', '+51 987 654 338', 'EMP-018', '2019-04-22', 'd0000006-0000-0000-0000-000000000006', 'a0000006-0000-0000-0000-000000000001', 'Jefa de Publicidad', 'active', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Gustavo', 'Peña Soto', 'gustavo.pena@tottus.com', '+51 987 654 339', 'EMP-019', '2021-06-14', 'd0000006-0000-0000-0000-000000000006', 'a0000006-0000-0000-0000-000000000002', 'Community Manager', 'active', false, NOW(), NOW()),

-- TECNOLOGÍA
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Andrés', 'Vigil Prado', 'andres.vigil@tottus.com', '+51 987 654 340', 'EMP-020', '2016-11-08', 'd0000007-0000-0000-0000-000000000007', 'a0000007-0000-0000-0000-000000000001', 'Director de TI', 'active', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'Sofía', 'Arias Zambrano', 'sofia.arias@tottus.com', '+51 987 654 341', 'EMP-021', '2020-02-03', 'd0000007-0000-0000-0000-000000000007', 'a0000007-0000-0000-0000-000000000002', 'Técnico de Soporte', 'active', false, NOW(), NOW()),

-- SEGURIDAD Y PREVENCIÓN
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'Marco', 'Zambrano Torres', 'marco.zambrano@tottus.com', '+51 987 654 342', 'EMP-022', '2017-08-15', 'd0000008-0000-0000-0000-000000000008', 'a0000008-0000-0000-0000-000000000001', 'Inspector de Higiene', 'active', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 'Elena', 'Cornejo Ríos', 'elena.cornejo@tottus.com', '+51 987 654 343', 'EMP-023', '2018-10-30', 'd0000008-0000-0000-0000-000000000008', 'a0000008-0000-0000-0000-000000000002', 'Coordinadora de Riesgos', 'active', false, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    department_id = EXCLUDED.department_id,
    area_id = EXCLUDED.area_id,
    position = EXCLUDED.position,
    is_expert = EXCLUDED.is_expert,
    updated_at = NOW();

-- ----------------------------------------------------------
-- 2. USER_ROLES (asignar roles a cada usuario)
-- ----------------------------------------------------------

INSERT INTO user_roles (id, user_id, role_id, assigned_at)
VALUES
-- GERENCIA GENERAL
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '8263d575-b2aa-4ecb-98a9-495ebc3eeb6b'::uuid, NOW()),  -- Carlos: Admin
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'a67e7615-8c65-4b3c-955f-eecc04605749'::uuid, NOW()),  -- Patricia: Gestor

-- OPERACIONES
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '9b08a94e-3906-4aad-89e9-aab46a2aaa65'::uuid, NOW()), -- Jorge: Supervisor
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- María: Colaborador
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Roberto: Colaborador
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Lucía: Colaborador
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Miguel: Colaborador
(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', '9b08a94e-3906-4aad-89e9-aab46a2aaa65'::uuid, NOW()), -- Carmen: Supervisor

-- RECURSOS HUMANOS
(gen_random_uuid(), '99999999-9999-9999-9999-999999999999', 'ecba5148-8a93-47f8-8162-58fd93a5d4ee'::uuid, NOW()), -- Ana: RRHH
(gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ecba5148-8a93-47f8-8162-58fd93a5d4ee'::uuid, NOW()), -- Fernando: RRHH
(gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ecba5148-8a93-47f8-8162-58fd93a5d4ee'::uuid, NOW()), -- Sandra: RRHH

-- LOGÍSTICA
(gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', '9b08a94e-3906-4aad-89e9-aab46a2aaa65'::uuid, NOW()), -- Pedro: Supervisor
(gen_random_uuid(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Laura: Colaborador
(gen_random_uuid(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Diego: Colaborador

-- ADMINISTRACIÓN Y FINANZAS
(gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '9b08a94e-3906-4aad-89e9-aab46a2aaa65'::uuid, NOW()), -- Rosa: Supervisor
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Alberto: Colaborador
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Verónica: Colaborador

-- MARKETING
(gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'a67e7615-8c65-4b3c-955f-eecc04605749'::uuid, NOW()), -- Claudia: Gestor
(gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Gustavo: Colaborador

-- TECNOLOGÍA
(gen_random_uuid(), '00000000-0000-0000-0000-000000000005', '8263d575-b2aa-4ecb-98a9-495ebc3eeb6b'::uuid, NOW()), -- Andrés: Admin
(gen_random_uuid(), '00000000-0000-0000-0000-000000000006', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW()), -- Sofía: Colaborador

-- SEGURIDAD Y PREVENCIÓN
(gen_random_uuid(), '00000000-0000-0000-0000-000000000007', '9b08a94e-3906-4aad-89e9-aab46a2aaa65'::uuid, NOW()), -- Marco: Supervisor
(gen_random_uuid(), '00000000-0000-0000-0000-000000000008', 'cfe906f0-c627-461a-84aa-a6f122a2be02'::uuid, NOW())  -- Elena: Colaborador
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- 3. VERIFICACIÓN
-- ----------------------------------------------------------

-- Ver todos los usuarios con sus roles y departamentos
SELECT 
    p.first_name || ' ' || p.last_name AS "Nombre Completo",
    p.email,
    p.position AS "Cargo",
    d.name AS "Departamento",
    a.name AS "Área",
    r.display_name AS "Rol",
    CASE WHEN p.is_expert THEN '⭐ Experto' ELSE '' END AS "Tipo"
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN areas a ON p.area_id = a.id
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE p.deleted_at IS NULL
ORDER BY d.name, a.name, p.last_name;

-- Resumen de expertos
SELECT 
    d.name AS "Departamento",
    COUNT(*) AS "Total Expertos"
FROM profiles p
JOIN departments d ON p.department_id = d.id
WHERE p.is_expert = true AND p.deleted_at IS NULL
GROUP BY d.name
ORDER BY "Total Expertos" DESC;
