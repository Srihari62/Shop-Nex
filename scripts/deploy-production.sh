#!/bin/bash
# EShop Production Deployment Script
# This script deploys the Dockerized production stack to the target EC2 host.

set -e

# Load environment variables if .env exists locally
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
EC2_HOST=${EC2_HOST:-""}
SSH_KEY_PATH=${SSH_KEY_PATH:-""}
DOCKER_USERNAME=${DOCKER_USERNAME:-""}
DOCKER_PASSWORD=${DOCKER_PASSWORD:-""}
APP_DIR="/app"

# Helper for local deployment execution
deploy_local() {
  echo ">>> Performing Local deployment on this server..."
  cd "$APP_DIR"
  
  if [ ! -f .env ]; then
    if [ -f /home/ubuntu/Shop-Nex/.env ]; then
      echo ">>> Copying .env file from /home/ubuntu/Shop-Nex/ to $APP_DIR..."
      cp /home/ubuntu/Shop-Nex/.env .env
    elif [ -f /home/ubuntu/.env ]; then
      echo ">>> Copying .env file from /home/ubuntu/ to $APP_DIR..."
      cp /home/ubuntu/.env .env
    fi
  fi
  
  if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
    echo ">>> Logging into Docker Hub..."
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  fi

  echo ">>> Pulling latest Docker images..."
  docker compose -f docker-compose.production.yml pull

  echo ">>> Deploying container stack..."
  docker compose -f docker-compose.production.yml up -d --remove-orphans

  echo ">>> Restarting Nginx to reload DNS and clear IP cache..."
  docker compose -f docker-compose.production.yml restart nginx

  echo ">>> Running database migrations..."
  # Run prisma migrations on the auth-service container
  docker compose -f docker-compose.production.yml exec -u root -T auth-service npx prisma db push --accept-data-loss || true

  echo ">>> Cleaning up old, dangling Docker images..."
  docker image prune -f || true

  echo ">>> Deployment completed successfully!"
}

# Helper for remote deployment execution
deploy_remote() {
  echo ">>> Performing Remote deployment to: $EC2_HOST"

  if [ -z "$SSH_KEY_PATH" ]; then
    echo "Error: SSH_KEY_PATH is required for remote deployment."
    exit 1
  fi

  # 1. Sync config files to EC2
  echo ">>> Syncing configuration files to EC2..."
  ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_HOST" "sudo mkdir -p $APP_DIR && sudo chown -R ubuntu:ubuntu $APP_DIR"
  
  scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no \
    docker-compose.production.yml nginx.conf \
    ubuntu@"$EC2_HOST":"$APP_DIR"

  if [ -f .env ]; then
    echo ">>> Copying local .env file to EC2..."
    scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no .env ubuntu@"$EC2_HOST":"$APP_DIR"
  else
    echo ">>> No local .env file found. Skipping .env copy (assuming it is already configured on EC2)..."
  fi

  # 2. Run remote deploy commands
  echo ">>> Executing deployment commands on EC2..."
  ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_HOST" \
    "export DOCKER_USERNAME=$DOCKER_USERNAME; \
     export DOCKER_PASSWORD=$DOCKER_PASSWORD; \
     export APP_DIR=$APP_DIR; \
     bash -s -- --local" < "$0"
}

# Parse command line arguments
case "$1" in
  --local)
    deploy_local
    ;;
  *)
    if [ -z "$EC2_HOST" ]; then
      echo "No EC2_HOST specified. Defaulting to local deployment."
      deploy_local
    else
      deploy_remote
    fi
    ;;
esac
