# Docker Setup for Avatars Placeholder

This document explains how to use Docker to run the Avatars Placeholder service.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Production Mode

1. **Build and run the production container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the service:**
   - Main service: http://localhost:3000
   - Health check: http://localhost:3000/health
   - API endpoints: http://localhost:3000/api

### Development Mode

1. **Run in development mode with hot reload:**
   ```bash
   docker-compose --profile dev up --build
   ```

2. **Access the development service:**
   - Development service: http://localhost:3001
   - Health check: http://localhost:3001/health

## Docker Images

### Production Image (`Dockerfile`)
- Multi-stage build for optimized image size
- Uses Node.js 18 Alpine for security and size
- Runs as non-root user for security
- Includes health checks
- Production-optimized with only necessary dependencies

### Development Image (`Dockerfile.dev`)
- Single-stage build for faster development
- Includes all dependencies (including dev dependencies)
- Hot reload with nodemon
- Volume mounting for live code changes

## Environment Variables

Copy `env.example` to `.env` and configure as needed:

```bash
cp env.example .env
```

### Available Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (production/development)
- `MODE`: Application mode (prod/dev)
- `IMG_START_INDEX`: Starting index for avatar images
- `IMG_END_INDEX`: Ending index for avatar images
- `IMG_BOY_START_INDEX`: Starting index for boy avatars
- `IMG_BOY_END_INDEX`: Ending index for boy avatars
- `IMG_GIRL_START_INDEX`: Starting index for girl avatars
- `IMG_GIRL_END_INDEX`: Ending index for girl avatars
- `AVATAR_PUBLIC_NAME`: Avatar file name prefix
- `AVATAR_FORAMT_FILE`: Avatar file extension
- `UPLOAD_DIR`: Directory containing avatar images

## Docker Commands

### Basic Commands

```bash
# Build and start services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f avatars-placeholder
```

### Development Commands

```bash
# Start development environment
docker-compose --profile dev up --build

# Rebuild development container
docker-compose --profile dev build --no-cache

# Access development container shell
docker-compose --profile dev exec avatars-placeholder-dev sh
```

### Production Commands

```bash
# Build production image
docker build -t avatars-placeholder:latest .

# Run production container
docker run -p 3000:3000 avatars-placeholder:latest

# Run with custom environment
docker run -p 3000:3000 -e PORT=8080 avatars-placeholder:latest
```

## Volume Mounts

The Docker setup includes volume mounts for:

- **Images directory**: `./back-end/images:/app/images:ro`
  - Allows updating avatar images without rebuilding the container
  - Read-only mount for security

- **Static files**: `./back-end/static:/app/static:ro`
  - Allows updating static assets without rebuilding
  - Read-only mount for security

## Health Checks

The production container includes health checks that:

- Check the `/health` endpoint every 30 seconds
- Timeout after 3 seconds
- Retry up to 3 times
- Start checking after 5 seconds

You can check container health with:
```bash
docker-compose ps
```

## API Endpoints

### Health Check
- `GET /health` - Returns service status and uptime

### Public Endpoints
- `GET /public` - Get random avatar
- `GET /public/:id` - Get specific avatar by ID
- `GET /username` - Generate SVG avatar from username

### API Endpoints
- `GET /api` - Get list of all available avatars
- `GET /api/jobs` - Get list of job-based avatars

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Use different port
   docker-compose up -p 3001
   ```

2. **Permission issues with volumes:**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER ./back-end/images
   ```

3. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs avatars-placeholder
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Debugging

```bash
# Access container shell
docker-compose exec avatars-placeholder sh

# Check container resources
docker stats

# Inspect container
docker inspect avatars-placeholder
```

## Security Considerations

- Container runs as non-root user
- Read-only volume mounts for static assets
- Minimal base image (Alpine Linux)
- No sensitive data in image layers
- Health checks for monitoring

## Performance Optimization

- Multi-stage builds reduce image size
- Alpine Linux base for smaller footprint
- Production-only dependencies in final image
- Efficient layer caching
- Optimized TypeScript compilation

## Monitoring

Monitor the service using:

```bash
# Container logs
docker-compose logs -f

# Resource usage
docker stats

# Health status
curl http://localhost:3000/health
``` 