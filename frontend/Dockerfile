# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências aproveitando cache de camadas
COPY package*.json ./
RUN npm ci

# Copia código-fonte e compila bundle de produção
COPY . .
RUN npm run build

# Stage 2: Hardened Nginx Web Server
FROM nginx:1.27-alpine AS production

# Remove configuração padrão
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copia bundle estático e configuração otimizada do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
