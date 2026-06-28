# -- Stage 1: Build --
    FROM node:22-alpine AS builder
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    # -- Stage 2: Runtime --
    FROM node:22-slim
    WORKDIR /app
    
    COPY --from=builder /app/.output /app/.output
    COPY --from=builder /app/server/data /app/server/data
    COPY --from=builder /app/server/seed.ts /app/server/seed.ts
    
    EXPOSE 3000
    
    ENV NITRO_HOST=0.0.0.0
    ENV NITRO_PORT=3000
    
    CMD ["node", ".output/server/index.mjs"]