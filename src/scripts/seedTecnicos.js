const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('tecnico123', 10);

  await prisma.usuarioAdministrativo.upsert({
    where: { correo: 'juan.tecnico@lostres.com' },
    update: { rol: 'tecnico', password: hashedPassword, nombre: 'Juan Pérez' },
    create: {
      nombre: 'Juan Pérez',
      correo: 'juan.tecnico@lostres.com',
      password: hashedPassword,
      rol: 'tecnico',
    },
  });

  await prisma.usuarioAdministrativo.upsert({
    where: { correo: 'maria.tecnico@lostres.com' },
    update: { rol: 'tecnico', password: hashedPassword, nombre: 'María López' },
    create: {
      nombre: 'María López',
      correo: 'maria.tecnico@lostres.com',
      password: hashedPassword,
      rol: 'tecnico',
    },
  });

  console.log('Técnicos creados: juan.tecnico@lostres.com / maria.tecnico@lostres.com (tecnico123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
