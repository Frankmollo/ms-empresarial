const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const { typeDefs } = require('./schema/typeDefs');
const { resolvers } = require('./schema/resolvers');
const { PrismaClient } = require('@prisma/client');

const { createProxyMiddleware } = require('http-proxy-middleware');

const prisma = new PrismaClient();
const app = express();

app.use('/api/dms', createProxyMiddleware({ target: 'http://host.docker.internal:8081', changeOrigin: true, pathRewrite: (path, req) => req.originalUrl.replace('/api/dms', '/api') }));
app.use('/api/s3', createProxyMiddleware({ target: 'http://host.docker.internal:4566', changeOrigin: true, pathRewrite: (path, req) => req.originalUrl.replace('/api/s3', '') }));

app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

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
