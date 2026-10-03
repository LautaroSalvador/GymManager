import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const MIN_PASSWORD_LENGTH = 12;

async function main() {
  console.log('Seeding database...');

  // La contraseña del admin es obligatoria y debe ser larga: no hay valor por defecto.
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD es obligatoria y debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Seed Usuario
  const adminUser = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: passwordHash,
    },
    create: {
      username: 'admin',
      passwordHash: passwordHash,
    },
  });

  console.log(`Admin user '${adminUser.username}' seeded.`);

  // Seed Configuration Defaults
  const configs = [
    { clave: 'precio_cuota', valor: '15000' },
    { clave: 'umbral_alerta_dias', valor: '3' },
  ];

  for (const config of configs) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: {}, // Keep original value if already configured (as per PRD)
      create: config,
    });
  }

  console.log('Default configurations seeded.');
  console.log('Database seeding complete!');
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
