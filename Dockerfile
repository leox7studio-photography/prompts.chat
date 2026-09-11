# Multi-stage build to separate build and runtime

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:24-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci --only=production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY src ./src
COPY public ./public
COPY next.config.* ./

# Generate Prisma Client
RUN npm run db:generate

# Build Next.js app
# NOTE: We only run: prisma generate && next build
# Migrations will run at runtime via entrypoint.sh
RUN npm run build

# ============================================
# Stage 3: Runtime
# ============================================
FROM node:24-alpine AS runtime

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built app from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to run entrypoint
ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
