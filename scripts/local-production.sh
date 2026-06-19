#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define colours for helper outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configurations with their ports 
declare -A SERVICES=(
    ["api-gateway"]=8080
    ["auth-service"]=6001
    ["product-service"]=6002
    ["order-service"]=6004
    ["admin-service"]=6005
    ["chatting-service"]=6006
    ["recommendation-service"]=6007
    ["logger-service"]=6008
    ["kafka-consumer"]=6009
    ["user-ui"]=3000
    ["seller-ui"]=3001
    ["admin-ui"]=3002
)

# Function to display usage information
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  --clean            Stop all containers, remove volumes and clean up unused Docker resources."
    echo "  --build-only       Build the Docker images for all services without starting them."
    echo "  --run-only         Start all already-built Docker containers in the background."
    echo "  --stop             Stop and remove all running containers without destroying volumes."
    echo "  --logs             View and tail logs of all running containers."
    echo "  --service <name>   Build and restart only the specified service."
    echo "  (no options)       Build and run all services in the background (default)."
    exit 1
}

# Function to build a specific service image
build_service() {
    local SERVICE_NAME="$1"
    local DOCKERFILE=""
    
    case "$SERVICE_NAME" in
        "api-gateway") DOCKERFILE="apps/api-gateway/Dockerfile" ;;
        "auth-service") DOCKERFILE="apps/auth-service/Dockerfile" ;;
        "product-service") DOCKERFILE="apps/product-service/Dockerfile" ;;
        "order-service") DOCKERFILE="apps/order-service/Dockerfile" ;;
        "admin-service") DOCKERFILE="apps/admin-service/Dockerfile" ;;
        "chatting-service") DOCKERFILE="apps/chatting-service/Dockerfile" ;;
        "recommendation-service") DOCKERFILE="apps/recommendation-service/Dockerfile" ;;
        "logger-service") DOCKERFILE="apps/logger-service/Dockerfile" ;;
        "kafka-consumer") DOCKERFILE="apps/kafka/Dockerfile" ;;
        "user-ui") DOCKERFILE="apps/user-ui/Dockerfile" ;;
        "seller-ui") DOCKERFILE="apps/seller-ui/Dockerfile" ;;
        "admin-ui") DOCKERFILE="apps/admin-ui/Dockerfile" ;;
        *) return 1 ;;
    esac

    # Determine image tag based on DOCKER_USERNAME env, fallback to 'eshop'
    local USERNAME="${DOCKER_USERNAME:-eshop}"
    local TAG_NAME="${USERNAME}/${SERVICE_NAME}:latest"

    echo -e "${BLUE}>>> Building $SERVICE_NAME (Tag: $TAG_NAME) using $DOCKERFILE...${NC}"
    docker build --network=host -f "$DOCKERFILE" -t "$TAG_NAME" .
}

# Navigate to the workspace root directory
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WORKSPACE_ROOT"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in PATH.${NC}"
    exit 1
fi

# Detect whether to use 'docker compose' or 'docker-compose'
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose -f docker-compose.production.yml"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose -f docker-compose.production.yml"
else
    echo -e "${RED}Error: Neither 'docker compose' nor 'docker-compose' could be found.${NC}"
    exit 1
fi

# Parse options
ACTION="default"
SERVICE_NAME=""

while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --clean) ACTION="clean"; shift ;;
        --build-only) ACTION="build-only"; shift ;;
        --run-only) ACTION="run-only"; shift ;;
        --stop) ACTION="stop"; shift ;;
        --logs) ACTION="logs"; shift ;;
        --service)
            ACTION="service"
            SERVICE_NAME="$2"
            if [ -z "$SERVICE_NAME" ]; then
                echo -e "${RED}Error: --service option requires a service name.${NC}"
                exit 1
            fi
            shift 2
            ;;
        --help|-h) usage ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

case "$ACTION" in
    clean)
        echo -e "${GREEN}Stopping containers and cleaning up volumes/images...${NC}"
        $DOCKER_COMPOSE down -v --rmi local
        echo -e "${GREEN}Pruning dangling docker images...${NC}"
        docker image prune -f
        echo -e "${GREEN}Cleanup completed successfully!${NC}"
        ;;
    build-only)
        echo -e "${GREEN}Building all Docker images locally...${NC}"
        for s in "${!SERVICES[@]}"; do
            build_service "$s"
        done
        echo -e "${GREEN}All images built successfully!${NC}"
        ;;
    run-only)
        echo -e "${GREEN}Starting all containers...${NC}"
        $DOCKER_COMPOSE up -d
        echo -e "${GREEN}Containers started! Running in background.${NC}"
        ;;
    stop)
        echo -e "${GREEN}Stopping and removing all running containers...${NC}"
        $DOCKER_COMPOSE down
        echo -e "${GREEN}Containers stopped successfully!${NC}"
        ;;
    logs)
        echo -e "${GREEN}Tailing logs from all containers...${NC}"
        $DOCKER_COMPOSE logs -f
        ;;
    service)
        if [ -z "${SERVICES[$SERVICE_NAME]}" ]; then
            echo -e "${RED}Error: Service '$SERVICE_NAME' is not defined.${NC}"
            echo -e "Valid services are:"
            for key in $(echo "${!SERVICES[@]}" | tr ' ' '\n' | sort); do
                echo -e "  - $key"
            done
            exit 1
        fi
        build_service "$SERVICE_NAME"
        echo -e "${GREEN}Starting/recreating service: $SERVICE_NAME...${NC}"
        $DOCKER_COMPOSE up -d --no-deps "$SERVICE_NAME"
        echo -e "${GREEN}Service $SERVICE_NAME started successfully!${NC}"
        ;;
    default)
        echo -e "${GREEN}Building and starting all services (production-mode)...${NC}"
        for s in "${!SERVICES[@]}"; do
            build_service "$s"
        done
        $DOCKER_COMPOSE up -d
        echo -e "${GREEN}Services are up and running!${NC}"
        ;;
esac
