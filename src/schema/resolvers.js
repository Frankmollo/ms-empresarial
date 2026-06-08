const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const resolvers = {
  UsuarioAdministrativo: {
    distritos: async (parent, _, { prisma }) => {
      const asignaciones = await prisma.asignacionDistrito.findMany({
        where: { usuarioId: parent.id },
        include: { distrito: true }
      });
      return asignaciones.map(a => a.distrito);
    }
  },
  Query: {
    clientes: async (_, __, { prisma }) => {
      return prisma.cliente.findMany({ include: { medidores: true } });
    },
    cliente: async (_, { id }, { prisma }) => {
      return prisma.cliente.findUnique({
        where: { id: parseInt(id) },
        include: { medidores: true }
      });
    },
    medidores: async (_, __, { prisma }) => {
      return prisma.medidor.findMany({ include: { cliente: true } });
    },
    medidor: async (_, { id }, { prisma }) => {
      return prisma.medidor.findUnique({
        where: { id: parseInt(id) },
        include: { cliente: true }
      });
    },
    medidoresPorCliente: async (_, { clienteId }, { prisma }) => {
      return prisma.medidor.findMany({
        where: { clienteId: parseInt(clienteId) },
        include: { cliente: true }
      });
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

        // Extraer contexto de la BD para inyectarlo en el prompt
        // (Nota: En un entorno real enorme, se haría Agentic RAG o embeddings, aquí pasamos un extracto directo)
        const clientes = await prisma.cliente.findMany({
          include: { medidores: true }
        });
        
        const contextoPrisma = clientes.map(c => ({
          nombre: c.nombre,
          cedula: c.cedula,
          medidores: c.medidores.map(m => m.codigo + ' (' + m.estado + ')')
        }));

        const systemPrompt = `
          Eres el Analista de Fraude Senior e Inteligencia Artificial del sistema de Los Tres.
          Te proporcionaré un contexto de la base de datos de los clientes y sus medidores.
          Usa estrictamente esta información para responder a las preguntas del usuario.
          Responde de manera ejecutiva, clara y al grano.
        `;

        try {
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
          console.error("Error comunicándose con Groq API:", error);
          return "Hubo un error interno al comunicarse con Groq API: " + error.message;
        }
      } catch (error) {
        console.error("Error en buscarConIA:", error);
        return "Hubo un error interno al comunicarse con Groq API: " + error.message;
      }
    },
    usuariosAdministrativos: async (_, __, { prisma }) => {
      return prisma.usuarioAdministrativo.findMany();
    },
    distritos: async (_, __, { prisma }) => {
      return prisma.distrito.findMany();
    },
    dashboardStats: async (_, __, { prisma }) => {
      const totalClientes = await prisma.cliente.count();
      const totalMedidores = await prisma.medidor.count();
      const medidoresActivos = await prisma.medidor.count({ where: { estado: 'Activo' } });
      const totalUsuarios = await prisma.usuarioAdministrativo.count();
      return {
        totalClientes,
        totalMedidores,
        medidoresActivos,
        totalUsuarios
      };
    }
  },
  Mutation: {
    login: async (_, { correo, password }, { prisma }) => {
      const usuario = await prisma.usuarioAdministrativo.findUnique({ where: { correo } });
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      const valid = await bcrypt.compare(password, usuario.password);
      if (!valid) {
        throw new Error('Contraseña incorrecta');
      }
      
      const token = jwt.sign(
        { userId: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET || 'super-secret-key-empresarial-123',
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );
      
      return {
        token,
        usuario
      };
    },
    asignarRolDistrito: async (_, { usuarioId, distritoId }, { prisma }) => {
      await prisma.asignacionDistrito.upsert({
        where: {
          usuarioId_distritoId: {
            usuarioId,
            distritoId
          }
        },
        update: {},
        create: {
          usuarioId,
          distritoId
        }
      });
      
      return prisma.usuarioAdministrativo.findUnique({
        where: { id: usuarioId }
      });
    },
    crearUsuarioAdministrativo: async (_, { nombre, correo, password, rol }, { prisma }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return prisma.usuarioAdministrativo.create({
        data: {
          nombre,
          correo,
          password: hashedPassword,
          rol
        }
      });
    }
  }
};

module.exports = { resolvers };
