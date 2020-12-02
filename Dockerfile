FROM node:alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build:prod
RUN npm run build:server

FROM node:alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/www ./www
COPY package* ./
COPY nest-cli.json ./
COPY tsconfig* ./
COPY *.env ./
RUN npm ci --production
CMD node .