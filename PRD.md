# PRD — GymManager: Sistema de Gestión para Gimnasio de Barrio

**Versión:** 1.1  
**Fecha:** Junio 2026  
**Autor:** Proyecto personal  
**Estado:** Borrador inicial

---

## 1. Resumen Ejecutivo

GymManager es una aplicación web pensada para reemplazar el registro manual en libreta de un gimnasio de barrio de una sola sucursal. El objetivo principal es informatizar la gestión de clientes, cuotas y pagos, reduciendo el riesgo de pérdida de información y ganando visibilidad operativa a través de alertas y reportes. El sistema será usado por una única persona (el dueño/encargado del gimnasio) tanto desde computadora como desde dispositivo móvil.

---

## 2. Objetivos del Producto

- Digitalizar el registro de altas de clientes y sus datos.
- Llevar un control preciso de pagos mensuales y vencimientos por cliente.
- Alertar diariamente sobre qué clientes deben pagar ese día.
- Proveer reportes visuales de ingresos y estado del negocio.
- Estar disponible 24/7 desde cualquier dispositivo, sin costo de infraestructura.

---

## 3. Usuarios

| Usuario | Descripción |
|---|---|
| Dueño / Encargado | Usuario único. Opera el sistema desde PC en el gimnasio o desde celular. No tiene perfil técnico avanzado. |

El sistema tiene un único usuario administrador (el dueño). No hay registro público ni gestión de múltiples usuarios. La autenticación es obligatoria.

---

## 4. Alcance — Funcionalidades

### 4.1 Gestión de Clientes

- **Alta de cliente:** Nombre completo, DNI/documento (opcional), teléfono, fecha de alta.
- **Edición de datos del cliente.**
- **Baja / desactivación de cliente** (sin eliminar el historial).
- **Notas y comentarios por cliente** (campo de texto libre, con fecha de creación).
- **Listado de clientes** con filtros: activos / inactivos / con deuda.

### 4.2 Gestión de Pagos

- **Modelo de pago:** Cuota mensual fija, igual para todos los clientes.
- **Vencimiento individual:** Cada cliente vence el mismo día del mes en que se dio de alta (ej: alta el 15 → vence el 15 de cada mes).
- **Registro de pago mensual:** Fecha de pago, monto abonado, mes al que corresponde.
- **Historial de pagos por cliente:** Lista cronológica de todos los pagos registrados.
- **Estado de pago del mes actual:** Al día / Vencido / Próximo a vencer (configurar umbral, ej: 3 días antes).

### 4.3 Dashboard Principal

El dashboard es la pantalla de inicio y debe mostrar de un vistazo:

- **Lista "Cobrar hoy":** Clientes cuyo vencimiento es el día de hoy y aún no pagaron el mes en curso.
- **Lista "Próximos a vencer":** Clientes que vencen en los próximos N días (configurable, default: 3 días).
- **Lista "Con deuda":** Clientes que ya vencieron y no pagaron.
- **Indicadores numéricos rápidos:**
  - Total de clientes activos.
  - Clientes al día este mes.
  - Clientes con deuda.
  - Ingresos cobrados en el mes actual.

### 4.4 Reportes y Estadísticas

- **Ingresos mensuales:** Gráfico de barras con los ingresos cobrados mes a mes (últimos 12 meses).
- **Clientes activos en el tiempo:** Gráfico de línea mostrando evolución de la cantidad de clientes activos mes a mes.
- **Resumen del mes actual:** Total cobrado vs. total esperado (clientes activos × cuota).
- **Tasa de cobranza:** Porcentaje de clientes que pagaron en el mes actual.

### 4.5 Configuración

- **Precio de la cuota mensual:** Valor editable. Al cambiarlo no afecta registros históricos.
- **Umbral de alerta "próximo a vencer":** Cantidad de días antes del vencimiento para incluir al cliente en esa lista (default: 3).
- **Cambio de contraseña:** El dueño puede cambiar su contraseña desde esta pantalla.

### 4.6 Autenticación

- **Pantalla de login:** Formulario de usuario y contraseña. Es la única pantalla accesible sin sesión activa.
- **Sesión persistente:** Al iniciar sesión, el sistema guarda un token en una cookie HTTP-only con expiración de 30 días. El dueño no necesita volver a loguearse en cada visita desde el mismo dispositivo.
- **Logout:** Opción visible en el menú para cerrar sesión manualmente.
- **Credenciales únicas:** Un solo usuario administrador. No hay registro ni recuperación automática de contraseña — si se pierde, se resetea directamente en el servidor (variable de entorno o script).
- **Protección de rutas:** Todas las rutas del frontend y todos los endpoints de la API requieren sesión válida. Una request sin token válido recibe HTTP 401 y el frontend redirige al login.

