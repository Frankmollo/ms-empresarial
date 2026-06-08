const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const datos = [
  { id: 1, nombre: 'Diego Vargas Díaz', cedula: 'US-111', direccion: '02.001.017.4120-1', medidorAsignado: 'US-111', estado: 'Suspendido' },
  { id: 2, nombre: 'Laura Díaz Choque', cedula: 'US-121', direccion: '02.001.022.6900-1', medidorAsignado: 'US-121', estado: 'Activo' },
  { id: 3, nombre: 'Ana Fernández López', cedula: 'US-131', direccion: '02.001.011.8500-1', medidorAsignado: 'US-131', estado: 'Activo' },
  { id: 4, nombre: 'Roberto Quispe Rojas', cedula: 'US-141', direccion: '02.001.027.2600-1', medidorAsignado: 'US-141', estado: 'Activo' },
  { id: 5, nombre: 'Jose Díaz Vargas', cedula: 'US-151', direccion: '02.001.091.14070-1', medidorAsignado: 'US-151', estado: 'Mantenimiento' },
  { id: 6, nombre: 'Fernando Pérez Díaz', cedula: 'US-161', direccion: '02.001.004.1110-2', medidorAsignado: 'US-161', estado: 'Activo' },
  { id: 7, nombre: 'Miguel Mamani Choque', cedula: 'US-171', direccion: '02.001.011.7300-1', medidorAsignado: 'US-171', estado: 'Activo' },
  { id: 8, nombre: 'Carmen Gómez Gutierrez', cedula: 'US-181', direccion: '02.001.011.2000-1', medidorAsignado: 'US-181', estado: 'Suspendido' },
  { id: 9, nombre: 'Roberto Rojas Pérez', cedula: 'US-191', direccion: '02.001.011.9500-1', medidorAsignado: 'US-191', estado: 'Activo' },
  { id: 10, nombre: 'Maria Mamani Choque', cedula: 'US-201', direccion: '02.001.008.8600-2', medidorAsignado: 'US-201', estado: 'Activo' },
  { id: 11, nombre: 'Laura Quispe Pérez', cedula: 'US-211', direccion: '02.001.011.9900-1', medidorAsignado: 'US-211', estado: 'Suspendido' },
  { id: 12, nombre: 'Elena Choque Rodríguez', cedula: 'US-221', direccion: '02.001.011.10000-1', medidorAsignado: 'US-221', estado: 'Activo' },
  { id: 13, nombre: 'Lucia Díaz Rojas', cedula: 'US-231', direccion: '02.001.005.5690-1', medidorAsignado: 'US-231', estado: 'Activo' },
  { id: 14, nombre: 'Elena Vargas Rojas', cedula: 'US-241', direccion: '02.001.009.2500-1', medidorAsignado: 'US-241', estado: 'Activo' },
  { id: 15, nombre: 'Patricia López Sánchez', cedula: 'US-251', direccion: '02.011.043.80800-1', medidorAsignado: 'US-251', estado: 'Mantenimiento' },
  { id: 16, nombre: 'Fernando Vargas Pérez', cedula: 'US-261', direccion: '02.001.002.9300-3', medidorAsignado: 'US-261', estado: 'Mantenimiento' },
  { id: 17, nombre: 'Diego Mendoza Díaz', cedula: 'US-271', direccion: '02.001.005.100-1', medidorAsignado: 'US-271', estado: 'Activo' },
  { id: 18, nombre: 'Patricia Gutierrez Quispe', cedula: 'US-281', direccion: '02.011.043.80200-1', medidorAsignado: 'US-281', estado: 'Activo' },
  { id: 19, nombre: 'Carmen Gómez Fernández', cedula: 'US-291', direccion: '02.001.011.13900-1', medidorAsignado: 'US-291', estado: 'Activo' },
  { id: 20, nombre: 'Juan López Sánchez', cedula: 'US-301', direccion: '02.001.011.11250-1', medidorAsignado: 'US-301', estado: 'Activo' },
  { id: 21, nombre: 'Luis Gómez Gómez', cedula: 'US-311', direccion: '02.001.004.1110-1', medidorAsignado: 'US-311', estado: 'Activo' },
  { id: 22, nombre: 'Roberto Rodríguez Rodríguez', cedula: 'US-321', direccion: '02.001.011.10140-1', medidorAsignado: 'US-321', estado: 'Suspendido' },
  { id: 23, nombre: 'Fernando Sánchez Sánchez', cedula: 'US-331', direccion: '02.001.011.10100-1', medidorAsignado: 'US-331', estado: 'Activo' },
  { id: 24, nombre: 'Fernando Pérez Quispe', cedula: 'US-341', direccion: '02.001.011.2650-1', medidorAsignado: 'US-341', estado: 'Activo' },
  { id: 25, nombre: 'Jose Rodríguez Mendoza', cedula: 'US-351', direccion: '02.011.043.80250-1', medidorAsignado: 'US-351', estado: 'Suspendido' },
  { id: 26, nombre: 'Ana Rodríguez Mamani', cedula: 'US-361', direccion: '02.001.063.8600-2', medidorAsignado: 'US-361', estado: 'Activo' },
  { id: 27, nombre: 'Maria Fernández Pérez', cedula: 'US-371', direccion: '02.001.011.8390-1', medidorAsignado: 'US-371', estado: 'Activo' },
  { id: 28, nombre: 'Roberto Quispe Rojas', cedula: 'US-381', direccion: '02.011.043.80150-2', medidorAsignado: 'US-381', estado: 'Suspendido' },
  { id: 29, nombre: 'Fernando Gómez Díaz', cedula: 'US-391', direccion: '02.011.043.80150-3', medidorAsignado: 'US-391', estado: 'Activo' },
  { id: 30, nombre: 'Elena Fernández Rodríguez', cedula: 'US-401', direccion: '02.003.001.9700-1', medidorAsignado: 'US-401', estado: 'Activo' },
  { id: 31, nombre: 'Roberto Flores Pérez', cedula: 'US-411', direccion: '02.001.009.13500-1', medidorAsignado: 'US-411', estado: 'Mantenimiento' },
  { id: 32, nombre: 'Diego Mendoza Rojas', cedula: 'US-421', direccion: '02.001.011.10250-2', medidorAsignado: 'US-421', estado: 'Suspendido' },
  { id: 33, nombre: 'Luis Quispe Mendoza', cedula: 'US-431', direccion: '02.003.001.300-2', medidorAsignado: 'US-431', estado: 'Activo' },
  { id: 34, nombre: 'Jose López Flores', cedula: 'US-441', direccion: '02.002.025.51900-1', medidorAsignado: 'US-441', estado: 'Activo' },
  { id: 35, nombre: 'Diego Flores Fernández', cedula: 'US-451', direccion: '02.001.011.13300-1', medidorAsignado: 'US-451', estado: 'Activo' },
  { id: 36, nombre: 'Carlos Vargas Gómez', cedula: 'US-461', direccion: '02.001.011.14700-1', medidorAsignado: 'US-461', estado: 'Activo' },
  { id: 37, nombre: 'Roberto Quispe Rojas', cedula: 'US-471', direccion: '02.001.011.2605-1', medidorAsignado: 'US-471', estado: 'Mantenimiento' },
  { id: 38, nombre: 'Juan Quispe Flores', cedula: 'US-481', direccion: '02.003.009.6830-1', medidorAsignado: 'US-481', estado: 'Activo' },
  { id: 39, nombre: 'Jose Díaz Rojas', cedula: 'US-491', direccion: '02.001.011.1750-1', medidorAsignado: 'US-491', estado: 'Activo' },
  { id: 40, nombre: 'Patricia Sánchez Choque', cedula: 'US-501', direccion: '02.001.009.400-1', medidorAsignado: 'US-501', estado: 'Activo' },
  { id: 41, nombre: 'Miguel Mendoza Díaz', cedula: 'US-511', direccion: '02.001.015.21400-2', medidorAsignado: 'US-511', estado: 'Activo' },
  { id: 42, nombre: 'Elena Vargas Fernández', cedula: 'US-521', direccion: '02.003.003.500-2', medidorAsignado: 'US-521', estado: 'Activo' },
  { id: 43, nombre: 'Roberto López Rojas', cedula: 'US-531', direccion: '02.001.011.2653-1', medidorAsignado: 'US-531', estado: 'Suspendido' },
  { id: 44, nombre: 'Diego Gutierrez Pérez', cedula: 'US-541', direccion: '02.001.011.2660-1', medidorAsignado: 'US-541', estado: 'Mantenimiento' },
  { id: 45, nombre: 'Jose Rodríguez Gutierrez', cedula: 'US-551', direccion: '02.011.043.79900-3', medidorAsignado: 'US-551', estado: 'Mantenimiento' },
  { id: 46, nombre: 'Fernando Fernández Fernández', cedula: 'US-561', direccion: '02.001.011.1775-1', medidorAsignado: 'US-561', estado: 'Suspendido' },
  { id: 47, nombre: 'Fernando Fernández Pérez', cedula: 'US-571', direccion: '02.001.006.114755-1', medidorAsignado: 'US-571', estado: 'Activo' },
  { id: 48, nombre: 'Diego Mendoza Rojas', cedula: 'US-581', direccion: '02.001.062.1705-1', medidorAsignado: 'US-581', estado: 'Mantenimiento' },
  { id: 49, nombre: 'Lucia Gómez Choque', cedula: 'US-591', direccion: '02.001.011.5180-1', medidorAsignado: 'US-591', estado: 'Activo' },
  { id: 50, nombre: 'Diego Rodríguez Díaz', cedula: 'US-601', direccion: '02.001.042.380-1', medidorAsignado: 'US-601', estado: 'Activo' },
  { id: 51, nombre: 'Jose Choque Rodríguez', cedula: 'US-611', direccion: '02.001.009.2565-2', medidorAsignado: 'US-611', estado: 'Activo' },
  { id: 52, nombre: 'Carlos López Fernández', cedula: 'US-621', direccion: '02.001.011.4500-2', medidorAsignado: 'US-621', estado: 'Suspendido' },
  { id: 53, nombre: 'Lucia Rodríguez Mendoza', cedula: 'US-631', direccion: '04.005.065.6600-1', medidorAsignado: 'US-631', estado: 'Mantenimiento' },
  { id: 54, nombre: 'Luis Mendoza Flores', cedula: 'US-641', direccion: '02.001.011.1600-1', medidorAsignado: 'US-641', estado: 'Activo' },
  { id: 55, nombre: 'Luis Sánchez Pérez', cedula: 'US-651', direccion: '02.001.011.13600-1', medidorAsignado: 'US-651', estado: 'Mantenimiento' },
  { id: 56, nombre: 'Miguel Pérez Sánchez', cedula: 'US-661', direccion: '02.011.042.600-2', medidorAsignado: 'US-661', estado: 'Activo' },
  { id: 57, nombre: 'Patricia Vargas Fernández', cedula: 'US-671', direccion: '02.001.011.14500-2', medidorAsignado: 'US-671', estado: 'Suspendido' },
  { id: 58, nombre: 'Ana Fernández Gómez', cedula: 'US-681', direccion: '02.001.102.95-1', medidorAsignado: 'US-681', estado: 'Activo' },
  { id: 59, nombre: 'Elena Pérez Gutierrez', cedula: 'US-691', direccion: '02.001.012.12595-2', medidorAsignado: 'US-691', estado: 'Activo' },
  { id: 60, nombre: 'Carmen Gutierrez Choque', cedula: 'US-701', direccion: '02.001.011.1780-1', medidorAsignado: 'US-701', estado: 'Suspendido' },
  { id: 61, nombre: 'Carmen Rodríguez Mamani', cedula: 'US-711', direccion: '02.011.043.79951-1', medidorAsignado: 'US-711', estado: 'Mantenimiento' },
  { id: 62, nombre: 'Jose Quispe Gómez', cedula: 'US-721', direccion: '02.001.016.2665-1', medidorAsignado: 'US-721', estado: 'Activo' },
  { id: 63, nombre: 'Ana Díaz Mendoza', cedula: 'US-731', direccion: '02.001.009.18585-1', medidorAsignado: 'US-731', estado: 'Suspendido' },
  { id: 64, nombre: 'Elena López Flores', cedula: 'US-741', direccion: '02.001.004.1155-1', medidorAsignado: 'US-741', estado: 'Activo' },
  { id: 65, nombre: 'Ana Quispe Sánchez', cedula: 'US-751', direccion: '02.001.102.1790-1', medidorAsignado: 'US-751', estado: 'Activo' },
  { id: 66, nombre: 'Lucia Sánchez Choque', cedula: 'US-761', direccion: '02.001.011.9400-1', medidorAsignado: 'US-761', estado: 'Activo' },
  { id: 67, nombre: 'Patricia Fernández Fernández', cedula: 'US-771', direccion: '02.001.011.13800-1', medidorAsignado: 'US-771', estado: 'Activo' },
  { id: 68, nombre: 'Lucia Mamani Choque', cedula: 'US-781', direccion: '02.003.003.500-3', medidorAsignado: 'US-781', estado: 'Mantenimiento' },
  { id: 69, nombre: 'Ana Flores Flores', cedula: 'US-791', direccion: '02.002.025.53800-6', medidorAsignado: 'US-791', estado: 'Suspendido' },
  { id: 70, nombre: 'Miguel Díaz Mamani', cedula: 'US-801', direccion: '02.001.006.10650-1', medidorAsignado: 'US-801', estado: 'Suspendido' },
  { id: 71, nombre: 'Ana Rojas Flores', cedula: 'US-811', direccion: '02.001.006.70450-1', medidorAsignado: 'US-811', estado: 'Suspendido' },
  { id: 72, nombre: 'Patricia Vargas Fernández', cedula: 'US-821', direccion: '04.005.065.18800-1', medidorAsignado: 'US-821', estado: 'Suspendido' },
  { id: 73, nombre: 'Roberto Mendoza Sánchez', cedula: 'US-831', direccion: '02.001.011.12910-1', medidorAsignado: 'US-831', estado: 'Activo' },
  { id: 74, nombre: 'Patricia Sánchez Gutierrez', cedula: 'US-841', direccion: '02.003.004.8000-1', medidorAsignado: 'US-841', estado: 'Activo' },
  { id: 75, nombre: 'Miguel Rodríguez Rojas', cedula: 'US-851', direccion: '02.001.011.1660-1', medidorAsignado: 'US-851', estado: 'Activo' },
  { id: 76, nombre: 'Laura Gómez Flores', cedula: 'US-861', direccion: '02.001.009.2995-1', medidorAsignado: 'US-861', estado: 'Suspendido' },
  { id: 77, nombre: 'Lucia Rojas Quispe', cedula: 'US-871', direccion: '02.001.015.21700-1', medidorAsignado: 'US-871', estado: 'Activo' },
  { id: 78, nombre: 'Carlos Rodríguez Díaz', cedula: 'US-881', direccion: '02.001.012.12550-1', medidorAsignado: 'US-881', estado: 'Activo' },
  { id: 79, nombre: 'Carmen Flores López', cedula: 'US-891', direccion: '02.001.062.1000-1', medidorAsignado: 'US-891', estado: 'Mantenimiento' },
  { id: 80, nombre: 'Patricia Gutierrez Sánchez', cedula: 'US-901', direccion: '02.001.016.1205-1', medidorAsignado: 'US-901', estado: 'Mantenimiento' },
  { id: 81, nombre: 'Patricia Vargas Fernández', cedula: 'US-911', direccion: '02.001.011.10130-1', medidorAsignado: 'US-911', estado: 'Mantenimiento' },
  { id: 82, nombre: 'Laura Gutierrez Gómez', cedula: 'US-921', direccion: '02.001.006.126100-3', medidorAsignado: 'US-921', estado: 'Mantenimiento' },
  { id: 83, nombre: 'Lucia Rodríguez Gómez', cedula: 'US-931', direccion: '02.011.043.80250-2', medidorAsignado: 'US-931', estado: 'Activo' },
  { id: 84, nombre: 'Carmen Gómez Díaz', cedula: 'US-941', direccion: '02.001.042.4555-1', medidorAsignado: 'US-941', estado: 'Activo' },
  { id: 85, nombre: 'Fernando Rojas Gutierrez', cedula: 'US-951', direccion: '02.003.001.200-1', medidorAsignado: 'US-951', estado: 'Activo' },
  { id: 86, nombre: 'Ana Quispe Fernández', cedula: 'US-961', direccion: '04.006.066.35800-1', medidorAsignado: 'US-961', estado: 'Mantenimiento' },
  { id: 87, nombre: 'Lucia Fernández Rojas', cedula: 'US-971', direccion: '02.011.043.80220-1', medidorAsignado: 'US-971', estado: 'Activo' },
  { id: 88, nombre: 'Jose Sánchez Quispe', cedula: 'US-981', direccion: '02.001.011.10100-2', medidorAsignado: 'US-981', estado: 'Suspendido' },
  { id: 89, nombre: 'Patricia López Vargas', cedula: 'US-991', direccion: '02.003.004.7000-1', medidorAsignado: 'US-991', estado: 'Suspendido' },
  { id: 90, nombre: 'Diego Gutierrez Mendoza', cedula: 'US-1001', direccion: '02.001.009.6700-1', medidorAsignado: 'US-1001', estado: 'Activo' },
  { id: 91, nombre: 'Miguel Flores Pérez', cedula: 'US-1011', direccion: '02.001.015.21900-1', medidorAsignado: 'US-1011', estado: 'Activo' },
  { id: 92, nombre: 'Elena Choque Vargas', cedula: 'US-1021', direccion: '02.001.010.808-1', medidorAsignado: 'US-1021', estado: 'Activo' },
  { id: 93, nombre: 'Diego Vargas Rojas', cedula: 'US-1031', direccion: '02.003.001.3870-3', medidorAsignado: 'US-1031', estado: 'Suspendido' },
  { id: 94, nombre: 'Miguel Choque Gómez', cedula: 'US-1041', direccion: '02.001.008.11850-1', medidorAsignado: 'US-1041', estado: 'Suspendido' },
  { id: 95, nombre: 'Carmen Pérez Rojas', cedula: 'US-1051', direccion: '02.001.011.265120-1', medidorAsignado: 'US-1051', estado: 'Mantenimiento' },
  { id: 96, nombre: 'Maria Gómez Pérez', cedula: 'US-1061', direccion: '02.001.018.5000-5', medidorAsignado: 'US-1061', estado: 'Activo' },
  { id: 97, nombre: 'Laura Choque Pérez', cedula: 'US-1071', direccion: '02.003.001.8640-1', medidorAsignado: 'US-1071', estado: 'Activo' },
  { id: 98, nombre: 'Elena Gutierrez Mamani', cedula: 'US-1081', direccion: '02.001.015.21500-1', medidorAsignado: 'US-1081', estado: 'Activo' },
  { id: 99, nombre: 'Maria Vargas Vargas', cedula: 'US-1091', direccion: '02.003.007.8900-1', medidorAsignado: 'US-1091', estado: 'Activo' },
  { id: 100, nombre: 'Maria Mendoza Rodríguez', cedula: 'US-1101', direccion: '02.001.011.12200-1', medidorAsignado: 'US-1101', estado: 'Suspendido' },
  { id: 101, nombre: 'Patricia López Fernández', cedula: 'US-1111', direccion: '02.001.011.2646-1', medidorAsignado: 'US-1111', estado: 'Activo' },
  { id: 102, nombre: 'Carlos Rojas Díaz', cedula: 'US-1121', direccion: '02.001.011.13510-1', medidorAsignado: 'US-1121', estado: 'Suspendido' },
  { id: 103, nombre: 'Juan Pérez Gómez', cedula: 'US-1131', direccion: '02.122.078.12200-1', medidorAsignado: 'US-1131', estado: 'Mantenimiento' },
  { id: 104, nombre: 'Ana López Díaz', cedula: 'US-1141', direccion: '02.001.070.5551-1', medidorAsignado: 'US-1141', estado: 'Activo' }
];

async function poblar() {
  console.log('Iniciando poblado de datos...');
  for (const item of datos) {
    // 1. Crear o actualizar el cliente
    const cliente = await prisma.cliente.upsert({
      where: { cedula: item.cedula },
      update: {
        nombre: item.nombre,
        direccion: item.direccion
      },
      create: {
        nombre: item.nombre,
        cedula: item.cedula,
        direccion: item.direccion
      }
    });

    // 2. Crear o actualizar el medidor asociado al cliente
    await prisma.medidor.upsert({
      where: { codigo: item.medidorAsignado },
      update: {
        estado: item.estado,
        clienteId: cliente.id
      },
      create: {
        codigo: item.medidorAsignado,
        estado: item.estado,
        clienteId: cliente.id
      }
    });
  }
  console.log('¡Datos poblados exitosamente!');
}

poblar()
  .catch(e => {
    console.error('Error al poblar datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
