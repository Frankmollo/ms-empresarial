# Usar una imagen oficial de Node.js ligera como base
FROM node:20-slim

# Instalar OpenSSL para compatibilidad con Prisma
RUN apt-get update -y && apt-get install -y openssl

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación (excluyendo lo del .dockerignore)
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Exponer el puerto en el que corre la aplicación (4000)
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["node", "src/index.js"]
