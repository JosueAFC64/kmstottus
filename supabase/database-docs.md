# KMS Papa Johns Perú - Documentación de Base de Datos

## 1. Visión General

El sistema KMS utiliza **Supabase** (PostgreSQL) como base de datos principal. El diseño sigue principios de normalización, escalabilidad y rendimiento.

---

## 2. Diagrama de Relaciones (ERD Simplificado)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE / AUTH                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐      ┌──────────────┐      ┌─────────────┐                │
│  │   profiles   │─────│  user_roles   │─────│    roles    │                │
│  └─────────────┘      └──────────────┘      └─────────────┘                │
│        │                    │                                              │
│        │                    │                                              │
│        ▼                    ▼                                              │
│  ┌─────────────┐      ┌──────────────┐                                    │
│  │ departments │      │    areas     │                                    │
│  └─────────────┘      └──────────────┘                                    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         KNOWLEDGE MODULE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌────────────────┐    ┌─────────────────┐              │
│  │ categories  │───▶│   documents    │◀───│  document_tags  │              │
│  └─────────────┘    └────────────────┘    └─────────────────┘              │
│         │                  │                    │                          │
│         │                  ▼                    ▼                          │
│         │           ┌────────────────┐    ┌─────────────┐                  │
│         │           │document_comments│   │     tags     │                  │
│         │           └────────────────┘    └─────────────┘                  │
│         │                  │                                             │
│         │                  ▼                                             │
│         │           ┌─────────────┐                                        │
│         │           │  bookmarks  │                                        │
│         │           └─────────────┘                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                          ONBOARDING MODULE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐    ┌────────────────────┐                         │
│  │  onboarding_paths   │───▶│ onboarding_modules │                         │
│  └─────────────────────┘    └────────────────────┘                         │
│         │                           │                                        │
│         │                           ▼                                        │
│         │                   ┌────────────────────┐                         │
│         │                   │onboarding_progress │                         │
│         │                   └────────────────────┘                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                       EXIT INTERVIEWS MODULE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌──────────────────────┐                           │
│  │exit_interviews  │───▶│ interview_responses  │                           │
│  └─────────────────┘    └──────────────────────┘                           │
│         │                         │                                         │
│         │                         ▼                                         │
│         │                 ┌──────────────────────┐                          │
│         │                 │ extracted_knowledge  │                          │
│         │                 └──────────────────────┘                          │
│         │                                                                │
│         ▼                                                                │
│  ┌───────────────────┐                                                   │
│  │interview_templates│                                                   │
│  └───────────────────┘                                                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                      LESSONS LEARNED MODULE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌───────────────────┐                              │
│  │ lessons_learned │───▶│ lesson_categories │                              │
│  └─────────────────┘    └───────────────────┘                              │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         EXPERTS MODULE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌────────────────┐    ┌───────────────┐                │
│  │   experts   │───▶│ expert_skills  │◀───│skill_endorsements│              │
│  └─────────────┘    └────────────────┘    └───────────────┘                │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                        METRICS MODULE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌────────────────┐    ┌──────────────┐              │
│  │ activity_logs│    │ document_views  │    │ search_logs   │              │
│  └──────────────┘    └────────────────┘    └──────────────┘              │
│                              │                        │                     │
│                              ▼                        ▼                     │
│                      ┌──────────────┐                                        │
│                      │ daily_metrics │                                        │
│                      └──────────────┘                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            FAQs MODULE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌──────────────┐                                        │
│  │    faqs     │───▶│  faq_votes    │                                        │
│  └─────────────┘    └──────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tablas Detalladas

### 3.1 Core - Usuarios y Auth

#### `profiles`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK principal |
| `user_id` | UUID | FK a auth.users de Supabase |
| `first_name` | VARCHAR(100) | Nombre |
| `last_name` | VARCHAR(100) | Apellido |
| `email` | VARCHAR(255) | Email (único) |
| `phone` | VARCHAR(20) | Teléfono |
| `employee_code` | VARCHAR(20) | Código de empleado Tottus |
| `hire_date` | DATE | Fecha de ingreso |
| `department_id` | UUID | FK a departments |
| `area_id` | UUID | FK a areas |
| `position` | VARCHAR(150) | Cargo |
| `status` | user_status | Estado del usuario |
| `is_expert` | BOOLEAN | Si es experto registrado |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

