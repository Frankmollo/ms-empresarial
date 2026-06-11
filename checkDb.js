const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const expedientes = await prisma.expediente.findMany({
    select: { id: true, codigo: true, tecnico_asignado: true, estado: true }
  });
  console.log(expedientes);
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
