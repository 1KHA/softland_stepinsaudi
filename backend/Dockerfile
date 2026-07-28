FROM node:20-slim

# openssl is required by Prisma's query engine
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# db push is idempotent: creates/syncs tables on first boot, no-op afterwards
CMD ["sh", "-c", "npx prisma db push --skip-generate && node server.js"]