**Decisión de diseño**: Se separa de `auth.users` para tener flexibilidad en datos corporativos y soft deletes sin tocar auth.

#### `roles`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `permissions` | JSONB | Array de permisos en JSON |
| `is_system` | BOOLEAN | No eliminable |

**Decisión de diseño**: Permissions como JSONB para flexibilidad - permite agregar nuevos permisos sin cambiar schema.

#### `departments` y `areas`
- Relación jerárquica 1:N (departamento → áreas)
- Departments tiene `parent_id` para jerarquía superior

---

### 3.2 Knowledge Module

#### `documents` (Artículos de conocimiento)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `content` | TEXT | Contenido en markdown/HTML |
| `content_type` | VARCHAR(20) | Formato del contenido |
| `category_id` | UUID | FK a categorías |
| `access_level` | access_level | Public/Team/Department/Restricted |
| `author_id` | UUID | FK a profiles |
| `status` | document_status | Estado del documento |
| `version` | INTEGER | Control de versiones |
| `previous_version_id` | UUID | Link a versión anterior |
| `tags` | TEXT[] | Array de tags |
| `view_count`, `like_count`, etc. | INTEGER | Métricas |

**Decisiones de diseño**:
- `version` + `previous_version_id` permite historial completo
- Métricas en la misma tabla para evitar JOINs en dashboards
- `access_level` enum para control granular

#### `categories` (Jerárquica)
- `parent_id` permite categorías anidadas
- `order_index` para ordenamiento en UI
- `slug` para URLs amigables

#### `tags`
- Tabla separada para reutilización
- `usage_count` actualizado por trigger para tags populares

#### `bookmarks`
- Relación usuario-documento única
- `notes` para notas personales

---

### 3.3 Onboarding Module

#### `onboarding_paths`
- Define journeys completos de onboarding
- `target_role` permite asignar automáticamente

#### `onboarding_modules`
- Módulos individuales dentro de un path
- `module_type`: content, quiz, task, document
- `quiz_questions` JSONB para flexibilidad
- `linked_document_id` para referenciar KB

#### `onboarding_progress`
- Seguimiento por usuario × módulo
- `status` con estados: not_started, in_progress, completed, overdue
- `quiz_score` y `quiz_attempts` para evaluaciones

**Decisión de diseño**: Progress separada de modules para permitir reusar módulos en diferentes paths.

---

### 3.4 Exit Interviews Module

#### `exit_interviews`
- Scheduling y metadata de la entrevista
- `status` con estados específicos del proceso
- `summary` post-entrevista
- `follow_up_required` para marcar acciones

#### `interview_templates`
- Plantillas reutilizables de preguntas
- `questions` JSONB con estructura:
  ```json
  [
    {"order": 1, "question": "...", "type": "text", "required": true},
    {"order": 2, "question": "...", "type": "rating", "required": false}
  ]
  ```

#### `interview_responses`
- Respuestas individuales por pregunta
- `contains_knowledge` marca conocimiento tácito valioso
- `extracted_content` para contenido extraído

#### `extracted_knowledge`
- Piezas de conocimiento derivadas de entrevistas
- `knowledge_type`: process, tip, warning, best_practice, contacts
- `status` para workflow de aprobación

**Decisión de diseño**: Múltiples tablas permiten workflow completo: template → interview → responses → extraction → approval → publication

---

### 3.5 Lessons Learned Module

#### `lessons_learned`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `situation` | TEXT | Qué pasó |
| `actions_taken` | TEXT | Qué se hizo |
| `result` | TEXT | Resultado |
| `lessons` | TEXT | Qué se aprendió |
| `recommendations` | TEXT | Recomendaciones |
| `priority` | lesson_priority | Prioridad |
| `impact_level` | VARCHAR(20) | Nivel de impacto |
| `involved_profiles` | UUID[] | Array de involucrados |
| `applicable_areas` | TEXT[] | Áreas de aplicación |

**Decisión de diseño**: Estructura SARAR (Situation, Actions, Results, Lessons, Recommendations) para consistencia.

---

### 3.6 Experts Module

#### `experts`
- Perfil especializado de conocimiento
- `availability_status` para consulta
- Métricas de rating y consultas

