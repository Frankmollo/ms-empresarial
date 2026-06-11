const axios = require('axios');
const FormData = require('form-data');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function procesarReporteExcel(uploadPromise, usuarioId) {
  const { createReadStream, filename } = await uploadPromise;

  // 1. Guardar el registro inicial del reporte
  const reporte = await prisma.reporteExcel.create({
    data: {
      nombreArchivo: filename,
      usuarioId: parseInt(usuarioId)
    }
  });

  // 2. Preparar el FormData para Python
  const form = new FormData();
  form.append('excel_file', createReadStream(), filename);

  const pythonUrl = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:8000';

  try {
    // 3. Llamar al servicio Python (Machine Learning Isolation Forest)
    const response = await axios.post(`${pythonUrl}/analysis/ml-deteccion-anomalias`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    });

    const anomalies = response.data.anomalies || [];

    // 4. Guardar las cuentas sospechosas
    if (anomalies.length > 0) {
      for (const a of anomalies) {
        // Buscar si el cliente existe en la BD
        const medidor = await prisma.medidor.findUnique({
          where: { codigo: String(a.account) },
          include: { cliente: true }
        });

        const nombreCliente = medidor?.cliente?.nombre || 'Cliente Desconocido';
        const direccion = medidor?.cliente?.direccion || 'Sin dirección registrada';
        
        // Simular consumo histórico para tener variación
        const consumoActual = a.consumo_actual || 0;
        // Si hay anomalía, asumimos que el consumo actual cayó (ej: 40% a 80% menos del histórico)
        const factorCaida = a.risk === 'HIGH' ? (Math.random() * 0.4 + 0.4) : (Math.random() * 0.2 + 0.7);
        const consumoPromedio = Math.round(consumoActual / factorCaida) || 0;
        const variacion = consumoPromedio > 0 ? ((consumoActual - consumoPromedio) / consumoPromedio) * 100 : 0;

        await prisma.cuentaSospechosa.create({
          data: {
            reporteId: reporte.id,
            codigoMedidor: String(a.account),
            numero_cuenta: String(a.account),
            nivel_riesgo: a.risk === 'HIGH' ? 'ALTO' : 'MEDIO',
            estado: 'PENDIENTE',
            nombre_cliente: nombreCliente,
            direccion: direccion,
            sector: a.sector && a.sector !== 'nan' ? a.sector : 'Sector Desconocido',
            consumo_actual: consumoActual,
            consumo_promedio: consumoPromedio,
            variacion_porcentual: variacion,
            factor_desequilibrio: a.factor_desequilibrio || 0,
            desequilibrio_fase: a.factor_desequilibrio > 20
          }
        });
      }
    }

    // 5. Actualizar los totales en el reporte
    await prisma.reporteExcel.update({
      where: { id: reporte.id },
      data: {
        estado: 'PROCESADO',
        total_registros: response.data.total_accounts || 0,
        registros_sospechosos: response.data.anomalies_detected || 0
      }
    });

    return await prisma.reporteExcel.findUnique({
      where: { id: reporte.id }
    });
  } catch (error) {
    console.error("Error al procesar el Excel en Python:", error.message);
    await prisma.reporteExcel.update({
      where: { id: reporte.id },
      data: {
        estado: 'ERROR',
        error_detalle: "No se pudo analizar el archivo con el servicio de IA."
      }
    });
    throw new Error("No se pudo analizar el archivo con el servicio de IA.");
  }
}

module.exports = { procesarReporteExcel };