---

## 5. Funcionalidades Fuera de Alcance (v1.0)

Las siguientes funcionalidades quedan explícitamente fuera de la versión inicial para mantener el alcance manejable:

- Múltiples planes o precios diferenciados por cliente.
- Registro de asistencia diaria.
- Notificaciones por WhatsApp o email.
- Gestión de múltiples sucursales.
- Multi-usuario o roles.
- App móvil nativa (se accede por navegador móvil, diseño responsive).
- Integración con medios de pago (Mercado Pago, etc.).
- Facturación o comprobantes de pago.

---

## 6. Modelo de Datos

### Entidad: `usuario`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID / serial | Clave primaria |
| username| VARCHAR | usuario Acceso |
| password_hash| VARCHAR |Password creade con bcript |
| created_at| TIMESTAMP |Fecha de creación |
Observación:

Aunque actualmente existe un único usuario, se mantiene una tabla dedicada para facilitar futuras ampliaciones sin cambios estructurales.
### Entidad: `cliente`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID / serial | Clave primaria |
| nombre | VARCHAR | Nombre completo |
| dni | VARCHAR (nullable) | Documento (opcional) |
| telefono | VARCHAR (nullable) | Teléfono de contacto |
| fecha_alta | DATE | Fecha de inscripción (determina el día de vencimiento mensual) |
| activo | BOOLEAN | True = activo, False = baja |
| created_at | TIMESTAMP | Fecha de creación del registro |

### Entidad: `pago`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID / serial | Clave primaria |
| cliente_id | FK → cliente | A qué cliente pertenece |
| fecha_pago | DATE | Cuándo se registró el pago |
| monto | DECIMAL | Monto abonado |
| periodo_mes | INT | Mes al que corresponde (1–12) |
| periodo_año | INT | Año al que corresponde |
| created_at | TIMESTAMP | Fecha de creación del registro |

### Entidad: `nota`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID / serial | Clave primaria |
| cliente_id | FK → cliente | A qué cliente pertenece |
| texto | TEXT | Contenido de la nota |
| created_at | TIMESTAMP | Fecha de creación |

### Entidad: `configuracion`

| Campo | Tipo | Descripción |
|---|---|---|
| clave | VARCHAR | Nombre del parámetro (ej: "precio_cuota") |
| valor | VARCHAR | Valor del parámetro |

---

## 7. Stack Tecnológico Recomendado

### Criterios de selección

- Costo cero en producción.
- Un solo desarrollador, sin experiencia previa obligatoria en el stack.
- Disponibilidad 24/7 en web y mobile (responsive).
- Mantenimiento mínimo.

### Stack propuesto

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | React + Vite + TailwindCSS | SPA liviana, responsive por defecto, excelente ecosistema de componentes de UI. Vite simplifica el setup. |
| **Backend** | Node.js + Express (o Fastify) | Fácil de aprender, ideal para APIs REST pequeñas. Bajo consumo de recursos (importante en plan gratuito). |
| **Base de datos** | PostgreSQL | El más robusto para datos relacionales. Tiene planes gratuitos en Neon o Supabase. |
| **ORM** | Prisma | Tipado, migraciones automáticas, muy amigable para proyectos pequeños. |
| **Autenticación** | JWT + cookie HTTP-only | Sin dependencias externas, simple de implementar. El token viaja en cookie (no en localStorage) para evitar XSS. |
| **Hash de contraseña** | bcrypt | Estándar para hashear contraseñas. La contraseña nunca se guarda en texto plano. |
| **Hosting frontend** | Vercel (free tier) | Deploy automático desde GitHub. CDN incluida. |
| **Hosting backend** | Render (free tier) | Soporta Node.js. Free tier disponible (con limitación de sleep). |
| **Base de datos hosting** | Neon.tech (free tier) | PostgreSQL serverless gratuito, compatible con Prisma. |

### Alternativa más simple (todo en uno)

Si se prefiere simplicidad máxima sobre arquitectura: **Next.js full-stack** con API Routes y desplegado en **Vercel**. Esto elimina la necesidad de un servidor separado. La base de datos sigue siendo Neon/Supabase.

