const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Distrito {
    id: ID!
    nombre: String!
  }

  type UsuarioAdministrativo {
    id: ID!
    nombre: String!
    correo: String!
    rol: String!
    distritos: [Distrito!]
  }

  type AuthPayload {
    token: String!
    usuario: UsuarioAdministrativo!
  }

  type Cliente {
    id: ID!
    nombre: String!
    cedula: String
    direccion: String
    medidores: [Medidor!]
  }

  type Medidor {
    id: ID!
    codigo: String!
    tipo: String
    estado: String
    clienteId: Int!
    cliente: Cliente
  }

  type DashboardStats {
    totalClientes: Int!
    totalMedidores: Int!
    medidoresActivos: Int!
    totalUsuarios: Int!
  }

  type Query {
    clientes: [Cliente!]!
    cliente(id: ID!): Cliente
    medidores: [Medidor!]!
    medidor(id: ID!): Medidor
    medidoresPorCliente(clienteId: ID!): [Medidor!]!
    
    # Consultas para el CU-1
    usuariosAdministrativos: [UsuarioAdministrativo!]!
    distritos: [Distrito!]!
    
    # Búsqueda Global (CU-15)
    buscarGlobal(termino: String!): [Cliente!]!
    
    # Búsqueda con Lenguaje Natural (Gemini AI)
    buscarConIA(pregunta: String!): String!
    
    # Dashboard
    dashboardStats: DashboardStats!
  }

  type Mutation {
    # CU-1: Gestionar AdministradorFraudes
    login(correo: String!, password: String!): AuthPayload!
    asignarRolDistrito(usuarioId: Int!, distritoId: Int!): UsuarioAdministrativo!
    crearUsuarioAdministrativo(nombre: String!, correo: String!, password: String!, rol: String!): UsuarioAdministrativo!
  }
`;

module.exports = { typeDefs };
