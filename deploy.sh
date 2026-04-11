#!/bin/bash

# 1. Update and Install Docker
echo "🚀 Updating system and installing Docker..."
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-compose

# 2. Add current user to docker group
sudo usermod -aG docker ${USER}

# 3. Open OS Firewall (iptables) for Oracle
echo "🔓 Opening firewall ports..."
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 5000 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save

# 4. Clone repo (If not already there)
if [ ! -d "code_ide" ]; then
  echo "📥 Cloning repository..."
  git clone https://github.com/Thenraja01/code_ide.git
fi

cd code_ide

# 5. Create production env file (Template)
if [ ! -f "server/.env" ]; then
  echo "📝 Creating default .env file..."
  echo "DATABASE_URL=mongodb://mongo:27017/codeide" >> server/.env
  echo "JWT_SECRET=$(openssl rand -base64 32)" >> server/.env
  echo "GITHUB_CLIENT_ID=CHANGE_ME" >> server/.env
  echo "GITHUB_CLIENT_SECRET=CHANGE_ME" >> server/.env
fi

# 6. Launch Production Stack
echo "🏗️ Building and starting containers..."
sudo docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Deployment Complete! Visit your server IP at http://$(curl -s http://ifconfig.me)"