### Consideración importante sobre el free tier de Render

El plan gratuito de Render "duerme" el servidor tras 15 minutos de inactividad. La primera request después de un período sin uso puede tardar ~30 segundos. Para un uso de gimnasio (uso frecuente durante el día) esto rara vez es un problema. Si molesta, **Railway** ofrece $5 de crédito gratis al mes que cubre un servidor pequeño 24/7.

---

## 8. Arquitectura del Sistema

```
[Navegador - PC o Móvil]
        |
        | HTTPS
        v
[Frontend — React/Vite]        ← Vercel (CDN)
        |
        | HTTP REST API
        v
[Backend — Node.js/Express]    ← Render / Railway
        |
        | Prisma ORM
        v
[Base de Datos — PostgreSQL]   ← Neon.tech
```

- El frontend consume la API del backend.
- El backend valida datos y ejecuta lógica de negocio (calcular vencimientos, estado de pago, etc.).
- La base de datos almacena toda la información persistente.

---

## 9. Pantallas / Vistas Principales

| Pantalla | Descripción |
|---|---|
| Dashboard | Listas de cobrar hoy / próximos / con deuda + indicadores rápidos |
| Lista de Clientes | Tabla con filtros, búsqueda por nombre, botón de alta |
| Detalle de Cliente | Datos personales, historial de pagos, notas, botón registrar pago |
| Registrar Pago | Modal/formulario simple: monto, mes, fecha |
| Reportes | Gráficos de ingresos y evolución de clientes |
| Configuración | Edición de precio de cuota y umbral de alerta |

---

## 10. Lógica de Negocio Clave

### Cálculo de vencimiento mensual

```
día_vencimiento = día del mes de fecha_alta del cliente
vencimiento_mes_actual = año_actual + mes_actual + día_vencimiento

Si hoy >= vencimiento_mes_actual → el cliente está en período de cobro
Si el cliente no tiene pago registrado para el mes actual → aparece en "cobrar hoy" o "con deuda"
```

Caso borde: clientes con alta el día 29, 30 o 31 en meses más cortos → usar el último día del mes como vencimiento.

### Clasificación diaria de clientes

- **Cobrar hoy:** `día de hoy == día_vencimiento` AND no tiene pago del mes actual.
- **Próximos a vencer:** `día de hoy < día_vencimiento` AND `día_vencimiento - hoy <= umbral_días` AND no tiene pago del mes actual.
- **Con deuda:** `día de hoy > día_vencimiento` AND no tiene pago del mes actual.
- **Al día:** tiene pago registrado para el mes actual.

---

## 11. Requisitos No Funcionales

| Requisito | Detalle |
|---|---|
| Responsive | Debe usarse cómodamente desde celular (pantallas de 375px+) |
| Disponibilidad | 24/7, tolerando el cold start del free tier |
| Backup | La base de datos en Neon/Supabase incluye backups automáticos en el plan gratuito |
| Performance | Para ~200 clientes, no hay requerimientos especiales de performance |
|Privacidad | Los datos de clientes sólo pueden visualizarse con sesión iniciada
|Seguridad| Acceso protegido mediante autenticación obligatoria, contraseñas hasheadas y cookies HTTP-only

---

## 12. Plan de Desarrollo Sugerido (Fases)

### Fase 1 — MVP Core
- Setup del proyecto (repo, Vercel, Render, Neon).
- Modelo de datos y migraciones con Prisma.
- CRUD completo de clientes.
- Registro de pagos.
- Dashboard con listas de cobros del día.

### Fase 2 — Reportes y Nota
- Módulo de reportes con gráficos (Recharts o Chart.js).
- Notas por cliente.
- Pantalla de configuración (precio cuota, umbral alerta).

### Fase 3 — Pulido UX
- Diseño mobile-first refinado.
- Manejo de errores y estados vacíos.
- Filtros avanzados en lista de clientes.
- Casos borde (vencimiento fin de mes, etc.).

---

## 13. Riesgos y Consideraciones

| Riesgo | Mitigación |
|---|---|
| Free tier con cold start lento | Usar Railway ($5/mes crédito) si molesta, o ping periódico al servidor |
| Pérdida de datos | Neon y Supabase incluyen backups. Adicionalmente, exportar CSV periódicamente |
| El gimnasio crece y necesita más funciones | Diseñar la base de datos con margen (ej: campo `plan_id` nullable para futuras extensiones) |

---

*Fin del documento — PRD v1.0*
