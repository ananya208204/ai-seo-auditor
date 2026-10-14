# Deployment: VPS + Cloudflare DNS + SSL

Target: Ubuntu 22.04/24.04 VPS (1 vCPU / 1 GB RAM is enough), domain on Cloudflare.

## 1. Cloudflare DNS
1. Add your domain to Cloudflare and switch the nameservers at your registrar to the two Cloudflare gives you.
2. DNS → Records:
   | Type | Name | Content | Proxy |
   |---|---|---|---|
   | A | `@` | `<VPS_IP>` | Proxied (orange) |
   | A | `www` | `<VPS_IP>` | Proxied |
   | A | `blog` | `<VPS_IP>` | Proxied *(only if you add WordPress, see §6)* |
3. SSL/TLS → Overview → **Full (strict)**.
4. SSL/TLS → Edge Certificates → **Always Use HTTPS: On**, **Automatic HTTPS Rewrites: On**, Minimum TLS 1.2.
5. SSL/TLS → Origin Server → **Create Certificate** (15 years). Save the certificate and private key; you'll put them on the server.

## 2. Server setup
```bash
ssh root@<VPS_IP>
adduser deploy && usermod -aG sudo deploy
apt update && apt upgrade -y
apt install -y nginx git ufw
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable

# Node 22 + PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm i -g pm2
```

## 3. App
```bash
su - deploy
git clone <your-repo-url> ai-seo-auditor   # or scp the zip and unzip
cd ai-seo-auditor
cp .env.example .env.production
nano .env.production       # set OPENAI_API_KEY and NEXT_PUBLIC_SITE_URL=https://yourdomain.com
npm ci
npm run build
pm2 start npm --name auditor -- start
pm2 save && pm2 startup     # run the command it prints
```

## 4. Origin certificate + Nginx
```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/origin.pem   # paste Origin Certificate
sudo nano /etc/ssl/cloudflare/origin.key   # paste Private Key
sudo chmod 600 /etc/ssl/cloudflare/origin.key
```

`/etc/nginx/sites-available/auditor`:
```nginx
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  return 301 https://yourdomain.com$request_uri;
}
server {
  listen 443 ssl http2;
  server_name www.yourdomain.com;
  ssl_certificate     /etc/ssl/cloudflare/origin.pem;
  ssl_certificate_key /etc/ssl/cloudflare/origin.key;
  return 301 https://yourdomain.com$request_uri;
}
server {
  listen 443 ssl http2;
  server_name yourdomain.com;
  ssl_certificate     /etc/ssl/cloudflare/origin.pem;
  ssl_certificate_key /etc/ssl/cloudflare/origin.key;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml text/plain;

  location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 90s;   # audits can take up to ~60s
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/auditor /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

> Prefer Let's Encrypt instead? `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com` (set the Cloudflare record to DNS-only while issuing).

## 5. Go-live checks
- `https://yourdomain.com` loads with a padlock; `http://` and `www.` 301 to it in one hop.
- `/robots.txt`, `/sitemap.xml`, `/llms.txt` return 200.
- Submit `https://yourdomain.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Run the auditor on your own homepage. It should score in the 90s.

Updating later:
```bash
cd ~/ai-seo-auditor && git pull && npm ci && npm run build && pm2 restart auditor
```

## 6. WordPress on the same VPS (if your rubric requires it)
Run WordPress at `blog.yourdomain.com` alongside the app:
```bash
sudo apt install -y php-fpm php-mysql php-xml php-curl php-gd php-mbstring php-zip mariadb-server
sudo mysql_secure_installation
sudo mysql -e "CREATE DATABASE wp; CREATE USER 'wp'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD'; GRANT ALL ON wp.* TO 'wp'@'localhost'; FLUSH PRIVILEGES;"
cd /var/www && sudo curl -O https://wordpress.org/latest.tar.gz && sudo tar xzf latest.tar.gz && sudo chown -R www-data:www-data wordpress
```
Nginx server block for `blog.yourdomain.com` (same origin cert), root `/var/www/wordpress`, with:
```nginx
index index.php;
location / { try_files $uri $uri/ /index.php?$args; }
location ~ \.php$ { include snippets/fastcgi-php.conf; fastcgi_pass unix:/run/php/php8.3-fpm.sock; }
```
(Check the PHP version with `ls /run/php/`.) Finish the installer in the browser, set permalinks to "Post name" and install Rank Math or Yoast.
