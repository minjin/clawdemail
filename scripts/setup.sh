#!/bin/bash
# ClawdEmail Setup Script
# Automates D1 database creation and configuration

set -e

echo "🦞 ClawdEmail Setup"
echo "==================="
echo ""

# Check wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check login
echo "📋 Checking Cloudflare login..."
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare:"
    wrangler login
fi

# Get domain
echo ""
read -p "🌐 Enter your domain (e.g., clawdemail.com): " DOMAIN

# Generate token secret
TOKEN_SECRET=$(openssl rand -hex 32)
echo "🔑 Generated TOKEN_SECRET"

# Create D1 database
echo ""
echo "📦 Creating D1 database..."
DB_OUTPUT=$(wrangler d1 create clawdemail-db 2>&1) || true

# Extract database_id
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

if [ -z "$DB_ID" ]; then
    echo "⚠️  Database may already exist. Please enter your database_id:"
    read -p "   database_id: " DB_ID
fi

echo "   Database ID: $DB_ID"

# Update wrangler.toml
echo ""
echo "📝 Updating wrangler.toml..."
cat > wrangler.toml << EOF
name = "clawdemail"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
DOMAIN = "$DOMAIN"
TOKEN_SECRET = "$TOKEN_SECRET"

[[d1_databases]]
binding = "DB"
database_name = "clawdemail-db"
database_id = "$DB_ID"

[triggers]
emails = ["*@$DOMAIN"]
EOF

echo "✅ wrangler.toml configured"

# Initialize database
echo ""
echo "🗄️  Initializing database schema..."
wrangler d1 execute clawdemail-db --remote --file=schema.sql

echo "✅ Database initialized"

# Deploy
echo ""
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

echo ""
echo "========================================="
echo "✅ ClawdEmail deployed successfully!"
echo "========================================="
echo ""
echo "📧 Your email domain: *@$DOMAIN"
echo ""
echo "⚠️  MANUAL STEPS REQUIRED:"
echo ""
echo "1. Go to Cloudflare Dashboard → $DOMAIN → Email → Email Routing"
echo "2. Enable Email Routing (add DNS records when prompted)"
echo "3. Add catch-all rule:"
echo "   - Action: Send to Worker"
echo "   - Destination: clawdemail"
echo ""
echo "4. (Optional) Add custom API domain:"
echo "   - Add DNS: api.$DOMAIN → CNAME → clawdemail.<your-subdomain>.workers.dev"
echo ""
echo "🔗 Test: curl -X POST https://clawdemail.<your-subdomain>.workers.dev/register"
echo ""
