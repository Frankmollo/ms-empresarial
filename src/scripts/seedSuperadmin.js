const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@lostres.com';
  const existing = await prisma.usuarioAdministrativo.findUnique({ where: { correo: email } });
  if (existing) {
    console.log('Superadmin ya existe:', email);
    return;
  }
  await prisma.usuarioAdministrativo.create({
    data: {
      nombre: 'Superadmin',
      correo: email,
      password: await bcrypt.hash('admin123', 10),
      rol: 'maestro',
    },
  });
  console.log('Superadmin creado:', email, '/ admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
