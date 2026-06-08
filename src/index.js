const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./schema/typeDefs');
const { resolvers } = require('./schema/resolvers');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ prisma })
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ERP (Gestión Empresarial) listo en http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error("Error al iniciar el servidor", err);
});
