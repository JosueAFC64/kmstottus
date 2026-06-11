/**
 * Mock data para el repositorio de conocimiento de Tottus
 * Simula datos que vendrían de la base de datos
 * Cada documento tiene contenido realista de retail peruano
 */

import type {
  DocumentListItem,
  DocumentDetail,
  DocumentCategory,
  DocumentFormData,
  Attachment,
} from '@/types/documents';

// ============================================================
// CATEGORÍAS (sincronizadas con el seed de la migración 001)
// ============================================================
export const MOCK_CATEGORIES: DocumentCategory[] = [
  { id: 'cat-manuales', name: 'Manuales Operativos', slug: 'manuales-operativos', icon: 'book', color: '#00a651' },
  { id: 'cat-politicas', name: 'Políticas', slug: 'politicas', icon: 'shield', color: '#f7941d' },
  { id: 'cat-procesos', name: 'Procesos', slug: 'procesos', icon: 'refresh', color: '#00b4d8' },
  { id: 'cat-capacitacion', name: 'Capacitación', slug: 'capacitacion', icon: 'graduation', color: '#6610f2' },
  { id: 'cat-seguridad', name: 'Seguridad', slug: 'seguridad', icon: 'shield-check', color: '#dc3545' },
  { id: 'cat-rrhh', name: 'Recursos Humanos', slug: 'recursos-humanos', icon: 'users', color: '#e83e8c' },
  { id: 'cat-tecnologia', name: 'Tecnología', slug: 'tecnologia', icon: 'computer', color: '#20c997' },
  { id: 'cat-mejoras', name: 'Mejores Prácticas', slug: 'mejores-practicas', icon: 'star', color: '#fd7e14' },
];

// ============================================================
// AUTORES MOCK
// ============================================================
const authors = {
  maria: {
    id: 'auth-maria',
    fullName: 'María García',
    email: 'maria.garcia@tottus.com',
    position: 'Supervisora de Operaciones de Caja',
  },
  carlos: {
    id: 'auth-carlos',
    fullName: 'Carlos López',
    email: 'carlos.lopez@tottus.com',
    position: 'Jefe de Recursos Humanos',
  },
  ana: {
    id: 'auth-ana',
    fullName: 'Ana Martínez',
    email: 'ana.martinez@tottus.com',
    position: 'Coordinadora de Logística',
  },
  pedro: {
    id: 'auth-pedro',
    fullName: 'Pedro Sánchez',
    email: 'pedro.sanchez@tottus.com',
    position: 'Gerente de Seguridad',
  },
  lucia: {
    id: 'auth-lucia',
    fullName: 'Lucía Fernández',
    email: 'lucia.fernandez@tottus.com',
    position: 'Especialista en Marketing',
  },
};

// ============================================================
// HELPERS
// ============================================================
function attachment(name: string, sizeKB: number, type = 'application/pdf'): Attachment {
  return {
    id: `att-${Math.random().toString(36).slice(2, 8)}`,
    name,
    url: `#`,
    size: sizeKB * 1024,
    type,
    uploadedAt: new Date().toISOString(),
  };
}

function doc(
  id: string,
  title: string,
  summary: string,
  content: string,
  categoryId: string,
  authorKey: keyof typeof authors,
  status: DocumentListItem['status'],
  tags: string[],
  viewCount: number,
  isFeatured: boolean,
  isPinned: boolean,
  publishedAt: string,
  accessLevel: DocumentListItem['accessLevel'] = 'public',
  attachments: Attachment[] = [],
  reviewedBy?: keyof typeof authors,
  approvedBy?: keyof typeof authors,
): DocumentDetail {
  const author = authors[authorKey];
  const category = MOCK_CATEGORIES.find((c) => c.id === categoryId)!;
  const rev = reviewedBy ? authors[reviewedBy] : undefined;
  const app = approvedBy ? authors[approvedBy] : undefined;

  return {
    id,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    summary,
    content,
    contentType: 'markdown',
    category,
    author,
    status,
    accessLevel,
    tags,
    viewCount,
    likeCount: Math.floor(viewCount * 0.15),
    commentCount: Math.floor(viewCount * 0.05),
    isFeatured,
    isPinned,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    attachments,
    reviewedBy: rev,
    approvedBy: app,
    version: 1,
  };
}

