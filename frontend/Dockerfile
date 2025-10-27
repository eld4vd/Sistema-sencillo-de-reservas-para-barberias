# Etapa 1: Build de la app
FROM node:22-alpine AS build
WORKDIR /app

# Copiar los archivos de dependencias primero (mejor cache)
COPY package*.json ./

# Instalar dependencias (npm ci = reproducible y rápido)
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar la app de producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar los archivos generados al directorio público de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada (si la tienes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puertos HTTP y HTTPS
EXPOSE 80 443

# Mantener Nginx corriendo en primer plano
CMD ["nginx", "-g", "daemon off;"]
