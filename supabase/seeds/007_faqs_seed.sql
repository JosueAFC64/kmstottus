-- =====================================================
-- Seed: FAQs de ejemplo para el módulo de Preguntas Frecuentes
-- =====================================================

-- Primero verificar que existe al menos un perfil de autor
DO $$
DECLARE
    author_uuid UUID;
    ops_cat_id UUID;
    tools_cat_id UUID;
    hr_cat_id UUID;
    safety_cat_id UUID;
BEGIN
    -- Obtener el primer perfil disponible
    SELECT id INTO author_uuid FROM profiles LIMIT 1;
    
    -- Si no hay perfiles, usar NULL (el campo es nullable)
    IF author_uuid IS NULL THEN
        RAISE NOTICE 'No se encontró perfil de autor, las FAQs se crearán sin autor';
    END IF;
    
    -- Obtener IDs de categorías del módulo FAQ
    SELECT id INTO ops_cat_id FROM categories WHERE module_type = 'faq' AND slug = 'operaciones' LIMIT 1;
    SELECT id INTO tools_cat_id FROM categories WHERE module_type = 'faq' AND slug = 'herramientas' LIMIT 1;
    SELECT id INTO hr_cat_id FROM categories WHERE module_type = 'faq' AND slug = 'recursos-humanos' LIMIT 1;
    SELECT id INTO safety_cat_id FROM categories WHERE module_type = 'faq' AND slug = 'seguridad' LIMIT 1;
    
    -- Insertar FAQs de ejemplo
    INSERT INTO faqs (question, answer, category, tags, author_id, status, view_count, display_order, area_id) VALUES
    (
        '¿Qué hacer si el sistema POS no responde durante el turno?',
        'Sigue estos pasos en orden:

1. **Verifica la conexión de red** - Revisa que el cable de red esté conectado correctamente o que el WiFi tenga señal.

2. **Reinicia el terminal** - Apaga el POS, espera 30 segundos y enciéndelo nuevamente.

3. **Si el problema persiste**, cambia a operación manual:
   - Usa las hojas de pedido en blanco
   - Registra todos los pedidos manualmente
   - Anota los métodos de pago utilizados

4. **Reporta inmediatamente** a tu supervisor de turno y al área de TI.

5. **Registra el incidente** en el sistema de tickets con descripción detallada, hora de inicio y affected services.

**Importante**: Nunca intentes reparar el hardware por tu cuenta. Siempre reporta al área correspondiente.',
        'Operaciones',
        ARRAY['POS', 'sistema', 'caja', 'fallas técnicas', 'turno'],
        author_uuid,
        'published',
        156,
        1,
        NULL
    ),
    (
        '¿Cómo cancelar un pedido correctamente?',
        '**Pasos para cancelar un pedido:**

1. **Verifica las condiciones**:
   - El pedido no debe estar en preparación avanzada
   - Consulta con cocina el estado actual

2. **Accede al sistema POS**:
   - Ve a "Pedidos del día"
   - Busca el pedido por número o nombre del cliente

3. **Proceso de cancelación**:
   - Selecciona el pedido
   - Haz clic en "Cancelar"
   - Selecciona el motivo de cancelación
   - Confirma con tu supervisor si el monto supera S/ 50

4. **Notifica a cocina** para que detengan la preparación

5. **Si ya se preparó parcialmente**:
   - Documenta los productos preparados
   - Coordina con el cliente para llevar los productos o generar un crédito

**Motivos válidos de cancelación**:
- Error en el pedido del cliente
- Cliente cancela antes de preparación
- Problema de inventario
- Fallo técnico del sistema',
        'Operaciones',
        ARRAY['pedidos', 'cancelación', 'POS', 'cliente'],
        author_uuid,
        'published',
        203,
        2,
        NULL
    ),
    (
        '¿Cómo reportar un incidente de seguridad?',
        '**Protocolo de reporte de incidentes:**

1. **Evalúa la situación inmediata**:
   - ¿Hay alguna persona en peligro?
   - ¿Es una emergencia que requiere atención médica?
   - ¿Se requiere evacuar el área?

2. **Si es emergencia médica o seguridad**:
   - Llama inmediatamente a emergencias (112)
   - Notifica al supervisor de piso
   - Activa el protocolo de evacuación si es necesario

3. **Reporta el incidente**:
   - Completa el formulario de incidentes en línea
   - O llama a Seguridad Corporativa: anexo 200

4. **Documenta todo**:
   - Describe qué ocurrió
   - Hora y lugar exactos
   - Personas involucradas
   - Testigos
   - Acciones tomadas inmediatamente

5. **Seguimiento**:
   - Tu supervisor debe revisar el reporte dentro de 24 horas
   - Se asignará un investigador al caso

**Tipos de incidentes a reportar**:
- Accidentes laborales
- Robos o intentos de robo
- Comportamiento inusual de clientes
- Condiciones inseguras
- Accidentes con clientes',
        'Seguridad',
        ARRAY['incidentes', 'seguridad', 'emergencia', 'reportes', 'protocolo'],
        author_uuid,
        'published',
        89,
        3,
        NULL
    ),
    (
        '¿Qué hacer cuando falta un ingrediente crítico?',
        '**Protocolo ante faltante de ingredientes:**

1. **Notifica inmediatamente** a tu supervisor y al área de cocina.

2. **Verifica alternativas**:
   - Consulta con el chef si hay sustitutos aprobados
   - Revisa si hay más unidades en almacén

3. **Comunica al cliente**:
   - Informa con empatía y rapidez
   - Ofrece alternativas del menú
   - Aplica el descuento o crédito según política

4. **Si el producto es clave** (pizza del día, promoción):
   - Coordina con tienda más cercana para transferencia
   - Estima tiempo de llegada
   - Da seguimiento al cliente

5. **Registra el faltante** en el sistema de inventario con:
   - Producto faltante
   - Cantidad faltante
   - Hora de detección
   - Causa probable (si se conoce)

**Ingredientes críticos**: Verifica el stock mínimo en la lista visible en cocina.',
        'Operaciones',
        ARRAY['inventario', 'ingredientes', 'stock', 'cocina', 'productos'],
        author_uuid,
        'published',
        134,
        4,
        NULL
    ),
    (
        '¿Cómo solicitar un cambio de turno?',
        '**Proceso para cambio de turno:**

1. **Plazo mínimo**: 48 horas de anticipación (excepto emergencias)

2. **Encuentra a alguien**:
   - Contacta a compañeros de tu mismo rol
   - Verifica que cumplan con los requisitos del turno

3. **Solicitud formal**:
   - Ve al sistema de RRHH en línea
   - Selecciona "Solicitud de Cambio de Turno"
   - Completa:
     * Fecha y turno actual
     * Fecha y turno solicitado
     * Nombre del compañero que cubrirá
     * Motivo del cambio

4. **Validaciones necesarias**:
   - Tu supervisor debe aprobar
   - El compañero debe confirmar
   - RRHH debe validar disponibilidad

5. **Notificación**: Recibirás confirmación por correo en máximo 24 horas.

**Situaciones especiales**:
- **Emergencias médicas**: Proceso acelerado, habla directamente con tu supervisor.
- **Eventos familiares**: Considerar con mayor flexibilidad, consultar con RRHH.',
        'Recursos Humanos',
        ARRAY['turnos', 'horarios', 'RRHH', 'cambio', 'permisos'],
        author_uuid,
        'published',
        178,
        5,
        NULL
    ),
    (
        '¿Cómo usar correctamente la máquina de pizza Express?',
        '**Guía de uso - Horno Express:**

1. **Antes de usar**:
   - Verifica que esté limpia la banda transportadora
   - Confirma la temperatura correcta (consultar tabla de temperatura)
   - Checklist de seguridad completado

2. **Durante la operación**:
   - Coloca la pizza en la posición correcta de la banda
   - Ajusta la velocidad según el tipo de pizza
   - Monitorea el dorado y cocinado
   - Usa los guantes de protección térmica

3. **Posiciones de temperatura**:
   - Pizza estándar: 380°C, 6 minutos
   - Pizza delgada: 400°C, 5 minutos
   - Pizza gruesa: 360°C, 8 minutos

4. **Al terminar**:
   - Limpia la banda con la esponja designated
   - Verifica que no haya residuos de queso o salsa
   - Apaga correctamente si es el último turno

**⚠️ Importante**: Nunca metas las manos sin protección. Siempre usa guantes de alta temperatura.',
        'Herramientas',
        ARRAY['horno', 'pizza', 'equipo', 'cocina', 'máquina'],
        author_uuid,
        'published',
        67,
        6,
        NULL
    ),
    (
        '¿Cuál es el procedimiento para manejar un cliente insatisfecho?',
        '**Protocolo de atención a cliente insatisfecho:**

1. **Escucha activamente**:
   - Deja que el cliente exprese su molestia sin interrumpir
   - Mantén contacto visual y lenguaje corporal abierto
   - Usa frases como "Entiendo su frustración"

2. **Empatiza y disculpa**:
   - Pide disculpas por la experiencia negativa
   - No excuses ni culpes a otros departamentos
   - Reconoce el impacto en el cliente

3. **Propón soluciones**:
   - Ofrece opciones concretas (remplazo, crédito, descuento)
   - Si no puedes decidir, consulta con tu supervisor
   - Da seguimiento personal si el caso lo requiere

4. **Niveles de autoridad para compensaciones**:
   - Empleado: hasta S/ 20
   - Supervisor: hasta S/ 50
   - Gerente: hasta S/ 100
   - Más de S/ 100: requiere autorización de distrito

5. **Documenta y reporta**:
   - Registra en el sistema de feedback
   - Incluye detalles de la situación y acciones tomadas
   - Si es caso grave, notifica a Servicio al Cliente corporativo

**Meta**: Convertir una experiencia negativa en una oportunidad de fidelización.',
        'Operaciones',
        ARRAY['cliente', 'queja', 'atención', 'compensación', 'servicio'],
        author_uuid,
        'published',
        112,
        7,
        NULL
    ),
    (
        '¿Cómo solicitar vacaciones?',
        '**Proceso de solicitud de vacaciones:**

1. **Verifica tu saldo**:
   - Consulta en el portal de RRHH tu balance de vacaciones
   - Recuerda: tienes derecho a 30 días calendario por año

2. **Planifica con anticipación**:
   - Mínimo 15 días antes para vacaciones
   - Coordina con tu equipo para cubrir tus funciones

3. **Solicitud formal**:
   - Ingresa al sistema de RRHH
   - Selecciona "Solicitud de Vacaciones"
   - Indica:
     * Período solicitado (fecha inicio y fin)
     * Días solicitados
     * Persona que cubrirá tus funciones

4. **Aprobaciones**:
   - Tu jefe directo debe aprobar
   - RRHH valida cumplimiento de requisitos
   - Recibirás confirmación por correo

5. **Confirmación final**:
   - Una vez aprobado, impreme tu carta de vacaciones
   - Haz transferencia de conocimiento antes de salir
   - Deja contacts de emergencia

**Vacaciones truncas**: Si no usas tus vacaciones, se pagan al finalizar el vínculo laboral.',
        'Recursos Humanos',
        ARRAY['vacaciones', 'RRHH', 'permisos', 'ausentismo'],
        author_uuid,
        'published',
        95,
        8,
        NULL
    ),
    (
        '¿Qué hacer si un cliente presenta síntomas de COVID-19 en el local?',
        '**Protocolo COVID-19:**

1. **Mantén la calma** y trata al cliente con respeto.

2. **Si el cliente te informa** que tiene síntomas o es contacto positivo:
   - No discrimines ni expulses al cliente
   - Sugiere amablemente que retire en formato delivery
   - Ofrece alternativas para proteger a otros clientes

3. **Medidas preventivas**:
   - Usa tu mascarilla en todo momento
   - Mantén distancia de 2 metros
   - Sana las manos frecuentemente

4. **Si eres tú quien presenta síntomas**:
   - No vayas a trabajar
   - Informa a tu supervisor inmediatamente
   - Realiza la prueba de descarte
   - Aisla los días que indica salud ocupacional

5. **Reporta** cualquier caso confirmado de COVID-19 a Salud Ocupacional:
   - Teléfono: anexo 150
   - Email: saludocupacional@papajohns.com

6. **Limpieza especial**:
   - Si hubo un caso confirmado, solicita limpieza profunda
   - No manipules objetos personales del afectado',
        'Seguridad',
        ARRAY['COVID', 'salud', 'protocolo', 'emergencia', 'sanidad'],
        author_uuid,
        'published',
        45,
        9,
        NULL
    ),
    (
        '¿Cómo registrar correctamente las propinas?',
        '**Procedimiento de propinas:**

1. **Registro diario**:
   - Toda propina debe ser registrada en el sistema
   - Anota monto, fecha y método de pago

2. **Propinas en efectivo**:
   - Deposita en la caja fuerte al final del turno
   - Registra en el cuaderno de propinas
   - El monto se reparte según las horas trabajadas

3. **Propinas con tarjeta**:
   - Se procesan con la cuenta
   - El sistema las distribuye automáticamente
   - Aparece en tu próxima liquidación

4. **Distribución**:
   - 100% para el mesero que atendió
   - Si el servicio fue en equipo, se reparte proporcionalmente

5. **Reporte semanal**:
   - Tu supervisor revisa el registro semanalmente
   - Firma de conformidad al final del mes

**Importante**: Las propinas son ingresos gravables. Deben declararse en tu impuesto a la renta.',
        'Operaciones',
        ARRAY['propinas', 'pagos', 'caja', 'nómina'],
        author_uuid,
        'published',
        28,
        10,
        NULL
    ),
    (
        '¿Cómo reportar fallas en equipos de cocina?',
        '**Reporte de fallas en equipos:**

1. **Evaluación inicial**:
   - ¿El equipo representa algún peligro?
   - ¿Se puede seguir operando de forma segura?

2. **Si hay peligro inmediato**:
   - Desconecta el equipo
   - Coloca letrero "FUERA DE SERVICIO"
   - Reporta de inmediato al supervisor

3. **Reporte formal** (en todos los casos):
   - Sistema de tickets de mantenimiento
   - Categoría: "Falla de Equipo"
   - Incluye:
     * Nombre del equipo
     * Modelo y número de serie
     * Descripción del problema
     * Cuándo comenzó
     * Fotos si es posible

4. **Equipos prioritarios**:
   - Horno
   - Cámara de frío
   - Freidora
   - Amasadora

5. **Seguimiento**:
   - Mantenimiento debe responder en 24 horas
   - Si afecta operación, busca alternativa temporal

**Tip**: Revisa el calendario de mantenimiento preventivo para evitar fallas.',
        'Herramientas',
        ARRAY['mantenimiento', 'equipos', 'fallas', 'cocina', 'reporte'],
        author_uuid,
        'published',
        52,
        11,
        NULL
    ),
    (
        '¿Cuál es el procedimiento para manejar efectivo en caja?',
        '**Procedimiento de caja:**

1. **Apertura de caja**:
   - Cuenta el dinero inicial con supervisor
   - Verifica que coincida con el monto de apertura
   - Registra en el sistema

2. **Durante el turno**:
   - Confirma cada pago
   - Da vuelto exacto
   - Registra cada transacción
   - No aceptes cheques personales

3. **Conciliación cada 2 horas**:
   - Cuenta el efectivo en caja
   - Compara con el sistema
   - Registra diferencia (si hay)

4. **Cierre de caja**:
   - Genera el reporte Z
   - Cuenta todo el dinero
   - Llena la hoja de cierre
   - Supervisorfirma la conciliación

5. **Depósito**:
   - Prepare los billetes en orden
   - Usa el formulario de depósito
   - Entrega al supervisor o banco según política

**Límites de caja**:
- Máximo efectivo: S/ 500
- Exceso debe depositarse inmediatamente',
        'Operaciones',
        ARRAY['caja', 'efectivo', 'dinero', 'cuadratura', 'depósito'],
        author_uuid,
        'published',
        76,
        12,
        NULL
    );

RAISE NOTICE 'FAQs de ejemplo insertadas exitosamente';

END $$;