#### `expert_skills`
- Habilidades específicas por experto
- `expertise_level`: beginner, intermediate, advanced, expert
- `certifications` array

#### `skill_endorsements`
- Validaciones entre usuarios
- Evita duplicados con UNIQUE constraint

---

### 3.7 Metrics Module

#### `activity_logs`
- Log genérico de todas las acciones
- `action_type` + `entity_type` + `entity_id` para flexibilidad
- `metadata` JSONB para datos adicionales

#### `document_views`
- Tracking detallado de vistas
- `time_spent_seconds` para engagement
- `completion_percentage` para alcance

#### `search_logs`
- Análisis de comportamiento de búsqueda
- `filters_applied` para entender necesidades
- `clicked_result_id` para optimización

#### `daily_metrics`
- Agregaciones diarias para dashboards rápidos
- Evita calcular métricas en tiempo real

---

### 3.8 FAQs Module

#### `faqs`
- Q&A simple con categorización
- `upvotes` / `downvotes` para ordenamiento
- `related_document_id` para profundizar

#### `faq_votes`
- Votos por usuario (UNIQUE para evitar duplicados)

---

## 4. Índices y Optimización

### Índices Creados

| Tabla | Índice | Propósito |
|-------|--------|-----------|
| documents | `idx_documents_category` | Filtrar por categoría |
| documents | `idx_documents_author` | Artículos por autor |
| documents | `idx_documents_status` | Filtro de estado |
| documents | `idx_documents_title_search` | Búsqueda full-text |
| profiles | `idx_profiles_department` | Usuarios por dept |
| activity_logs | `idx_activity_logs_user` | Actividad por usuario |
| search_logs | `idx_search_logs_created` | Búsquedas por fecha |

### Estrategias de Optimización

1. **Índices parciales**: En categories, solo índices para `is_active = TRUE`
2. **Full-text search**: `to_tsvector('spanish', ...)` para búsqueda en español
3. **Pre-aggregación**: `daily_metrics` evita cálculos en tiempo real
4. **Contadores en tabla**: Métricas en documents evitan COUNT queries

---

## 5. Triggers Automáticos

| Trigger | Función | Propósito |
|---------|---------|-----------|
| `update_*_updated_at` | 15 triggers | Auto-actualizar timestamps |
| `update_tag_usage_on_document_tags` | Trigger | Contador de uso de tags |

---

## 6. Row Level Security (RLS)

### Políticas Implementadas

1. **profiles**: 
   - SELECT: usuarios ven su propio perfil
   - UPDATE: usuarios actualizan su perfil

2. **documents**:
   - SELECT: publicados o autor
   - INSERT/UPDATE/DELETE: según rol

### Consideraciones

- RLS está habilitado en todas las tablas
- Políticas base definidas; ajustar según necesidades reales
- Supabase Auth maneja la autenticación

---

## 7. Seed Data Incluido

### Roles
- admin, editor, contributor, viewer, hr_manager

### Departamentos Tottus
- RRHH, Operaciones, Ventas, Logística, Admin, Marketing, TI, Seguridad

### Áreas
- 9 áreas predefinidas distribuidas en departamentos principales

### Categorías de Documentos
- 8 categorías: Manuales, Políticas, Procesos, Capacitación, Seguridad, RRHH, Tecnología, Mejores Prácticas

### Categorías de Lecciones
- Éxito, Error, Mejora, Innovación, Riesgo

### Plantillas de Entrevista
- Entrevista General (5 preguntas)
- Entrevista Técnica (4 preguntas)

---

## 8. Próximos Pasos

1. **Crear proyecto en Supabase** y conectar
2. **Ejecutar migración** desde SQL
3. **Configurar autenticación** con providers
4. **Ajustar políticas RLS** según requisitos
5. **Generar tipos TypeScript** desde el schema

---

## 9. Consideraciones de Escalabilidad

### Horizontal
- UUIDs permiten merge de bases distribuidas
- Índices optimizan consultas complejas
- Soft deletes preservan datos para auditoría

### Vertical
- Tablas bien normalizadas evitan redundancia
- JSONB para flexibilidad sin cambiar schema
- Contadores pre-calculados evitan scans completos

### Performance
- Índices covering para queries frecuentes
- Pre-aggregación en daily_metrics
- Full-text search nativo de PostgreSQL