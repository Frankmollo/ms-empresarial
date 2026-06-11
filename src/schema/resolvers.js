const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GraphQLUpload } = require('graphql-upload');
const { procesarReporteExcel } = require('../services/excel.service');

const resolvers = {
  Upload: GraphQLUpload,
  ReporteExcel: {
    nombre_archivo: (parent) => parent.nombreArchivo,
    fecha_carga: (parent) => parent.fechaSubida ? parent.fechaSubida.toISOString() : null,
    usuario_carga: async (parent, _, { prisma }) => {
      const u = await prisma.usuarioAdministrativo.findUnique({ where: { id: parent.usuarioId }});
      return u ? u.nombre : "Desconocido";
    },
    createdAt: (parent) => parent.fechaSubida ? parent.fechaSubida.toISOString() : null,
    cuentas: async (parent, _, { prisma }) => {
      return prisma.cuentaSospechosa.findMany({ where: { reporteId: parent.id } });
    }
  },

  UsuarioAdministrativo: {
    distritos: async (parent, _, { prisma }) => {
      const asignaciones = await prisma.asignacionDistrito.findMany({
        where: { usuarioId: parent.id },
        include: { distrito: true }
      });
      return asignaciones.map(a => a.distrito);
    }
  },
  CuentaSospechosa: {
    createdAt: (parent) => parent.createdAt ? parent.createdAt.toISOString() : null,
    expediente: async (parent, _, { prisma }) => {
      const exps = await prisma.expediente.findMany({ where: { cuentaId: parent.id } });
      return exps[0] || null;
    },
    reporte: async (parent, _, { prisma }) => {
      return prisma.reporteExcel.findUnique({ where: { id: parent.reporteId } });
    }
  },

  Expediente: {
    cuenta: async (parent, _, { prisma }) => {
      if (!parent.cuentaId) return null;
      return prisma.cuentaSospechosa.findUnique({ where: { id: parent.cuentaId } });
    },
    bitacora: async (parent, _, { prisma }) => {
      return prisma.bitacoraExpediente.findMany({ where: { expedienteId: parent.id }, orderBy: { fechaRegistro: 'desc' } });
    }
  },
  Query: {
    clientes: async (_, __, { prisma }) => prisma.cliente.findMany({ include: { medidores: true } }),
    cliente: async (_, { id }, { prisma }) => prisma.cliente.findUnique({ where: { id: parseInt(id) }, include: { medidores: true } }),
    medidores: async (_, __, { prisma }) => prisma.medidor.findMany({ include: { cliente: true } }),
    medidor: async (_, { id }, { prisma }) => prisma.medidor.findUnique({ where: { id: parseInt(id) }, include: { cliente: true } }),
    medidoresPorCliente: async (_, { clienteId }, { prisma }) => prisma.medidor.findMany({ where: { clienteId: parseInt(clienteId) }, include: { cliente: true } }),
    clientePorMedidor: async (_, { codigo }, { prisma }) => {
      const raw = String(codigo || '').trim();
      if (!raw) return null;
      const sinPrefijo = raw.replace(/^MED-/i, '');
      const variantes = [...new Set([raw, `MED-${raw}`, sinPrefijo, `MED-${sinPrefijo}`])];
      for (const v of variantes) {
        const medidor = await prisma.medidor.findUnique({ where: { codigo: v }, include: { cliente: { include: { medidores: true } } } });
        if (medidor?.cliente) return medidor.cliente;
      }
      return null;
    },
    buscarGlobal: async (_, { termino }, { prisma }) => {
      if (!termino || termino.trim().length === 0) return [];
      const search = termino.trim();
      return prisma.cliente.findMany({
        where: {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { cedula: { contains: search, mode: 'insensitive' } },
            { medidores: { some: { codigo: { contains: search, mode: 'insensitive' } } } }
          ]
        },
        include: { medidores: true },
        take: 10
      });
    },
    buscarConIA: async (_, { pregunta }, { prisma }) => {
      try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("No se ha configurado GROQ_API_KEY en ms-gestion-empresarial");

        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey });

        const clientes = await prisma.cliente.findMany({ include: { medidores: true } });
        const contextoPrisma = clientes.map(c => ({
          nombre: c.nombre,
          cedula: c.cedula,
          medidores: c.medidores.map(m => m.codigo + ' (' + m.estado + ')')
        }));

        const systemPrompt = `
          Eres el Copiloto Inteligente del sistema ERP Los Tres.
          Te proporcionaré un contexto de la base de datos de los clientes y sus medidores.
          Usa estrictamente esta información para responder a las preguntas del usuario.
          Responde de manera ejecutiva, clara y al grano en español.
        `;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Contexto BD: ${JSON.stringify(contextoPrisma, null, 2)}\n\nPregunta: ${pregunta}` }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
        });

        return chatCompletion.choices[0]?.message?.content || "No se generó respuesta.";
      } catch (error) {
        console.error("Error en buscarConIA:", error);
        return "Hubo un error interno al comunicarse con Groq API: " + error.message;
      }
    },
    usuariosAdministrativos: async (_, __, { prisma }) => prisma.usuarioAdministrativo.findMany(),
    distritos: async (_, __, { prisma }) => prisma.distrito.findMany(),
    dashboardStats: async (_, __, { prisma }) => {
      const totalClientes = await prisma.cliente.count();
      const totalMedidores = await prisma.medidor.count();
      const medidoresActivos = await prisma.medidor.count({ where: { estado: 'Activo' } });
      const totalUsuarios = await prisma.usuarioAdministrativo.count();
      
      const total_reportes = await prisma.reporteExcel.count();
      const total_cuentas_sospechosas = await prisma.cuentaSospechosa.count();
      const total_expedientes = await prisma.expediente.count();
      const expedientes_abiertos = await prisma.expediente.count({ where: { estado: 'ABIERTO' } });
      const expedientes_confirmados = await prisma.expediente.count({ where: { estado: 'CONFIRMADO' } });

      const reportes = await prisma.reporteExcel.findMany();
      let total_registros_analizados = 0;
      for (const r of reportes) {
        total_registros_analizados += r.total_registros || 0;
      }

      const expedientesAll = await prisma.expediente.findMany();
      let energia_desviada_kwh = 0;
      let monto_recuperado = 0;
      for (const e of expedientesAll) {
        energia_desviada_kwh += e.energia_sustraida_kwh || 0;
        monto_recuperado += e.monto_recuperar || 0;
      }

      return {
        totalClientes, totalMedidores, medidoresActivos, totalUsuarios,
        total_reportes, 
        total_registros_analizados,
        total_sospechosos_detectados: total_cuentas_sospechosas,
        total_cuentas_sospechosas, 
        total_expedientes,
        expedientes_abiertos, expedientes_confirmados,
        energia_desviada_kwh, 
        energia_recuperada_kwh: energia_desviada_kwh, 
        monto_recuperado
      };
    },
    // Hurtos Queries
    cuentasSospechosas: async (_, { filtro, pagina = 1, por_pagina = 20 }, { prisma }) => {
      const where = {};
      if (filtro?.estado) where.estado = filtro.estado;
      if (filtro?.nivel_riesgo) where.nivel_riesgo = filtro.nivel_riesgo;
      
      const total = await prisma.cuentaSospechosa.count({ where });
      const data = await prisma.cuentaSospechosa.findMany({
        where,
        skip: (pagina - 1) * por_pagina,
        take: por_pagina,
        orderBy: { createdAt: 'desc' }
      });
      return { total, pagina, por_pagina, data };
    },
    cuentasConDesequilibrio: async (_, { reporte_id }, { prisma }) => {
      return prisma.cuentaSospechosa.findMany({
        where: { desequilibrio_fase: true, ...(reporte_id && { reporteId: parseInt(reporte_id) }) }
      });
    },
    expedientes: async (_, { filtro, pagina = 1, por_pagina = 20 }, { prisma }) => {
      const where = {};
      if (filtro?.estado) where.estado = filtro.estado;
      if (filtro?.prioridad) where.prioridad = filtro.prioridad;
      if (filtro?.tecnico) where.tecnico_asignado = filtro.tecnico;
      
      if (filtro?.solo_jornada_activa) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        where.OR = [
          { estado: { not: 'CERRADO' } },
          { fecha_cierre: { gte: hoy } }
        ];
      }

      const total = await prisma.expediente.count({ where });
      const data = await prisma.expediente.findMany({
        where,
        skip: (pagina - 1) * por_pagina,
        take: por_pagina,
        orderBy: { createdAt: 'desc' }
      });
      return { total, pagina, por_pagina, data };
    },
    expediente: async (_, { id }, { prisma }) => prisma.expediente.findUnique({ where: { id: parseInt(id) } }),
    reportesExcel: async (_, __, { prisma }) => prisma.reporteExcel.findMany({ orderBy: { fechaSubida: 'desc' } }),
    reporteExcel: async (_, { id }, { prisma }) => prisma.reporteExcel.findUnique({ where: { id: parseInt(id) }, include: { cuentasAnomalas: true } }),
    reportesEstadisticos: async (_, __, { prisma }) => prisma.reporteEstadistico.findMany({ orderBy: { createdAt: 'desc' } }),
    estadisticasTecnico: async (_, { tecnico, mes, anio }, { prisma }) => {
      const startOfMonth = new Date(anio || new Date().getFullYear(), (mes || new Date().getMonth() + 1) - 1, 1);
      const endOfMonth = new Date(anio || new Date().getFullYear(), mes || new Date().getMonth() + 1, 0, 23, 59, 59, 999);
      
      const expedientesMes = await prisma.expediente.findMany({
        where: {
          tecnico_asignado: tecnico,
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      });
      
      const asignados = expedientesMes.length;
      const urgentes = expedientesMes.filter(e => e.prioridad === 'ALTA' || e.prioridad === 'URGENTE').length;
      const inspecciones_realizadas = await prisma.expediente.count({
        where: {
          tecnico_asignado: tecnico,
          estado: { in: ['INSPECCION_REALIZADA', 'CERRADO'] },
          fecha_inspeccion: { gte: startOfMonth, lte: endOfMonth }
        }
      });
      
      const ultimo = await prisma.expediente.findFirst({
        where: { tecnico_asignado: tecnico, estado: 'CERRADO' },
        orderBy: { fecha_cierre: 'desc' }
      });

      return {
        mes: `${anio || new Date().getFullYear()}-${String(mes || new Date().getMonth() + 1).padStart(2, '0')}`,
        asignados,
        urgentes,
        inspecciones_realizadas,
        ultimo_cierre: ultimo?.fecha_cierre ? ultimo.fecha_cierre.toISOString() : null
      };
    }
  },
  Mutation: {
    login: async (_, { correo, password }, { prisma }) => {
      const usuario = await prisma.usuarioAdministrativo.findUnique({ where: { correo } });
      if (!usuario) throw new Error('Usuario no encontrado');
      const valid = await bcrypt.compare(password, usuario.password);
      if (!valid) throw new Error('Contraseña incorrecta');
      const token = jwt.sign({ userId: usuario.id, rol: usuario.rol }, 'super-secret-key-empresarial-123', { expiresIn: '8h' });
      return { token, usuario };
    },
    asignarRolDistrito: async (_, { usuarioId, distritoId }, { prisma }) => {
      await prisma.asignacionDistrito.upsert({
        where: { usuarioId_distritoId: { usuarioId, distritoId } },
        update: {}, create: { usuarioId, distritoId }
      });
      return prisma.usuarioAdministrativo.findUnique({ where: { id: usuarioId } });
    },
    crearUsuarioAdministrativo: async (_, { nombre, correo, password, rol }, { prisma }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return prisma.usuarioAdministrativo.create({ data: { nombre, correo, password: hashedPassword, rol } });
    },
    
    cargarReporteExcel: async (_, { archivo, periodo, usuario }, { prisma }) => {
      const { procesarReporteExcel } = require('../services/excel.service');
      const usuarioId = 1; // ID de usuario por defecto
      return procesarReporteExcel(archivo, usuarioId, periodo);
    },
    actualizarEstadoCuenta: async (_, { id, estado, usuario }, { prisma }) => {
      return prisma.cuentaSospechosa.update({
        where: { id: parseInt(id) },
        data: { estado }
      });
    },
    exportarCuentas: async (_, { ids, formato }, { prisma }) => {
      return "URL_DE_DESCARGA_FICTICIA";
    },
    crearExpediente: async (_, { input }, { prisma }) => {
      const cuenta = await prisma.cuentaSospechosa.findUnique({ where: { id: parseInt(input.cuenta_id) } });
      const expediente = await prisma.expediente.create({
        data: {
          codigoExpediente: `EXP-${Date.now()}`,
          cuentaId: parseInt(input.cuenta_id),
          tipo_irregularidad: input.tipo_irregularidad,
          prioridad: input.prioridad || 'MEDIA',
          observaciones: input.observaciones,
          tecnico_asignado: input.tecnico_asignado,
          usuarioId: 1, // default usuario
          numero_cuenta: cuenta.numero_cuenta,
          nombre_cliente: cuenta.nombre_cliente,
          direccion: cuenta.direccion,
          sector: cuenta.sector
        }
      });
      await prisma.cuentaSospechosa.update({
        where: { id: parseInt(input.cuenta_id) },
        data: { estado: 'EXPEDIENTE_CREADO' }
      });
      return expediente;
    },
    actualizarExpediente: async (_, { id, input }, { prisma }) => {
      return prisma.expediente.update({
        where: { id: parseInt(id) },
        data: {
          estado: input.estado,
          prioridad: input.prioridad,
          observaciones: input.observaciones,
          tecnico_asignado: input.tecnico_asignado,
          ubicacion_tecnico_lat: input.ubicacion_tecnico_lat,
          ubicacion_tecnico_lng: input.ubicacion_tecnico_lng,
          ubicacion_tecnico_fecha: input.ubicacion_tecnico_lat ? new Date() : undefined
        }
      });
    },
    cerrarExpediente: async (_, { id, observaciones, usuario, ubicacion_tecnico_lat, ubicacion_tecnico_lng }, { prisma }) => {
      return prisma.expediente.update({
        where: { id: parseInt(id) },
        data: { 
          estado: 'CERRADO', 
          observaciones, 
          fecha_cierre: new Date(),
          ubicacion_tecnico_lat,
          ubicacion_tecnico_lng,
          ubicacion_tecnico_fecha: ubicacion_tecnico_lat ? new Date() : undefined
        }
      });
    },
    generarReporteEstadistico: async (_, { input }, { prisma }) => {
      const fInicio = new Date(input.periodo_inicio);
      const fFin = new Date(input.periodo_fin);
      fFin.setHours(23, 59, 59, 999);

      const total_cuentas_analizadas = await prisma.cuentaSospechosa.count({ where: { createdAt: { gte: fInicio, lte: fFin } } });
      const total_sospechosas = await prisma.cuentaSospechosa.count({ where: { createdAt: { gte: fInicio, lte: fFin }, nivel_riesgo: { in: ['ALTO', 'CRITICO'] } } });
      const total_expedientes = await prisma.expediente.count({ where: { createdAt: { gte: fInicio, lte: fFin } } });
      const expedientes_confirmados = await prisma.expediente.count({ where: { createdAt: { gte: fInicio, lte: fFin }, estado: 'CONFIRMADO' } });
      
      const expedientesRecuperados = await prisma.expediente.findMany({ where: { createdAt: { gte: fInicio, lte: fFin }, estado: 'CERRADO' } });
      let energia_recuperada_kwh = 0;
      let monto_recuperado = 0;
      for (const e of expedientesRecuperados) {
        energia_recuperada_kwh += e.energia_sustraida_kwh || 0;
        monto_recuperado += e.monto_recuperar || 0;
      }

      const cuentasAlto = await prisma.cuentaSospechosa.count({ where: { createdAt: { gte: fInicio, lte: fFin }, nivel_riesgo: 'ALTO' } });
      const cuentasCritico = await prisma.cuentaSospechosa.count({ where: { createdAt: { gte: fInicio, lte: fFin }, nivel_riesgo: 'CRITICO' } });
      const cuentasMedio = await prisma.cuentaSospechosa.count({ where: { createdAt: { gte: fInicio, lte: fFin }, nivel_riesgo: 'MEDIO' } });
      const cuentasBajo = await prisma.cuentaSospechosa.count({ where: { createdAt: { gte: fInicio, lte: fFin }, nivel_riesgo: 'BAJO' } });

      const expsAgrupados = await prisma.expediente.groupBy({
        by: ['estado'],
        where: { createdAt: { gte: fInicio, lte: fFin } },
        _count: { estado: true }
      });
      const tiposAgrupados = await prisma.expediente.groupBy({
        by: ['tipo_irregularidad'],
        where: { createdAt: { gte: fInicio, lte: fFin } },
        _count: { tipo_irregularidad: true }
      });

      const desgloseJSON = JSON.stringify({
        detalle: {
          cuentas_por_riesgo: [
            { nivel_riesgo: 'CRITICO', count: cuentasCritico },
            { nivel_riesgo: 'ALTO', count: cuentasAlto },
            { nivel_riesgo: 'MEDIO', count: cuentasMedio },
            { nivel_riesgo: 'BAJO', count: cuentasBajo },
          ],
          expedientes_por_estado: expsAgrupados.map(e => ({ estado: e.estado, count: e._count.estado })),
          expedientes_por_tipo: tiposAgrupados.map(t => ({ tipo_irregularidad: t.tipo_irregularidad, count: t._count.tipo_irregularidad }))
        }
      });

      return prisma.reporteEstadistico.create({
        data: {
          tipo: input.tipo,
          periodo_inicio: input.periodo_inicio,
          periodo_fin: input.periodo_fin,
          generado_por: input.generado_por,
          total_cuentas_analizadas,
          total_sospechosas,
          total_expedientes,
          expedientes_confirmados,
          energia_recuperada_kwh,
          monto_recuperado,
          datos_json: desgloseJSON
        }
      });
    },
    agregarBitacora: async (_, { expediente_id, accion, descripcion, usuario }, { prisma }) => {
      return prisma.bitacoraExpediente.create({
        data: {
          expedienteId: parseInt(expediente_id),
          accion,
          detalles: descripcion,
          usuario
        }
      });
    },
    redactarExpedienteIA: async (_, { expediente_id, tipoDocumento }, { prisma }) => {
      return "Borrador generado por IA...";
    },
    cerrarJornadaTecnico: async (_, { tecnico, usuario }, { prisma }) => {
      const { count: realizadas_en_cierre } = await prisma.expediente.updateMany({
        where: {
          tecnico_asignado: tecnico,
          estado: 'INSPECCION_REALIZADA'
        },
        data: {
          estado: 'CERRADO',
          fecha_cierre: new Date()
        }
      });
      
      const res = await resolvers.Query.estadisticasTecnico(null, { tecnico }, { prisma });
      return { ...res, realizadas_en_cierre };
    },
    registrarEvidenciaBlockchain: async (_, { documentId, docHash }) => {
      const blockchainService = require('../services/blockchain.service');
      const txHash = await blockchainService.registrarEvidencia(documentId, docHash);
      return txHash;
    },
    subirFotoEvidencia: async (_, { archivo, documentId }) => {
      const { createReadStream, filename } = await archivo;
      const crypto = require('crypto');
      const fs = require('fs');
      const path = require('path');
      
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, `${documentId}-${filename}`);
      const stream = createReadStream();
      const hash = crypto.createHash('sha256');

      return new Promise((resolve, reject) => {
        const outStream = fs.createWriteStream(filePath);
        stream.pipe(outStream);
        
        stream.on('data', (chunk) => {
          hash.update(chunk);
        });

        outStream.on('finish', async () => {
          const fileHash = hash.digest('hex');
          console.log(`[Upload] Foto guardada en: ${filePath}`);
          
          try {
            // 1. Llamar a la Inteligencia Artificial (Python)
            console.log(`[Upload] Verificando firma con IA...`);
            const axios = require('axios');
            const FormData = require('form-data');
            const form = new FormData();
            form.append('file', fs.createReadStream(filePath));
            
            const aiResponse = await axios.post('http://host.docker.internal:5000/predict/signature', form, {
              headers: form.getHeaders()
            });

            if (aiResponse.data.prediction !== "DOCUMENTO_FIRMADO") {
              console.error("❌ La IA rechazó el documento: No tiene firma.");
              return reject(new Error(`La Inteligencia Artificial ha rechazado la evidencia: No se detecta firma (Confianza: ${aiResponse.data.confidence})`));
            }

            console.log(`✅ IA aprobó el documento (Confianza: ${aiResponse.data.confidence})`);
            console.log(`[Upload] Hash SHA-256 a grabar: ${fileHash}`);

            // 2. Grabar en Blockchain
            const blockchainService = require('../services/blockchain.service');
            const txHash = await blockchainService.registrarEvidencia(documentId, fileHash);
            resolve(txHash);
          } catch (err) {
            console.error("Error validando/registrando evidencia:", err.message);
            reject(new Error(err.message));
          }
        });

        outStream.on('error', reject);
        stream.on('error', reject);
      });
    }
  }
};

module.exports = { resolvers };
