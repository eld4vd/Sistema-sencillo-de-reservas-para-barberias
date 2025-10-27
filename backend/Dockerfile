# Etapa 1: Build
FROM node:22-alpine AS build
WORKDIR /usr/src/app

# Copiar solo los archivos necesarios para las dependencias
COPY package*.json ./

# Instalar dependencias (usa npm ci para builds más reproducibles)
RUN npm ci

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# Etapa 2: Producción (más liviana)
FROM node:22-alpine
WORKDIR /usr/src/app

# Copiar solo lo necesario
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el resultado del build
COPY --from=build /usr/src/app/dist ./dist

# Copiar script de arranque personalizado
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Herramientas necesarias para healthcheck/espera
RUN apk add --no-cache netcat-openbsd


# Configuración del servidor
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
