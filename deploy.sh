#!/bin/bash

# Deployment script for full-stack infrastructure
# Usage: ./deploy.sh [command]
# Commands: up, down, restart, logs, status, clean

set -e

# Configuration
COMPOSE_FILE="docker-compose.complete.yml"
PROJECT_NAME="summit-infrastructure"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker and Docker Compose are installed
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Create necessary directories
setup_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p {caddy/{data,config,logs},postgres/backups,site2,logs/{site1,site2}}
    
    # Ensure directories have correct permissions
    chmod 755 caddy/logs logs/site1 logs/site2
    
    print_success "Directories created"
}

# Generate site2 if it doesn't exist
setup_site2() {
    if [ ! -f "site2/package.json" ]; then
        print_status "Setting up Site 2 (TechFlow Solutions)..."
        
        if [ -f "duplicate_site.py" ] && [ -f "site-data-2.ts" ]; then
            python3 duplicate_site.py site2 site-data-2.ts
            print_success "Site 2 created using duplication script"
        else
            print_warning "Duplication script not found, creating basic Next.js app..."
            cd site2
            npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
            cd ..
            print_success "Site 2 created as basic Next.js app"
        fi
        
        # Ensure Dockerfile exists in site2
        if [ ! -f "site2/Dockerfile" ]; then
            print_status "Copying Dockerfile to site2..."
            # The Dockerfile should already be created by our setup
            if [ ! -f "site2/Dockerfile" ]; then
                print_error "Dockerfile for site2 not found!"
                exit 1
            fi
        fi
    else
        print_status "Site 2 already exists, skipping setup"
    fi
}

# Update Next.js config for standalone output
update_nextjs_config() {
    print_status "Updating Next.js configurations for Docker..."
    
    # Update main site next.config.mjs
    if [ -f "next.config.mjs" ]; then
        if ! grep -q "output.*standalone" next.config.mjs; then
            sed -i.bak 's/const nextConfig = {/const nextConfig = {\n  output: "standalone",/' next.config.mjs
            print_status "Updated main site next.config.mjs"
        fi
    fi
    
    # Update site2 next.config.mjs
    if [ -f "site2/next.config.mjs" ]; then
        if ! grep -q "output.*standalone" site2/next.config.mjs; then
            sed -i.bak 's/const nextConfig = {/const nextConfig = {\n  output: "standalone",/' site2/next.config.mjs
            print_status "Updated site2 next.config.mjs"
        fi
    elif [ -f "site2/next.config.js" ]; then
        if ! grep -q "output.*standalone" site2/next.config.js; then
            sed -i.bak 's/module.exports = {/module.exports = {\n  output: "standalone",/' site2/next.config.js
            print_status "Updated site2 next.config.js"
        fi
    fi
    
    print_success "Next.js configurations updated"
}

# Start all services
start_services() {
    print_status "Starting all services..."
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --build
    
    print_success "All services started!"
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 10
    
    show_status
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    
    print_success "All services stopped!"
}

# Restart all services
restart_services() {
    print_status "Restarting all services..."
    
    stop_services
    sleep 5
    start_services
}

# Show logs
show_logs() {
    service=${1:-}
    
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f $service
    else
        print_status "Showing logs for all services..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
    fi
}

# Show status
show_status() {
    print_status "Infrastructure Status:"
    echo
    
    # Check if services are running
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo
    print_status "Health Checks:"
    
    # Check Caddy load balancer
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/health | grep -q "200"; then
        print_success "✅ Load Balancer: http://localhost"
    else
        print_error "❌ Load Balancer: http://localhost"
    fi
    
    # Check Site 1 direct
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
        print_success "✅ Site 1 Direct: http://localhost:3001"
    else
        print_error "❌ Site 1 Direct: http://localhost:3001"
    fi
    
    # Check Site 2 direct
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 | grep -q "200"; then
        print_success "✅ Site 2 Direct: http://localhost:3002"
    else
        print_error "❌ Site 2 Direct: http://localhost:3002"
    fi
    
    # Check PgAdmin
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5050 | grep -q "200"; then
        print_success "✅ PgAdmin: http://localhost:5050"
    else
        print_error "❌ PgAdmin: http://localhost:5050"
    fi
    
    echo
    print_status "Service URLs:"
    echo "📍 Load Balancer: http://localhost"
    echo "📍 Site 1 (Summit): http://localhost:3001"
    echo "📍 Site 2 (TechFlow): http://localhost:3002"
    echo "📍 PgAdmin: http://localhost:5050 (admin@example.com / admin123)"
    echo "📍 Caddy Admin: http://localhost:2019"
    echo "📍 Grafana: http://localhost:3000 (admin / admin123)"
    echo "📍 Prometheus: http://localhost:9090"
}

# Clean up everything
clean_all() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Cleaning up everything..."
        
        # Stop and remove containers
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --rmi all
        
        # Remove any dangling images
        docker image prune -f
        
        # Remove any dangling volumes
        docker volume prune -f
        
        print_success "Cleanup complete!"
    else
        print_status "Cleanup cancelled"
    fi
}

# Show help
show_help() {
    echo "Infrastructure Deployment Script"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  up         Start all services"
    echo "  down       Stop all services"
    echo "  restart    Restart all services"
    echo "  logs       Show logs for all services"
    echo "  logs [svc] Show logs for specific service"
    echo "  status     Show status of all services"
    echo "  clean      Remove all containers, volumes, and images"
    echo "  help       Show this help message"
    echo
    echo "Examples:"
    echo "  $0 up                # Start everything"
    echo "  $0 logs caddy        # Show Caddy logs"
    echo "  $0 status            # Check service status"
}

# Main function
main() {
    command=${1:-up}
    
    case $command in
        "up"|"start")
            check_requirements
            setup_directories
            setup_site2
            update_nextjs_config
            start_services
            ;;
        "down"|"stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            show_logs $2
            ;;
        "status")
            show_status
            ;;
        "clean")
            clean_all
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 