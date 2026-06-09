# 🐳 Docker Configuration

## Docker Compose (Desenvolvimento)

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://squalion:squalion@postgres:5432/squalionlink
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - JWT_SECRET=your-jwt-secret-here
      - JWT_EXPIRES_IN=24h
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./src:/app/src
    command: npm run dev

  worker:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://squalion:squalion@postgres:5432/squalionlink
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    command: npm run worker

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=squalion
      - POSTGRES_PASSWORD=squalion
      - POSTGRES_DB=squalionlink
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - miniodata:/data
    command: server /data --console-address ":9001"

  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@squalion.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    depends_on:
      - postgres

volumes:
  pgdata:
  redisdata:
  miniodata:
```

## Dockerfile (Backend)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## Comandos

```bash
# Subir tudo
docker compose up -d

# Ver logs
docker compose logs -f api

# Rodar migrations
docker compose exec api npm run migrate

# Rodar seeds
docker compose exec api npm run seed

# Parar tudo
docker compose down

# Limpar volumes (CUIDADO: apaga dados)
docker compose down -v
```

## Produção

Para produção, usar:
- **PostgreSQL**: RDS (AWS) ou Cloud SQL (GCP) ou Azure Database
- **Redis**: ElastiCache ou Upstash
- **Storage**: S3 direto (sem MinIO)
- **API**: ECS Fargate ou Kubernetes
- **CI/CD**: GitHub Actions → build image → push ECR → deploy ECS
```
