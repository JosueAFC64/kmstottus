-- ============================================================
-- SEED: Plantillas de Entrevistas de Salida
-- ============================================================
-- Ejecuta este SQL para tener plantillas listas para usar
-- Fecha: 2026-06-21
-- ============================================================

-- Plantilla General (para cualquier empleado)
INSERT INTO interview_templates (id, name, description, category, questions, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Entrevista de Salida General',
  'Plantilla estándar para entrevistas de salida. Cubre temas de experiencia general, relaciones, conocimientos y sugerencias.',
  'general',
  '[
    {
      "order": 1,
      "question": "¿Cuáles fueron tus principales responsabilidades en el puesto?",
      "type": "textarea",
      "required": true
    },
    {
      "order": 2,
      "question": "¿Cómo calificarías tu experiencia general en la empresa?",
      "type": "rating",
      "required": true
    },
    {
      "order": 3,
      "question": "¿Qué aspectos positivos destacarías de tu experiencia?",
      "type": "textarea",
      "required": true
    },
    {
      "order": 4,
      "question": "¿Encontraste algún área o proceso que pudiera mejorar?",
      "type": "textarea",
      "required": false
    },
    {
      "order": 5,
      "question": "¿Quiénes fueron tus principales compañeros o con quién trabajaste más de cerca?",
      "type": "text",
      "required": false
    },
    {
      "order": 6,
      "question": "¿Te gustaría continuar en contacto con la empresa en el futuro?",
      "type": "yes_no",
      "required": true
    },
    {
      "order": 7,
      "question": "¿Hay algo que la empresa debería saber antes de tu salida?",
      "type": "textarea",
      "required": false
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);

-- Plantilla Técnica (para empleados técnicos/desarrolladores)
INSERT INTO interview_templates (id, name, description, category, questions, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Entrevista de Salida Técnica',
  'Plantilla específica para personal técnico. Incluye preguntas sobre conocimiento técnico, transferencia y proyectos.',
  'technical',
  '[
    {
      "order": 1,
      "question": "¿En qué proyectos trabajaste más recientemente?",
      "type": "textarea",
      "required": true
    },
    {
      "order": 2,
      "question": "¿Hay código o documentación que aún no esté completa o compartida?",
      "type": "yes_no",
      "required": true
    },
    {
      "order": 3,
      "question": "¿Cuáles son los 3 conocimientos técnicos más importantes que has adquirido?",
      "type": "textarea",
      "required": true
    },
    {
      "order": 4,
      "question": "¿Tienes conocimiento tácito (no documentado) que debería compartirse?",
      "type": "textarea",
      "required": false
    },
    {
      "order": 5,
      "question": "¿Quién es la mejor persona para reemplazar tu conocimiento técnico?",
      "type": "text",
      "required": false
    },
    {
      "order": 6,
      "question": "¿Qué herramientas o tecnologías nuevas recomiendas para el equipo?",
      "type": "textarea",
      "required": false
    },
    {
      "order": 7,
      "question": "¿Hay deuda técnica importante que deba abordarse?",
      "type": "textarea",
      "required": false
    },
    {
      "order": 8,
      "question": "¿Cómo calificarías la calidad del código y la documentación del equipo?",
      "type": "rating",
      "required": true
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);

-- Plantilla de Liderazgo (para gerentes o líderes de equipo)
INSERT INTO interview_templates (id, name, description, category, questions, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Entrevista de Salida - Liderazgo',
  'Para gerentes y líderes. Incluye preguntas sobre gestión de equipos y continuidad.',
  'leadership',
  '[
    {
      "order": 1,
      "question": "¿Cómo evaluarías la madurez y desempeño de tu equipo?",
      "type": "textarea",
      "required": true
    },
    {
      "order": 2,
      "question": "¿Quién está listo para asumir mayores responsabilidades?",
      "type": "textarea",
      "required": true
    },
    {
      "order": 3,
      "question": "¿Hay conflictos o tensiones en el equipo que deban atenderse?",
      "type": "yes_no",
      "required": true
    },
    {
      "order": 4,
      "question": "¿Qué mejoras de proceso recomiendas para el equipo?",
      "type": "textarea",
      "required": false
    },
    {
      "order": 5,
      "question": "¿Qué aprendiste como líder que compartirías con otros gerentes?",
      "type": "textarea",
      "required": false
    },
    {
      "order": 6,
      "question": "¿Hay proyectos estratégicos que requieran atención inmediata?",
      "type": "textarea",
      "required": false
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);

-- Verificar inserción
SELECT id, name, category, jsonb_array_length(questions) as num_preguntas
FROM interview_templates
ORDER BY created_at;
