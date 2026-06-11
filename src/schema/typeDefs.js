const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Upload

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
    
    total_reportes: Int
    total_registros_analizados: Int
    total_sospechosos_detectados: Int
    total_cuentas_sospechosas: Int
    total_expedientes: Int
    expedientes_abiertos: Int
    expedientes_confirmados: Int
    energia_desviada_kwh: Float
    energia_recuperada_kwh: Float
    monto_recuperado: Float
    cuentas_por_riesgo: CuentasRiesgo
    expedientes_por_estado: [ExpedientesEstado]
    ultimo_reporte: ReporteExcel
    actividad_reciente: [BitacoraExpediente]
  }

  type CuentasRiesgo {
    bajo: Int
    medio: Int
    alto: Int
    critico: Int
  }

  type ExpedientesEstado {
    estado: String
    cantidad: Int
  }

  type ReporteExcel {
    id: ID!
    nombre_archivo: String!
    fecha_carga: String
    usuario_carga: String
    estado: String
    total_registros: Int
    registros_sospechosos: Int
    periodo: String
    error_detalle: String
    createdAt: String
    cuentas: [CuentaSospechosa!]
  }

  type CuentaSospechosa {
    id: ID!
    reporteId: ID
    codigoMedidor: String
    numero_cuenta: String
    nombre_cliente: String
    direccion: String
    sector: String
    circuito: String
    nivel_riesgo: String
    consumo_promedio: Float
    consumo_actual: Float
    variacion_porcentual: Float
    desequilibrio_fase: Boolean
    factor_desequilibrio: Float
    estado: String
    createdAt: String
    expediente: Expediente
    reporte: ReporteExcel
  }

  type Expediente {
    id: ID!
    codigo: String
    numero_cuenta: String
    nombre_cliente: String
    direccion: String
    sector: String
    tipo_irregularidad: String
    estado: String
    prioridad: String
    fecha_apertura: String
    fecha_inspeccion: String
    fecha_cierre: String
    tecnico_asignado: String
    observaciones: String
    energia_sustraida_kwh: Float
    monto_recuperar: Float
    coordenadas_lat: Float
    coordenadas_lng: Float
    google_maps_url: String
    codigo_catastral: String
    ubicacion_tecnico_lat: Float
    ubicacion_tecnico_lng: Float
    ubicacion_tecnico_fecha: String
    ubicacion_tecnico_maps_url: String
    createdAt: String
    cuenta: CuentaSospechosa
    bitacora: [BitacoraExpediente]
  }

  type BitacoraExpediente {
    id: ID!
    accion: String
    descripcion: String
    usuario: String
    fecha: String
    estado_anterior: String
    estado_nuevo: String
  }

  type ReporteEstadistico {
    id: ID!
    tipo: String
    periodo_inicio: String
    periodo_fin: String
    total_cuentas_analizadas: Int
    total_sospechosas: Int
    total_expedientes: Int
    expedientes_confirmados: Int
    energia_recuperada_kwh: Float
    monto_recuperado: Float
    generado_por: String
    datos_json: String
    createdAt: String
  }

  input FiltroCuentas {
    busqueda: String
    estado: String
    nivel_riesgo: String
  }

  input FiltroExpedientes {
    busqueda: String
    estado: String
    prioridad: String
    tecnico: String
    solo_jornada_activa: Boolean
  }

  input CrearExpedienteInput {
    cuenta_id: ID!
    tipo_irregularidad: String
    prioridad: String
    tecnico_asignado: String
    observaciones: String
    usuario: String
  }

  input ActualizarExpedienteInput {
    estado: String
    prioridad: String
    observaciones: String
    tecnico_asignado: String
    fecha_inspeccion: String
    usuario: String
    ubicacion_tecnico_lat: Float
    ubicacion_tecnico_lng: Float
  }

  input GenerarReporteInput {
    tipo: String!
    periodo_inicio: String!
    periodo_fin: String!
    generado_por: String
  }

  type PaginacionCuentas {
    total: Int
    pagina: Int
    por_pagina: Int
    data: [CuentaSospechosa]
  }

  type PaginacionExpedientes {
    total: Int
    pagina: Int
    por_pagina: Int
    data: [Expediente]
  }

  type Query {
    clientes: [Cliente!]!
    cliente(id: ID!): Cliente
    medidores: [Medidor!]!
    medidor(id: ID!): Medidor
    medidoresPorCliente(clienteId: ID!): [Medidor!]!
    clientePorMedidor(codigo: String!): Cliente
    
    usuariosAdministrativos: [UsuarioAdministrativo!]!
    distritos: [Distrito!]!
    
    buscarGlobal(termino: String!): [Cliente!]!
    buscarConIA(pregunta: String!): String!
    dashboardStats: DashboardStats!

    # Hurtos
    cuentasSospechosas(filtro: FiltroCuentas, pagina: Int, por_pagina: Int): PaginacionCuentas
    cuentasConDesequilibrio(reporte_id: ID): [CuentaSospechosa]
    expedientes(filtro: FiltroExpedientes, pagina: Int, por_pagina: Int): PaginacionExpedientes
    expediente(id: ID!): Expediente
    reportesExcel: [ReporteExcel]
    reporteExcel(id: ID!): ReporteExcel
    reportesEstadisticos: [ReporteEstadistico]
    estadisticasTecnico(tecnico: String!, mes: Int, anio: Int): EstadisticasTecnico
  }

  type EstadisticasTecnico {
    mes: String
    asignados: Int
    urgentes: Int
    inspecciones_realizadas: Int
    ultimo_cierre: String
  }

  type CierreJornadaResultado {
    realizadas_en_cierre: Int
    mes: String
    asignados: Int
    urgentes: Int
    inspecciones_realizadas: Int
    ultimo_cierre: String
  }

  type Mutation {
    login(correo: String!, password: String!): AuthPayload!
    asignarRolDistrito(usuarioId: Int!, distritoId: Int!): UsuarioAdministrativo!
    crearUsuarioAdministrativo(nombre: String!, correo: String!, password: String!, rol: String!): UsuarioAdministrativo!
    
    # Hurtos
    cargarReporteExcel(archivo: Upload!, periodo: String, usuario: String): ReporteExcel
    actualizarEstadoCuenta(id: ID!, estado: String!, usuario: String): CuentaSospechosa
    exportarCuentas(ids: [ID!]!, formato: String): String
    crearExpediente(input: CrearExpedienteInput!): Expediente
    actualizarExpediente(id: ID!, input: ActualizarExpedienteInput!): Expediente
    cerrarExpediente(id: ID!, observaciones: String, usuario: String, ubicacion_tecnico_lat: Float, ubicacion_tecnico_lng: Float): Expediente
    generarReporteEstadistico(input: GenerarReporteInput!): ReporteEstadistico
    agregarBitacora(expediente_id: ID!, accion: String!, descripcion: String, usuario: String): BitacoraExpediente
    redactarExpedienteIA(expediente_id: ID!, tipoDocumento: String): String
    cerrarJornadaTecnico(tecnico: String!, usuario: String): CierreJornadaResultado
    registrarEvidenciaBlockchain(documentId: String!, docHash: String!): String
    subirFotoEvidencia(archivo: Upload!, documentId: String!): String
  }
`;

module.exports = { typeDefs };
