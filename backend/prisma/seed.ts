import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Get admin password from environment, default to 'admin123' if not set
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
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
