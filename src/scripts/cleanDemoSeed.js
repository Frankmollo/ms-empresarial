/**
 * Elimina los datos de demo insertados por error (seedAll).
 * No toca superadmin@lostres.com.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEMO_CEDULAS = [
  '1001001', '1001002', '1001003', '1001004',
  '1001005', '1001006', '1001007', '1001008',
];
const DEMO_DISTRITOS = ['Norte', 'Sur', 'Centro', 'Este'];
const DEMO_ANALISTAS = [
  'carlos.analista@lostres.com',
  'maria.fraudes@lostres.com',
];

async function main() {
  const medidores = await prisma.medidor.deleteMany({
    where: { codigo: { startsWith: 'MED-100100' } },
  });

  const clientes = await prisma.cliente.deleteMany({
    where: { cedula: { in: DEMO_CEDULAS } },
  });

  const analistaUsers = await prisma.usuarioAdministrativo.findMany({
    where: { correo: { in: DEMO_ANALISTAS } },
  });

  const asignaciones = await prisma.asignacionDistrito.deleteMany({
    where: { usuarioId: { in: analistaUsers.map((u) => u.id) } },
  });

  const analistas = await prisma.usuarioAdministrativo.deleteMany({
    where: { correo: { in: DEMO_ANALISTAS } },
  });

  const distritos = await prisma.distrito.deleteMany({
    where: { nombre: { in: DEMO_DISTRITOS } },
  });

  console.log('Datos demo eliminados:', {
    medidores: medidores.count,
    clientes: clientes.count,
    asignaciones: asignaciones.count,
    analistas: analistas.count,
    distritos: distritos.count,
  });

  console.log('Restante en BD:', {
    clientes: await prisma.cliente.count(),
    medidores: await prisma.medidor.count(),
    distritos: await prisma.distrito.count(),
    usuarios: await prisma.usuarioAdministrativo.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
