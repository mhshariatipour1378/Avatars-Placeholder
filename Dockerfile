# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install build dependencies for canvas package and performance optimizations
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake \
    pkgconfig \
    pixman-dev \
    build-base \
    # Additional dependencies for performance monitoring
    procps \
    # For better compression support
    zlib-dev

COPY back-end/package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy source code
COPY back-end/ ./

# Build TypeScript to JavaScript
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies for canvas and performance monitoring
RUN apk add --no-cache \
    cairo \
    jpeg \
    giflib \
    pango \
    pixman \
    # Runtime monitoring tools
    procps \
    # Compression libraries
    zlib

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/images ./images
COPY --from=builder --chown=nextjs:nodejs /app/static ./static

# Copy only production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create cache directories with proper permissions
RUN mkdir -p /app/cache && chown -R nextjs:nodejs /app/cache

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check with enhanced monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
    if (res.statusCode === 200) { \
      let data = ''; \
      res.on('data', chunk => data += chunk); \
      res.on('end', () => { \
        try { \
          const health = JSON.parse(data); \
          if (health.memory && health.memory.heapUsed > 500000000) { \
            console.log('High memory usage detected'); \
            process.exit(1); \
          } \
          process.exit(0); \
        } catch (e) { \
          process.exit(0); \
        } \
      }); \
    } else { \
      process.exit(1); \
    } \
  })" || exit 1

# Start the application with performance optimizations
CMD ["node", "--max-old-space-size=512", "dist/server.js"] 