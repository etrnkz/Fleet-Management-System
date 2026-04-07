# VPS Deployment Guide — Fleet Management Backend

## Prerequisites

- Ubuntu 22.04+ VPS (2 GB RAM minimum)
- A domain or subdomain pointed at the VPS IP
- SSH access as root or a sudo user

---

## 1. Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Create a deploy user
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key to the deploy user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

---

## 2. Install Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs
node -v   # should print v22.x.x
```

---

## 3. Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib

# Start and enable
systemctl enable --now postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER fleet_user WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE fleet_management OWNER fleet_user;
GRANT ALL PRIVILEGES ON DATABASE fleet_management TO fleet_user;
EOF
```

---

## 4. Install Redis

```bash
apt install -y redis-server
systemctl enable --now redis-server

# Optional: set a password in /etc/redis/redis.conf
# requirepass CHANGE_ME_REDIS_PASSWORD
# systemctl restart redis-server
```

---

## 5. Install PM2

```bash
npm install -g pm2
```

---

## 6. Clone and Configure the App

```bash
su - deploy

git clone https://github.com/YOUR_ORG/Fleet-Management-System.git
cd Fleet-Management-System/Backend

# Install dependencies
npm ci

# Copy and edit the environment file
cp .env.production.example .env
nano .env
```

**Minimum required values in `.env`:**

```env
NODE_ENV=production
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=fleet_user
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DB_NAME=fleet_management
DB_SYNCHRONIZE=false

JWT_SECRET=<generate: openssl rand -hex 32>
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=<generate: openssl rand -hex 32>
JWT_REFRESH_EXPIRATION=7d

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

Generate secrets:
```bash
openssl rand -hex 32   # run twice — once for JWT_SECRET, once for JWT_REFRESH_SECRET
```

---

## 7. Build and Migrate

```bash
# Build TypeScript
npm run build

# Run database migrations (creates all tables)
npm run migrate

# Seed initial data (colleges, departments, admin user)
npm run seed
```

> The seed creates `admin@haramaya.edu.et` with password `Admin@1234`.
> **Change this password immediately after first login.**

---

## 8. Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

Check it's running:
```bash
pm2 status
pm2 logs fleet-api --lines 50
curl http://localhost:3000/api/v1/health
```

---

## 9. Nginx Reverse Proxy

```bash
apt install -y nginx

nano /etc/nginx/sites-available/fleet-api
```

Paste:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket support (Socket.IO)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/fleet-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 10. SSL with Certbot

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

Certbot auto-renews. Verify:
```bash
certbot renew --dry-run
```

---

## 11. Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 12. Updating the App

```bash
cd ~/Fleet-Management-System/Backend

git pull origin main
npm ci
npm run build
npm run migrate        # runs any new migrations
pm2 restart fleet-api
pm2 logs fleet-api --lines 30
```

---

## 13. Docker Alternative

If you prefer Docker instead of PM2:

```bash
# Build image
docker build -t fleet-api .

# Run (replace env values)
docker run -d \
  --name fleet-api \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  fleet-api
```

Or with Docker Compose — create `docker-compose.yml`:

```yaml
services:
  api:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: fleet_user
      POSTGRES_PASSWORD: CHANGE_ME
      POSTGRES_DB: fleet_management
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  pgdata:
```

```bash
docker compose up -d
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

---

## 14. Verify Everything

```bash
# Health check
curl https://api.yourdomain.com/api/v1/health

# Run Postman API tests against production
npx newman run postman/collections/Fleet_Management_API.postman_collection.json \
  -e postman/environments/Fleet_Management_Production.postman_environment.json
```

---

## Useful PM2 Commands

| Command | Description |
|---|---|
| `pm2 status` | Show all processes |
| `pm2 logs fleet-api` | Tail logs |
| `pm2 restart fleet-api` | Restart app |
| `pm2 reload fleet-api` | Zero-downtime reload |
| `pm2 stop fleet-api` | Stop app |
| `pm2 monit` | Live CPU/memory monitor |
