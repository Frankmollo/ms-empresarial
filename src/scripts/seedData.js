const xlsx = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const excelPath = path.resolve('C:\\Users\\Public\\DESCARGARS_0_1\\ReporteMedidores\\ReporteMedidores.xlsx');
  console.log('Leyendo archivo Excel:', excelPath);
  
  const workbook = xlsx.readFile(excelPath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`Se encontraron ${data.length} filas en el Excel.`);

  const ubicaciones = new Set();
  const cuentas = new Set();

  for (const row of data) {
    if (row.Ubicación) ubicaciones.add(row.Ubicación);
    if (row.CUENTA) cuentas.add(row.CUENTA);
  }

  const bcrypt = require('bcrypt');
  
  const superadminEmail = 'superadmin@lostres.com';
  let superadmin = await prisma.usuarioAdministrativo.findUnique({
    where: { correo: superadminEmail }
  });

  if (!superadmin) {
    console.log('Creando usuario Superadmin semilla...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    superadmin = await prisma.usuarioAdministrativo.create({
      data: {
        nombre: 'Superadmin',
        correo: superadminEmail,
        password: hashedPassword,
        rol: 'maestro'
      }
    });
  } else {
    console.log('Usuario Superadmin ya existe.');
  }

  console.log('Creando catálogo de Distritos...');
  for (const ubi of ubicaciones) {
    await prisma.distrito.upsert({
      where: { nombre: ubi },
      update: {},
      create: { nombre: ubi }
    });
  }

  console.log('Creando Clientes y Medidores (uno por CUENTA)...');
  for (const cta of cuentas) {
    const ctaStr = cta.toString();
    // Crear cliente
    let cliente = await prisma.cliente.findUnique({ where: { cedula: ctaStr } });
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre: `Cliente ${ctaStr}`,
          cedula: ctaStr,
          direccion: `Dirección asociada a ${ctaStr}`
        }
      });
    }

    // Crear medidor
    await prisma.medidor.upsert({
      where: { codigo: `MED-${ctaStr}` },
      update: {},
      create: {
        codigo: `MED-${ctaStr}`,
        tipo: 'Trifásico',
        estado: 'Activo',
        clienteId: cliente.id
      }
    });
  }

  console.log('Seed inicial completado con éxito.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
