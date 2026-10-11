# Build stage: compile the API and bundle the React dashboard.
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:server:emit && npm run build:client

# Runtime stage: only production dependencies and compiled assets.
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist-server ./dist-server
COPY --from=builder --chown=node:node /app/client/dist ./client/dist

RUN mkdir -p /app/data_store && chown -R node:node /app
USER node

EXPOSE 3001
CMD ["node", "dist-server/index.js"]
