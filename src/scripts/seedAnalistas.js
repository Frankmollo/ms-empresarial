const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  console.log('Creando analistas de fraude...');

  await prisma.usuarioAdministrativo.upsert({
    where: { correo: 'carlos.analista@lostres.com' },
    update: {},
    create: {
      nombre: 'Carlos Analista',
      correo: 'carlos.analista@lostres.com',
      password: hashedPassword,
      rol: 'analista'
    }
  });

  await prisma.usuarioAdministrativo.upsert({
    where: { correo: 'maria.fraudes@lostres.com' },
    update: {},
    create: {
      nombre: 'María Fraudes',
      correo: 'maria.fraudes@lostres.com',
      password: hashedPassword,
      rol: 'analista'
    }
  });

  console.log('Analistas creados exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