// ============================================================
// DOCUMENTOS MOCK
// ============================================================
export const MOCK_DOCUMENTS: DocumentDetail[] = [
  // --- MANUALES OPERATIVOS ---
  doc(
    'doc-001',
    'Manual de Procedimientos - Área de Caja',
    'Procedimientos paso a paso para la operación de cajas registradoras, manejo de efectivo, devoluciones y cierres de turno en tienda.',
    `# Manual de Procedimientos — Área de Caja

## 1. Objetivo
Establecer los procedimientos estándar para la operación del área de cajas, asegurando eficiencia, exactitud en el manejo de efectivo y una excelente atención al cliente.

## 2. Alcance
Aplica a todo el personal de cajas de todas las tiendas Tottus a nivel nacional.

## 3. Procedimientos

### 3.1 Apertura de Caja
1. Verificar que la caja registradora esté encendida y en hora
2. Contar el dinero del fondo de cambio (S/ 500.00)
3. Llenar la hoja de fondo fijo con los datos del cajero y el monto
4. Abrir el turno en el sistema con su usuario y clave personal
5. Verificar que la impresora de tickets funcione correctamente

### 3.2 Proceso de Venta
1. Saludar al cliente con una sonrisa y frase de bienvenida
2. Escanear cada producto verificando que el código de barras lea correctamente
3. Si hay algún producto sin código, buscarlo manualmente por nombre oPLU
4. Preguntar si el cliente tiene la tarjeta Tottus para registrar su compra
5. Informar el monto total antes de solicitar el pago
6. Recibir el pago y dar el vuelto exacto
7. Entregar los productos junto con el ticket de compra
8. Despedirse cordialmente: "Gracias por su compra, que tenga un buen día"

### 3.3 Manejo de Devoluciones
1. Solicitar al cliente el producto y el ticket de compra original
2. Verificar que el producto no haya sido usado y conserve su empaque
3. Ingresar al sistema la opción de devolución con el número de ticket
4. Si el pago fue en efectivo, devolver el dinero en efectivo
5. Si el pago fue con tarjeta, realizar la anulación en la misma tarjeta
6. Imprimir nota de crédito y entregar al cliente
7. Registrar la devolución en el libro de devoluciones

### 3.4 Cierre de Turno
1. No iniciar nuevas ventas 15 minutos antes del cierre
2. Contar el dinero en la gaveta: efectivo, cheques, vales
3. Comparar con el cierre Z del sistema
4. Si hay diferencia, reportar inmediatamente al supervisor
5. Llenar la hoja de cierre con totales y firma
6. Depositar el dinero en la caja fuerte
7. Dejar el fondo fijo para el próximo turno

## 4. Recomendaciones de Seguridad
- No dejar la caja abierta sin atención
- No aceptar billetes muy dañados o falsos (conocer las características de seguridad)
- Mantener el PIN de cierre en secreto
- Reportar cualquier anomalía inmediatamente

## 5. Contactos de Emergencia
- Supervisor de tienda: Ext. 201
- Centro de Control: 0800-1-2020
`,
    'cat-manuales',
    'maria',
    'published',
    ['caja', 'operaciones', 'procedimiento', 'efectivo'],
    342,
    true,
    true,
    '2026-01-15T10:00:00Z',
    'public',
    [attachment('Manual_Caja_v3.pdf', 890), attachment('Procedimiento_Devoluciones.pdf', 245)],
    'pedro',
    'carlos',
  ),

  doc(
    'doc-002',
    'Guía de Inventario - Productos Perecibles',
    'Protocolos para la gestión de inventarios de frutas, verduras, carnes y productos refrigerados. Incluye control de mermas y rotación.',
    `# Guía de Gestión de Inventario — Productos Perecibles

## 1. Introducción
Los productos perecibles representan el 35% del inventario de Tottus y requieren un manejo especializado para minimizar mermas y garantizar frescura.

## 2. Recepción de Mercadería

### Verificación de calidad
- Temperatura del vehículo: máximo 4°C para refrigerados, 0°C para congelados
- Estado del producto: sin daños, magulladuras ni signos de descomposición
- Empaque intacto y etiquetado correcto
- Fecha de vencimiento visible y dentro del rango aceptable

### Criterios de rechazo
| Producto | Color | Olor | Textura | Acción |
|----------|-------|------|---------|--------|
| Frutas | Oscuro/marrón | Fermentado | Blanda | Rechazar |
| Verduras | Amarillo/marchito | Mohoso | Flácida | Rechazar |
| Carnes | Gris/verde | Desagradable | Pegajosa | Rechazar |

## 3. Almacenamiento
1. Ubicar productos según zona de temperatura correspondiente
2. Rotular con fecha de recepción y fecha de vencimiento
3. FEFO: Primero en Entrar, Primero en Salir
4. No apilar cajas más de 3 niveles
5. Dejar espacio para circulación de aire

## 4. Control de Mermas
- Registro diario de productos desechados por categoría
- Fotografiar productos en mal estado antes de desechar
- Identificar causas: proveedores, transporte, almacenamiento, manipulación
- Meta mensual de merma: < 3% del volumen total recibido
`,
    'cat-manuales',
    'ana',
    'published',
    ['inventario', 'perecibles', 'mermas', 'almacenamiento'],
    287,
    false,
    false,
    '2026-02-01T09:00:00Z',
    'public',
    [attachment('Guia_Inventario_Perecibles.pdf', 1200)],
    'carlos',
    'maria',
  ),

  // --- POLÍTICAS ---
  doc(
    'doc-003',
    'Política de Precios y Promociones',
    'Lineamientos para la fijación de precios, aplicación de promociones, ofertas y descuentos. Incluye autoridades de aprobación y controles.',
    `# Política de Precios y Promociones — Tottus Perú

## 1. Objetivo
Establecer las normas para la determinación de precios de venta, aplicación de promociones y control de descuentos en todas las tiendas Tottus.

## 2. Principios Fundamentales
- Los precios deben ser competitivos y justos
- Toda promoción debe estar autorizada por el nivel correspondiente
- Los precios exhibidos en góndola son los definitivos (no se cobran precios diferentes en caja)
- Las ofertas son por tiempo limitado y con stock definido

## 3. Niveles de Autoridad

| Tipo de descuento | Hasta 5% | 5-15% | 15-30% | >30% |
|-------------------|----------|-------|--------|------|
| Cajero | ✅ | ❌ | ❌ | ❌ |
| Supervisor | ✅ | ✅ | ❌ | ❌ |
| Jefe de Tienda | ✅ | ✅ | ✅ | ❌ |
| Gerente Regional | ✅ | ✅ | ✅ | ✅ |

## 4. Tipos de Promociones
1. **Ofertas de la semana**: autorizadas hasta el miércoles de la semana anterior
2. **Días especiales**: Fiestas Patrias, Navidad, Día de la Madre, etc.
3. **Promociones de tarjetas**: Solo con autorización de Marketing
4. **Precios corporativos**: Para clientes empresariales con contrato vigente

## 5. Control y Auditoría
- Revisión semanal de precios por el área de Cumplimiento
- Encuestas mystery shopper para verificar exactitud en caja
- Penalidades por incumplimiento: amonestación verbal, escrita oSuspensión según gravedad
`,
    'cat-politicas',
    'carlos',
    'published',
    ['precios', 'promociones', 'politica', 'descuentos'],
    198,
    false,
    false,
    '2026-01-20T11:00:00Z',
    'public',
    [],
    'pedro',
    'carlos',
  ),

  // --- PROCESOS ---
  doc(
    'doc-004',
    'Protocolo de Atención al Cliente',
    'Estandares de atención, manejo de quejas y reclamos, y protocolo ante situaciones especiales con clientes.',
    `# Protocolo de Atención al Cliente — Tottus

## 1. Estándares de Atención

### Primera impresión
- Presentación impecable (uniforme limpio, credencial visible)
- Sonrisa natural al recibir al cliente
- Contacto visual amigable
- Saludo estándar: "¡Bienvenido a Tottus! ¿En qué puedo ayudarle?"

### Durante la atención
- Escuchar activamente sin interrumpir
- No usar celular mientras se atiende
- Hablar con claridad y evitar tecnicismos
- Ofrecer productos complementarios cuando sea relevante

### Cierre de la atención
- Confirmar que el cliente quedó satisfecho
- Agradecer la preferencia
- Invitar a regresar

## 2. Manejo de Quejas

### Paso 1: Escuchar
Dejar que el cliente exprese su malestar sin interrumpir. Mostrar empatía.

### Paso 2: Disculparse
"Siento mucho que haya tenido esta experiencia. Voy a hacer todo lo posible por resolverlo."

### Paso 3: Investigar
Pedir los datos necesarios: ticket, fecha, descripción del problema.

### Paso 4: Resolver
- Si está en sus facultades: resolver inmediatamente
- Si no: escalar al supervisor con un máximo de 5 minutos

### Paso 5: Dar seguimiento
Confirmar que la solución fue satisfactoria.

## 3. Situaciones Especiales

| Situación | Acción |
|-----------|--------|
| Cliente agresivo | Mantener la calma, no confrontar, llamar al supervisor |
| Cliente con niño llorando | Ofrecer ayuda, no juzgar |
| Cliente con discapacidad | Preguntar cómo puede ayudarle sin asumir |
| Producto en mal estado | Reemplazar inmediatamente, reportar a calidad |
| Robo identificado | No confrontar, reportar a seguridad con discreción |
`,
    'cat-procesos',
    'maria',
    'published',
    ['atencion', 'cliente', 'quejas', 'protocolo'],
    256,
    true,
    false,
    '2026-01-10T08:00:00Z',
    'public',
    [],
    'carlos',
    'pedro',
  ),

  doc(
    'doc-005',
    'Procedimiento de Devoluciones y Cambios',
    'Flujo completo para procesar devoluciones y cambios de productos, incluyendo productos de limpieza, electrónicos y ropa.',
    `# Procedimiento de Devoluciones y Cambios

## 1. Política General
Tottus acepta devoluciones y cambios de productos dentro de los **30 días** posteriores a la compra, presentando el ticket de compra o comprobante de pago.

## 2. Condiciones para Aceptar Devoluciones

### Productos que SÍ se aceptan
- Ropa con etiquetas y sin usar
- Electrodomésticos sin señales de uso
- Alimentos dentro de fecha de vencimiento
- Productos de limpieza sin abrir

### Productos que NO se aceptan
- Alimentos perecibles ya refrigerados
- Productos de belleza abiertos
- Ropa interior
- Productos personalizados

## 3. Flujo de Devolución en Caja

\`\`\`
1. Recibir producto + ticket
2. Verificar fecha de compra (≤30 días)
3. Inspección visual del producto
4. Seleccionar en sistema: MENÚ > DEVOLUCIONES > NUEVA
5. Ingresar número de ticket o buscar por fecha
6. Seleccionar motivo de devolución
7. Procesar reembolso según método de pago original
8. Imprimir nota de crédito (2 copias)
9. Entregar copia al cliente
10. Guardar producto en zona de devoluciones
\`\`\`

## 4. Motivos de Devolución más Comunes
- Producto defectuoso
- Producto diferente al solicitado
- Producto en mal estado
- Cambio de opinión del cliente
- Producto no era lo que esperaba
`,
    'cat-procesos',
    'maria',
    'published',
    ['devoluciones', 'cambios', 'proceso', 'caja'],
    189,
    false,
    false,
    '2026-01-25T10:00:00Z',
    'public',
    [attachment('Flujo_Devoluciones.pdf', 340)],
    'pedro',
    'ana',
  ),

  // --- CAPACITACIÓN ---
  doc(
    'doc-006',
    'Módulo de Inducción para Nuevos Colaboradores',
    'Contenido del programa de inducción de 5 días para todo nuevo colaborador de Tottus. Incluye historia, valores, cultura organizacional y tour virtual.',
    `# Módulo de Inducción — Nuevos Colaboradores

## Bienvenido a Tottus

¡Felicitaciones por unirte a nuestro equipo! Este módulo te guiará en tus primeros 5 días en Tottus.

## Día 1: Bienvenida y Cultura

### Nuestra Historia
Tottus llegó al Perú en 2002 y hoy somos una de las cadenas de supermercados más importantes del país. Contamos con más de 80 tiendas a nivel nacional y más de 10,000 colaboradores.

### Nuestros Valores
1. **Respeto**: Tratamos a todos con dignidad y consideración
2. **Honestidad**: Somos transparentes en todas nuestras acciones
3. **Excelencia**: Buscamos la mejora continua en todo lo que hacemos
4. **Trabajo en equipo**: Juntos logramos más
5. **Compromiso con el cliente**: El cliente es el centro de todo

## Día 2: Seguridad y Salud Ocupacional
- Normas de seguridad en tienda
- Ergonomía en áreas de trabajo
- Manipulación manual de cargas
- Plan de emergencia y evacuación
- Uso de EPP según área

## Día 3: Sistema de Ventas y Tecnología
- Uso del sistema POS
- Consulta de precios e inventario
- Manejo de tarjeta Tottus
- Facturación electrónica
- Portal del colaborador

## Día 4: Atención al Cliente
- Estándares de servicio
- Manejo de situaciones difíciles
- Producto y merchandising básico

## Día 5: Integración y Evaluación
- Tour por las áreas de la tienda
- Conocimiento con tu equipo y supervisor
- Evaluación final del módulo
- Plan de desarrollo a 90 días
`,
    'cat-capacitacion',
    'carlos',
    'published',
    ['induccion', 'capacitacion', 'nuevos-colaboradores', 'cultura'],
    421,
    true,
    true,
    '2026-02-10T09:00:00Z',
    'public',
    [attachment('Manual_Induccion_2026.pdf', 2500), attachment('Presentacion_Bienvenida.pptx', 4500)],
    'carlos',
    'carlos',
  ),

  doc(
    'doc-007',
    'Capacitación en Manipulación de Alimentos',
    'Requisitos legales y mejores prácticas para la manipulación segura de alimentos. Certificado obligatorio para personal de perishables.',
    `# Capacitación: Manipulación Segura de Alimentos

## 1. Marco Legal
- Ley N° 28396: Ley General de Inspecciones Técnicas
- D.S. N° 007-98-SA: Reglamento sobre vigilancia y control sanitario de alimentos
- Código Sanitario de Regulaciones alimentarias

## 2. Principios de Higiene Personal

### Antes de manipular alimentos
- ✅ Lavarse las manos por 20 segundos con agua y jabón
- ✅ Uñas cortas y limpias, sin esmalte
- ✅ Cabello recogido dentro de la cofia
- ✅ Delantal limpio
- ❌ No manipular alimentos si estás enfermo (resfrío, diarrea, heridas)

### Durante la manipulación
- ❌ No probar alimentos con los dedos
- ❌ No toser ni estornudar sobre los alimentos
- ❌ No manipular dinero y alimentos al mismo tiempo
- ❌ No usar celulares en áreas de manipulación

## 3. Control de Temperatura

| Categoría | Temp. máxima |
|-----------|-------------|
| Carnes rojas | 4°C |
| Aves | 4°C |
| Pescados | 0°C |
| Lácteos | 6°C |
| Frutas/Verduras | 8°C |
| Congelados | -18°C |

## 4. Prevención de Contaminación Cruzada
- Separar carnes crudas de productos listos para consumir
- Usar tablas de colores para cada tipo de alimento
- Lavar y desinfectar superficies después de cada producto
`,
    'cat-capacitacion',
    'ana',
    'published',
    ['manipulacion', 'alimentos', 'seguridad-alimentaria', 'capacitacion'],
    315,
    false,
    false,
    '2026-02-05T10:00:00Z',
    'public',
    [attachment('Manual_Manipulacion_Alimentos.pdf', 1800), attachment('Anexo_Certificado.docx', 120)],
    'carlos',
    'pedro',
  ),

  // --- SEGURIDAD ---
  doc(
    'doc-008',
    'Protocolo de Seguridad y Prevención de Pérdidas',
    'Procedimientos para la prevención de hurtos, manejo de dinero en efectivo, control de accesos y respuesta ante emergencias.',
    `# Protocolo de Seguridad y Prevención de Pérdidas

## 1. Prevención de Hurtos

### Señales de alerta
- Personas que manipulan productos sin intención de comprar
- Grupos que crean distracciones
- Clientes con bolsos grandes o abrigos fuera de temporada
- Empleados que acceden a áreas restringidas sin justificación

### Medidas preventivas
- Mantener el área de cajas limpia y sin obstrucciones
- Ubicar productos de alto valor cerca de las cajas
- Rotación de personal en áreas críticas
- Cámaras de seguridad en puntos estratégicos

## 2. Manejo de Dinero en Efectivo
- Contar dinero en área protegida
- No hablar de montos en voz alta
- Hacer depósitos frecuentes a la caja fuerte
- Fundo fijo máximo: S/ 500 por caja
- Cierre de caja ante cualquier sospecha

## 3. Control de Accesos
- Tarjeta de identificación visible en todo momento
- Áreas de almacenamiento: solo personal autorizado
- Visitantes: registro en puerta + tarjeta de visitante + acompañamiento
- Revisión de bolsos al salir para contratistas

## 4. Plan de Evacuación
1. Activar alarma de emergencia
2. Guiar a clientes hacia salidas de emergencia
3. No usar ascensores
4. Reunirse en punto de encuentro designado
5. Llamar al 113 (bomberos) o 105 (SAMU) según emergencia

## 5. Números de Emergencia
- Seguridad Interna: 999
- Policía Nacional: 105
- Bomberos: 116
- SAMU: 117
`,
    'cat-seguridad',
    'pedro',
    'published',
    ['seguridad', 'prevencion', 'hurto', 'emergencia'],
    234,
    false,
    false,
    '2026-01-05T08:00:00Z',
    'public',
    [attachment('Plan_Evacuacion_Tienda.pdf', 890), attachment('Mapa_Senales_Seguridad.pdf', 450)],
    'pedro',
    'carlos',
  ),

  // --- RECURSOS HUMANOS ---
  doc(
    'doc-009',
    'Política de Vestimenta y Presentación Personal',
    'Código de vestimenta, uso del uniforme, presentación personal y normas de imagen institucional para todos los colaboradores.',
    `# Política de Vestimenta y Presentación Personal

## 1. Uniforme Obligatorio
Todo colaborador debe usar el uniforme oficial de Tottus durante su jornada laboral:
- Camisa/polo con logo Tottus
- Pantalón de vestir (gris o negro)
- Zapatos cerrados, negros, en buen estado
- Credencial de identificación visible

## 2. Normas de Presentación
- Cabello limpio y peinado (recogido si es largo)
- Uñas cortas y limpias
- Maquillaje discreto (áreas de atención al cliente)
- Sin perfume fuerte
- Higiene personal impecable

## 3. Excepciones
- Personal de mantenimiento: overol de trabajoprovided
- Personal de carnicería: delantal blanco, gorro, guantes
- Personal de limpieza: uniforme provided
- Ejecutivas/os: vestimenta formal según código de área

## 4. Sanciones por Incumplimiento
- 1ra vez: Amonestación verbal
- 2da vez: Amonestación escrita
- 3ra vez: Suspensión de 1 día sin goce de haber
- Casos reiterados: Evaluación para permanencia

## 5. Uniforme de Reemplazo
- El uniforme se renueva 2 veces al año (mayo y noviembre)
- Colaborador es responsable del cuidado de su uniforme
- Costo de reemplazo por daño o pérdida corre por cuenta del colaborador
`,
    'cat-rrhh',
    'carlos',
    'published',
    ['vestimenta', 'uniforme', 'presentacion', 'normas'],
    156,
    false,
    false,
    '2026-01-30T10:00:00Z',
    'public',
    [],
    'pedro',
    'carlos',
  ),

  // --- TECNOLOGÍA ---
  doc(
    'doc-010',
    'Manual del Sistema POS - Punto de Venta',
    'Guía completa del sistema de punto de venta: inicio de sesión, transacciones, consultas, reportes y resolución de problemas comunes.',
    `# Manual del Sistema POS — Tottus v4.2

## 1. Inicio de Sesión
1. Encender la terminal POS
2. Ingresar usuario (código de 6 dígitos)
3. Ingresar clave personal (4 dígitos)
4. Seleccionar turno: MAÑANA / TARDE / NOCHE
5. Confirmar fondo de caja

## 2. Transacciones Básicas

### Venta simple
1. Escanear producto o ingresar PLU
2. Si hay descuento: seleccionar producto > DESCUENTO > %
3. Preguntar por tarjeta Tottus
4. Seleccionar forma de pago
5. Confirmar e imprimir ticket

### Venta con múltiples pagos
1. Ingresar todos los productos
2. Seleccionar forma de pago 1 e ingresar monto
3. Seleccionar FORMA DE PAGO > ADICIONAL
4. Ingresar forma de pago 2 e ingresar monto
5. El sistema calcula el faltante
6. Confirmar al completar

### Anulación de venta
- Solo el supervisor puede anular una venta ya cerrada
- Se requiere motivo obligatorio
- Se imprime nota de crédito

## 3. Consultas Rápidas
- **Precio de un producto**: consultar por PLU o nombre
- **Stock en tienda**: CONSULTAS > INVENTARIO
- **Últimas 5 ventas**: CONSULTAS > VENTAS DEL DÍA

## 4. Cierre de Turno
MENÚ PRINCIPAL > CAJA > CIERRE DE TURNO
1. Verificar que no haya ventas pendientes
2. Contar dinero físico
3. Comparar con cierre Z del sistema
4. Si hay diferencia > S/ 5.00, reportar
5. Imprimir reporte Z
6. Cerrar sesión

## 5. Problemas Comunes
| Problema | Solución |
|----------|---------|
| Pantalla congelada | Ctrl+Alt+Supr > Cerrar sesión > Volver a entrar |
| Impresora sin papel | Abrir, colocar rollo, cerrar |
| Sistema lento | Esperar 30 seg, si persiste, reiniciar POS |
| Error de red | Llamar a mesa de ayuda ext. 500 |
`,
    'cat-tecnologia',
    'pedro',
    'published',
    ['sistema', 'pos', 'tecnologia', 'caja'],
    298,
    false,
    false,
    '2026-02-15T10:00:00Z',
    'public',
    [attachment('Manual_POS_v4.2.pdf', 3200)],
    'carlos',
    'pedro',
  ),

  // --- MEJORES PRÁCTICAS ---
  doc(
    'doc-011',
    'Mejores Prácticas en Exhibición de Productos',
    'Técnicas de visual merchandising para maximizar ventas: layout de góndolas, facing, ubicación de productos y señalización.',
    `# Mejores Prácticas — Visual Merchandising

## 1. Principios de Exhibición

### Regla del 80/20
El 80% de las ventas viene del 20% de los productos. Ubicar productos de alta rotación al nivel de los ojos.

### Cara a cara (Facing)
- Mantener al menos 3 frentes por producto
- Productos más vendidos = más frentes
- Reabastecer desde atrás

## 2. Layout de Góndola

### Zonas estratégicas
\`\`\`
┌─────────────────────────────────┐
│  ZONA CALIENTE (nivel ojos)     │  ← Productos de alta rotación
│  Marcas líderes, ofertas        │
├─────────────────────────────────┤
│  ZONA MEDIA (manos)             │  ← Productos de conveniencia
│  Marcas alternativas            │
├─────────────────────────────────┤
│  ZONA FRÍA (pisos)              │  ← Productos pesados, packs
│  Bebidas, limpieza              │
└─────────────────────────────────┘
\`\`\`

## 3. Tips de Merchandising
- Productos relacionados juntos (café + azúcar + taza)
- Productos de temporada visibles y bien abastecidos
- Precios claros y legibles (letra mínima 14pt)
- Señalización de pasillos clara y actualizada
- Revisar daily que no haya espacios vacíos
- Rotar productos de adelante hacia atrás (FEFO)

## 4. Errores Comunes a Evitar
- Mezclar categorías diferentes en la misma góndola
- Dejar productos caídos en el piso
- Sobrellenar gondolero (difícil выбор)
- No revisar fecha de caducidad en front
- Dejar espacios vacíos sin aviso a roommate
`,
    'cat-mejoras',
    'lucia',
    'published',
    ['merchandising', 'exhibicion', 'ventas', 'gondolas'],
    187,
    false,
    false,
    '2026-02-20T10:00:00Z',
    'public',
    [],
    'maria',
    'lucia',
  ),

  // --- DOCUMENTOS EN BORRADOR / REVISIÓN ---
  doc(
    'doc-012',
    'Guía de Sostenibilidad y Gestión Ambiental',
    'Proyecto de guía para la gestión ambiental en tiendas: manejo de residuos, ahorro de energía, agua y reducción de plásticos.',
    `# Guía de Sostenibilidad — Tottus Perú (BORRADOR)

## 1. Introducción
Tottus se compromete con la sostenibilidad ambiental. Esta guía establece los lineamientos para reducir el impacto ambiental de nuestras operaciones.

## 2. Manejo de Residuos

### Clasificación en tienda
- **Contenedor verde**: Plásticos y metales
- **Contenedor azul**: Cartón y papel
- **Contenedor marrón**: Residuos orgánicos
- **Contenedor rojo**: Residuos peligrosos (pilas, fluorescentes)

### Residuos electrónicos
- Acumulación en zona designada
-pickup mensual con empresa certificada

## 3. Eficiencia Energética
- Luces LED en todas las tiendas nuevas
- Sensores de movimiento en almacenes
- Temperatura de refrigeradores: 2-4°C (no menos)
- Apagar equipos fuera de horario

> ⚠️ **NOTA**: Este documento está en revisión por el equipo de Sostenibilidad. No distribuir hasta aprobación final.
`,
    'cat-mejoras',
    'lucia',
    'draft',
    ['sostenibilidad', 'ambiental', 'residuos', 'borrador'],
    45,
    false,
    false,
    '2026-03-01T10:00:00Z',
    'public',
    [],
  ),

  doc(
    'doc-013',
    'Manual de Gestión de Quejas y Reclamos - Actualización 2026',
    'Versión actualizada del manual de atención de quejas con nuevo protocolo de escalamiento y plazos de resolución. En proceso de revisión legal.',
    `# Manual de Gestión de Quejas y Reclamos — v2026 (EN REVISIÓN)

## Cambios respecto a versión anterior:
- Nuevo flujograma de escalamiento
- Plazos reducidos: ahora 48h para respuesta inicial
- Incorporación de canal WhatsApp
- Nueva clasificación: Crítica / Alta / Media / Baja

## 1. Clasificación de Reclamos

| Nivel | Tipo | Plazo respuesta | Plazo resolución |
|-------|------|----------------|-----------------|
| Crítica | Seguridad, salud | 2 horas | 24 horas |
| Alta | Producto, servicio | 24 horas | 5 días |
| Media | Esperienza | 48 horas | 10 días |
| Baja | Información | 5 días | 15 días |

## 2. Canales de Atención
- Línea gratuita: 0800-1-TOTTUS
- Correo: atencionalcliente@tottus.com
- WhatsApp: +51 999 888 777
- Formulario web
- Presencial en tienda

> ⚠️ **Estado**: Pendiente revisión legal y aprobación de gerencia general.
`,
    'cat-procesos',
    'carlos',
    'pending_review',
    ['quejas', 'reclamos', 'atencion', 'protocolo'],
    12,
    false,
    false,
    '2026-03-05T10:00:00Z',
    'public',
    [attachment('Manual_Quejas_2026_BORRADOR.pdf', 1200)],
    'maria',
  ),
];

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

/**
 * Obtiene la lista de tags únicos usados en todos los documentos
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  MOCK_DOCUMENTS.forEach((doc) => doc.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

/**
 * Convierte DocumentDetail a DocumentListItem (versión resumida)
 */
export function toListItem(doc: DocumentDetail): DocumentListItem {
  const { content, contentType, attachments, reviewedBy, approvedBy, version, previousVersionId, expiresAt, ...rest } = doc;
  return rest as unknown as DocumentListItem;
}