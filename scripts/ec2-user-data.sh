#!/bin/bash
# EShop Production EC2 User Data Setup Script
# Works on Amazon Linux 2023, Amazon Linux 2, and Ubuntu

set -e

# Log output to user-data.log
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=================================================="
echo "Starting EC2 Instance Provisioning for EShop..."
echo "=================================================="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="unknown"
fi

echo "Detected OS: $OS"

# 1. Update system and Install Docker / Git / Curl
if [ "$OS" = "ubuntu" ]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get upgrade -y
    apt-get install -y curl git apt-transport-https ca-certificates gnupg lsb-release

    # Install Docker
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Configure user group
    usermod -aG docker ubuntu || true
else
    # Amazon Linux 2 / 2023
    dnf update -y || yum update -y
    dnf install -y docker git curl || yum install -y docker git curl
    
    # Install Docker Compose V2
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/bin/docker-compose || true

    # Configure user group
    usermod -aG docker ec2-user || true
fi

# 2. Enable and Start Docker Service
systemctl enable docker
systemctl start docker

# 3. Create deployment directories
echo "Creating application directory structures..."
mkdir -p /app/ssl

# 4. Generate a self-signed SSL certificate for fallback/development
echo "Generating self-signed SSL Certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /app/ssl/nginx.key \
    -out /app/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=EShop/OU=Production/CN=localhost"

echo "=================================================="
echo "EC2 Setup Completed Successfully!"
echo "=================================================="
