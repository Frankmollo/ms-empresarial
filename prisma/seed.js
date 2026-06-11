const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('tecnico123', 10);
  
  await prisma.usuarioAdministrativo.upsert({
    where: { correo: 'juan.tecnico@lostres.com' },
    update: { password: hashedPassword },
    create: {
      nombre: 'Juan Tecnico',
      correo: 'juan.tecnico@lostres.com',
      password: hashedPassword,
      rol: 'tecnico',
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuarioAdministrativo.upsert({
    where: { correo: 'superadmin@lostres.com' },
    update: { password: adminPassword },
    create: {
      nombre: 'Super Admin',
      correo: 'superadmin@lostres.com',
      password: adminPassword,
      rol: 'maestro',
    },
  });

  console.log('✅ Usuarios creados exitosamente.');
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
