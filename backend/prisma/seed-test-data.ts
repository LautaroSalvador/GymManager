/**
 * seed-test-data.ts
 *
 * Script de datos de prueba para desarrollo local.
 * Inserta clientes y pagos que ejercitan todos los escenarios del dashboard.
 *
 * Hoy: 1 de junio de 2026
 *
 * Escenarios cubiertos:
 *   - "Cobrar hoy"      → alta día 1  → vence el 1 de junio → sin pago junio
 *   - "Próx. a vencer"  → alta día 2, 3 → vence en 1-2 días → sin pago junio
 *   - "Al día"          → tienen pago registrado para junio 2026
 *   - "Con deuda"       → aparecerá naturalmente a partir del día 3+ cuando
 *                         los clientes de días 2 y 3 no paguen
 *   - Inactivo          → activo = false (no aparecen en dashboard)
 *
 * Uso: npx ts-node prisma/seed-test-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Insertando datos de prueba...\n');

  // ── Precio de cuota (para calcular montos de pago) ───────────────────────
  const precioCuotaStr = await prisma.configuracion.findUnique({
    where: { clave: 'precio_cuota' },
  });
  const precioCuota = precioCuotaStr ? parseFloat(precioCuotaStr.valor) : 15000;

  // ── Clientes "Cobrar hoy" (alta día 1) ──────────────────────────────────
  const cobrarHoy1 = await prisma.cliente.upsert({
    where: { id: 100 },
    update: {},
    create: {
      id: 100,
      nombre: 'Juan Pérez',
      dni: '30123456',
      telefono: '11-4567-8901',
      fechaAlta: new Date('2026-01-01'),
      activo: true,
    },
  });

  const cobrarHoy2 = await prisma.cliente.upsert({
    where: { id: 101 },
    update: {},
    create: {
      id: 101,
      nombre: 'Roberto Sánchez',
      dni: null,
      telefono: '11-2233-4455',
      fechaAlta: new Date('2025-09-01'),
      activo: true,
    },
  });

  console.log(`✓ "Cobrar hoy":      ${cobrarHoy1.nombre}, ${cobrarHoy2.nombre}`);

  // ── Clientes "Próximos a vencer" (alta día 2 y día 3) ───────────────────
  const proximo1 = await prisma.cliente.upsert({
    where: { id: 102 },
    update: {},
    create: {
      id: 102,
      nombre: 'María García',
      dni: '27654321',
      telefono: '11-9988-7766',
      fechaAlta: new Date('2026-03-02'),
      activo: true,
    },
  });

  const proximo2 = await prisma.cliente.upsert({
    where: { id: 103 },
    update: {},
    create: {
      id: 103,
      nombre: 'Carlos López',
      dni: null,
      telefono: null,
      fechaAlta: new Date('2025-12-03'),
      activo: true,
    },
  });

  console.log(`✓ "Próx. a vencer":  ${proximo1.nombre} (día 2), ${proximo2.nombre} (día 3)`);

  // ── Clientes "Al día" (tienen pago de junio 2026 ya registrado) ─────────
  const alDia1 = await prisma.cliente.upsert({
    where: { id: 104 },
    update: {},
    create: {
      id: 104,
      nombre: 'Laura Fernández',
      dni: '33445566',
      telefono: '11-5544-3322',
      fechaAlta: new Date('2026-01-15'),
      activo: true,
    },
  });

  await prisma.pago.upsert({
    where: { id: 200 },
    update: {},
    create: {
      id: 200,
      clienteId: alDia1.id,
      fechaPago: new Date('2026-06-01'),
      monto: precioCuota,
      periodoMes: 6,
      periodoAnio: 2026,
    },
  });

  const alDia2 = await prisma.cliente.upsert({
    where: { id: 105 },
    update: {},
    create: {
      id: 105,
      nombre: 'Sofía Ramírez',
      dni: '22334455',
      telefono: '11-6677-8899',
      fechaAlta: new Date('2025-11-20'),
      activo: true,
    },
  });

  await prisma.pago.upsert({
    where: { id: 201 },
    update: {},
    create: {
      id: 201,
      clienteId: alDia2.id,
      fechaPago: new Date('2026-06-01'),
      monto: precioCuota,
      periodoMes: 6,
      periodoAnio: 2026,
    },
  });

  console.log(`✓ "Al día":          ${alDia1.nombre} (día 15), ${alDia2.nombre} (día 20) — pago junio registrado`);

  // ── Cliente con historial de pagos anteriores (para probar reportes) ─────
  const conHistorial = await prisma.cliente.upsert({
    where: { id: 106 },
    update: {},
    create: {
      id: 106,
      nombre: 'Diego Martínez',
      dni: '29876543',
      telefono: '11-1122-3344',
      fechaAlta: new Date('2025-06-10'),
      activo: true,
    },
  });

  // Pagos de los últimos 6 meses (para poblar el gráfico de reportes)
  const pagosHistorial = [
    { id: 202, mes: 12, anio: 2025, fecha: '2025-12-10' },
    { id: 203, mes: 1,  anio: 2026, fecha: '2026-01-10' },
    { id: 204, mes: 2,  anio: 2026, fecha: '2026-02-10' },
    { id: 205, mes: 3,  anio: 2026, fecha: '2026-03-10' },
    { id: 206, mes: 4,  anio: 2026, fecha: '2026-04-10' },
    { id: 207, mes: 5,  anio: 2026, fecha: '2026-05-10' },
    { id: 208, mes: 6,  anio: 2026, fecha: '2026-06-01' }, // junio ya pagado
  ];

  for (const p of pagosHistorial) {
    await prisma.pago.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        clienteId: conHistorial.id,
        fechaPago: new Date(p.fecha),
        monto: precioCuota,
        periodoMes: p.mes,
        periodoAnio: p.anio,
      },
    });
  }

  console.log(`✓ Con historial:     ${conHistorial.nombre} — 7 meses de pagos cargados`);

  // ── Nota de prueba en un cliente ─────────────────────────────────────────
  await prisma.nota.upsert({
    where: { id: 300 },
    update: {},
    create: {
      id: 300,
      clienteId: alDia1.id,
      texto: 'Viene los lunes, miércoles y viernes. Horario mañana.',
    },
  });

  await prisma.nota.upsert({
    where: { id: 301 },
    update: {},
    create: {
      id: 301,
      clienteId: cobrarHoy1.id,
      texto: 'Paga siempre al final del mes. Avisarle con anticipación.',
    },
  });

  // ── Cliente inactivo (no aparece en dashboard, sí en lista de clientes) ──
  const inactivo = await prisma.cliente.upsert({
    where: { id: 107 },
    update: {},
    create: {
      id: 107,
      nombre: 'Marcelo Torres',
      dni: '31234567',
      telefono: null,
      fechaAlta: new Date('2025-03-15'),
      activo: false,
    },
  });

  console.log(`✓ Inactivo:          ${inactivo.nombre} (no aparece en dashboard)`);

  console.log('\n✅ Datos de prueba insertados correctamente!');
  console.log('');
  console.log('Resumen del dashboard que deberías ver:');
  console.log('  📌 Cobrar hoy:      2 clientes (Juan Pérez, Roberto Sánchez)');
  console.log('  🔔 Próx. a vencer:  2 clientes (María García, Carlos López)');
  console.log('  ✅ Al día:           3 clientes (Laura Fernández, Sofía Ramírez, Diego Martínez)');
  console.log('  ❌ Con deuda:        0 (aparece naturalmente a partir del día 3 de cada mes)');
  console.log('');
  console.log('Y en Reportes verás ingresos en el gráfico gracias al historial de Diego Martínez.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
