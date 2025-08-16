# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . . # Copies all source files, tsconfig.json, etc. to builder stage

RUN npm run build # Builds the dist/ directory

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./ # Copy package files again for production dependencies
RUN npm ci --only=production # Install only production dependencies

# Copy necessary build outputs and config for running the app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

# The dev command 'nest start --watch' requires tsconfig.json and the source files (src) to be present
# in the production container, even though the production build (CMD node dist/main) doesn't strictly need them.
# Since docker-compose is overriding CMD with a dev command, we must include these.
# IMPORTANT: If you were ONLY running in production mode with docker-compose, you would NOT need to copy tsconfig.json, src, or nest-cli.json here.
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
# If nest-cli.json IS present in your backend root and needed by 'nest start --watch', uncomment this:
# COPY --from=builder /app/nest-cli.json ./nest-cli.json


# Define the default command to run when the container starts (for production mode)
# This will be overridden by the 'command' in docker-compose.yml for development
CMD [ "node", "dist/main" ]
