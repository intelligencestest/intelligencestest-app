#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Intelligences Test — VPS setup script
# Run as root on a fresh Ubuntu/Debian VPS
# Usage: bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

APP_DIR="/var/www/intelligencestest-app"
REPO="https://github.com/intelligencestest/intelligencestest-app.git"
DOMAIN="app.intelligencestest.com"
APP_NAME="intelligencestest"

echo "==> [1/9] Installing nvm + Node 20"
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20
node --version
npm --version

echo "==> [2/9] Installing PM2 and Nginx"
npm install -g pm2
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> [3/9] Cloning / updating repo"
if [ -d "$APP_DIR/.git" ]; then
  echo "    Repo exists — pulling latest"
  git -C "$APP_DIR" pull
else
  mkdir -p /var/www
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> [4/9] Writing .env.local"
if [ ! -f ".env.local" ]; then
cat > .env.local <<'ENV'
NEXT_PUBLIC_SUPABASE_URL=https://yqedlmmcxiqwmnnzjmkb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_SERVICE_ROLE_KEY
ENV
  echo "    !! .env.local created — fill in the two keys before continuing"
  echo "    !! nano /var/www/intelligencestest-app/.env.local"
  exit 1
else
  echo "    .env.local already exists — skipping"
fi

echo "==> [5/9] Installing dependencies"
npm ci

echo "==> [6/9] Building Next.js"
npm run build

echo "==> [7/9] Starting / restarting app with PM2"
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$APP_NAME"
else
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save
pm2 startup | tail -1 | bash   # auto-run the generated startup command

echo "==> [8/9] Configuring Nginx"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
cp "$APP_DIR/deploy/nginx.conf" "$NGINX_CONF"
# Update domain name in config (in case it differs)
sed -i "s/server_name .*/server_name $DOMAIN;/" "$NGINX_CONF"

if [ ! -L "/etc/nginx/sites-enabled/$APP_NAME" ]; then
  ln -s "$NGINX_CONF" "/etc/nginx/sites-enabled/$APP_NAME"
fi

# Remove default site if still enabled
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
systemctl enable nginx

echo "==> [9/9] Requesting SSL certificate via Let's Encrypt"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@intelligencestest.com || \
  echo "    SSL skipped — run manually: certbot --nginx -d $DOMAIN"

echo ""
echo "✓ Done. App is running at http://$DOMAIN (HTTP) or https://$DOMAIN (if SSL succeeded)"
echo "  PM2 status:    pm2 status"
echo "  App logs:      pm2 logs $APP_NAME"
echo "  Nginx logs:    tail -f /var/log/nginx/error.log"
