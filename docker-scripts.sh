#!/bin/bash

# Docker management script for Avatars Placeholder

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build the production Docker image"
    echo "  build-dev   Build the development Docker image"
    echo "  up          Start the production service"
    echo "  up-dev      Start the development service"
    echo "  down        Stop all services"
    echo "  logs        Show logs for production service"
    echo "  logs-dev    Show logs for development service"
    echo "  shell       Access shell in production container"
    echo "  shell-dev   Access shell in development container"
    echo "  restart     Restart production service"
    echo "  restart-dev Restart development service"
    echo "  clean       Remove all containers and images"
    echo "  health      Check service health"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build && $0 up"
    echo "  $0 up-dev"
    echo "  $0 logs -f"
}

# Function to build production image
build_production() {
    print_status "Building production Docker image..."
    docker-compose build avatars-placeholder
    print_success "Production image built successfully!"
}

# Function to build development image
build_development() {
    print_status "Building development Docker image..."
    docker-compose --profile dev build avatars-placeholder-dev
    print_success "Development image built successfully!"
}

# Function to start production service
start_production() {
    print_status "Starting production service..."
    docker-compose up -d avatars-placeholder
    print_success "Production service started!"
    print_status "Service available at: http://localhost:3000"
    print_status "Health check: http://localhost:3000/health"
}

# Function to start development service
start_development() {
    print_status "Starting development service..."
    docker-compose --profile dev up -d avatars-placeholder-dev
    print_success "Development service started!"
    print_status "Service available at: http://localhost:3001"
    print_status "Health check: http://localhost:3001/health"
}

# Function to stop services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped!"
}

# Function to show logs
show_logs() {
    local service=${1:-avatars-placeholder}
    print_status "Showing logs for $service..."
    docker-compose logs -f "$service"
}

# Function to access shell
access_shell() {
    local service=${1:-avatars-placeholder}
    print_status "Accessing shell in $service container..."
    docker-compose exec "$service" sh
}

# Function to restart service
restart_service() {
    local service=${1:-avatars-placeholder}
    print_status "Restarting $service..."
    docker-compose restart "$service"
    print_success "$service restarted!"
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down --rmi all --volumes --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to check health
check_health() {
    local port=${1:-3000}
    print_status "Checking service health at port $port..."
    
    if curl -f -s "http://localhost:$port/health" > /dev/null; then
        print_success "Service is healthy!"
        curl -s "http://localhost:$port/health" | jq . 2>/dev/null || curl -s "http://localhost:$port/health"
    else
        print_error "Service is not responding!"
        exit 1
    fi
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "build")
            build_production
            ;;
        "build-dev")
            build_development
            ;;
        "up")
            start_production
            ;;
        "up-dev")
            start_development
            ;;
        "down")
            stop_services
            ;;
        "logs")
            show_logs avatars-placeholder
            ;;
        "logs-dev")
            show_logs avatars-placeholder-dev
            ;;
        "shell")
            access_shell avatars-placeholder
            ;;
        "shell-dev")
            access_shell avatars-placeholder-dev
            ;;
        "restart")
            restart_service avatars-placeholder
            ;;
        "restart-dev")
            restart_service avatars-placeholder-dev
            ;;
        "clean")
            clean_up
            ;;
        "health")
            check_health
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@" 