FROM node:alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build:server && npm run build:prod && rm -rf **/*.tsbuildinfo

FROM node:alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/views ./views
COPY --from=builder /app/www ./www
USER node
CMD node .