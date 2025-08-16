# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env
# Assuming uploads are copied from builder or will be a volume (volume mount is already handled by docker-compose)
# Let's remove the COPY for uploads here since docker-compose volume mount will override it anyway.
# If you were NOT using a volume mount, you would keep this line.
# COPY --from=builder /app/uploads ./uploads

# Copy necessary files for 'nest start --watch' in dev environment
COPY --from=builder /app/tsconfig.json ./tsconfig.json # Copy tsconfig.json
COPY --from=builder /app/src ./src # Copy source files for watcher
# Also copy nest-cli.json if nest start command relies on it being present
COPY --from=builder /app/nest-cli.json ./nest-cli.json # Copy nest-cli.json

# Ensure the production CMD runs for production builds, but the docker-compose command overrides it for dev
CMD [ "node", "dist/main" ]
