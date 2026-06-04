# CLAUDE.md

# GymManager

## Proyecto

GymManager es una aplicación web para la gestión integral de un gimnasio de barrio con una única sucursal.

Su objetivo es reemplazar el registro manual en papel de clientes y pagos por una solución digital accesible desde computadora y dispositivos móviles.

La especificación funcional completa se encuentra en `PRD.md`.

---

# Fuente de Verdad

Las prioridades de decisión son:

1. PRD.md
2. CLAUDE.md
3. Decisiones previamente implementadas en el código
4. Suposiciones

Si existe cualquier contradicción entre el código y el PRD, el PRD tiene prioridad.

Si una funcionalidad no está claramente definida en el PRD:

* No asumir comportamiento.
* Solicitar aclaración antes de implementar.

---

# Filosofía del Proyecto

Este proyecto está pensado para:

* Un único gimnasio.
* Una única sucursal.
* Un único usuario administrador.
* Menos de 500 clientes activos.

No implementar complejidad anticipada innecesaria.

Evitar sobreingeniería.

Construir únicamente lo necesario para cumplir los requerimientos actuales.

---

# Stack Tecnológico

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS

## Backend

* Node.js
* Express
* TypeScript

## Base de Datos

* PostgreSQL

## ORM

* Prisma

## Autenticación

* JWT
* Cookies HTTP-only
* bcrypt

---

# Principios de Desarrollo

## Código

Todo el código debe ser:

* Legible
* Mantenible
* Escalable
* Tipado estrictamente
* Fácil de comprender para un desarrollador junior

Priorizar claridad por encima de optimizaciones prematuras.

---

## TypeScript

Utilizar modo estricto.

No utilizar:

* any
* ts-ignore
* soluciones que oculten errores de tipado

Preferir tipos explícitos.

---

## Arquitectura Backend

Utilizar separación por capas.

Flujo obligatorio:

Route
→ Controller
→ Service
→ Repository
→ Database

Los Controllers:

* Reciben requests.
* Validan entrada.
* Invocan servicios.
* Devuelven respuestas.

No contienen lógica de negocio.

Los Services:

* Contienen reglas de negocio.
* Coordinan operaciones.

Los Repositories:

* Son la única capa que interactúa con Prisma.

---

## Arquitectura Frontend

Separar responsabilidades entre:

* pages
* components
* hooks
* services
* types
* utils

Evitar componentes gigantes.

Si un componente supera aproximadamente 200 líneas evaluar dividirlo.

---

# Estructura Esperada

## Backend

```text
src/
├── modules/
├── routes/
├── controllers/
├── services/
├── repositories/
├── middlewares/
├── validators/
├── config/
├── types/
├── utils/
└── server.ts
```

## Frontend

```text
src/
├── pages/
├── components/
├── layouts/
├── hooks/
├── services/
├── types/
├── utils/
├── routes/
└── main.tsx
```

---

# Base de Datos

Utilizar Prisma como única forma de acceso a datos.

No realizar SQL embebido salvo necesidad justificada.

Toda modificación del esquema debe realizarse mediante migraciones Prisma.

Antes de modificar el esquema:

* Verificar compatibilidad con datos existentes.
* Actualizar documentación correspondiente.

---

# Validación

Toda entrada proveniente del usuario debe validarse.

Utilizar Zod para:

* Body
* Query params
* Route params

No confiar en validaciones del frontend.

---

# Manejo de Errores

Implementar manejo centralizado.

No utilizar bloques try/catch repetidos innecesariamente.

Utilizar errores tipados cuando corresponda.

Las respuestas de error deben ser consistentes.

Formato esperado:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

# Seguridad

Todos los endpoints protegidos deben requerir autenticación.

Requisitos:

* JWT firmado.
* Cookies HTTP-only.
* Contraseñas hasheadas con bcrypt.
* Variables sensibles únicamente en variables de entorno.

Nunca almacenar:

* Contraseñas en texto plano.
* Tokens en localStorage.
* Secretos en repositorios Git.

---

# UI/UX

Prioridad mobile-first.

La aplicación debe funcionar correctamente desde:

* Celulares
* Tablets
* Desktop

Objetivos:

* Simplicidad
* Rapidez
* Pocos clics
* Legibilidad

El usuario principal no posee conocimientos técnicos avanzados.

---

# Convenciones

## Naming

Componentes React:

```text
CustomerCard.tsx
PaymentModal.tsx
```

Hooks:

```text
useCustomers.ts
useDashboard.ts
```

Services:

```text
customer.service.ts
payment.service.ts
```

Repositories:

```text
customer.repository.ts
payment.repository.ts
```

Routes:

```text
customer.routes.ts
payment.routes.ts
```

---

# Calidad

Antes de finalizar cualquier tarea:

* Verificar compilación.
* Verificar tipado.
* Verificar linting.
* Verificar imports no utilizados.
* Verificar consistencia con el PRD.

---

# Regla de Implementación

No implementar múltiples funcionalidades simultáneamente.

Trabajar siempre en pequeños incrementos.

Para cada tarea:

1. Explicar el objetivo.
2. Explicar el diseño elegido.
3. Implementar.
4. Indicar archivos modificados.
5. Identificar posibles riesgos.

---

# Alcance

No implementar funcionalidades fuera del alcance definido en PRD.md.

Ejemplos de funcionalidades explícitamente fuera de alcance:

* Multiusuario
* Múltiples sucursales
* WhatsApp
* Email automático
* Mercado Pago
* Facturación
* Aplicación móvil nativa

Si se detecta una posible mejora fuera del alcance, proponerla primero y esperar aprobación antes de implementarla.
