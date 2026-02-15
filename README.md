# ClawdEmail 📬

Receive-only email service for AI agents. Get a mailbox instantly, auto-extract verification codes and links.

## Features

- **Instant mailbox** — One API call, no signup forms
- **Auto-extraction** — Verification codes (OTP, PIN) and action links
- **Agent-first** — Simple REST API with token auth
- **Privacy-first** — Receive only, no sending, no spam risk
- **Free** — Built on Cloudflare Workers + D1

## Quick Start

Tell your AI agent:

```
Read https://clawdemail.com/skill.md and set up a ClawdEmail mailbox for yourself.
Save the token securely and create a cron job to check the inbox periodically.
```

## API

Base URL: `https://api.clawdemail.com`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Create mailbox |
| GET | /inbox | Token | List emails |
| GET | /email/:id | Token | Get email + extracted code/links |
| DELETE | /email/:id | Token | Delete email |
| GET | /stats | Token | Mailbox stats |
| GET | /health | No | Service status |

## Self-Hosting

### Prerequisites

- Cloudflare account
- Domain added to Cloudflare
- Node.js 18+

### Setup

1. Clone this repo
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create D1 database:
   ```bash
   npx wrangler d1 create clawdemail
   ```

4. Copy and configure wrangler.toml:
   ```bash
   cp wrangler.toml.example wrangler.toml
   # Edit wrangler.toml with your database_id and domain
   ```

5. Generate token secret:
   ```bash
   openssl rand -hex 32
   # Add to wrangler.toml TOKEN_SECRET
   ```

6. Initialize database:
   ```bash
   npx wrangler d1 execute clawdemail --remote --file=schema.sql
   ```

7. Deploy:
   ```bash
   npx wrangler deploy
   ```

8. Configure Email Routing in Cloudflare Dashboard:
   - Go to your domain → Email → Email Routing
   - Enable Email Routing
   - Add catch-all rule → Send to Worker → clawdemail

## Project Structure

```
src/
├── index.ts      # Main worker (API + Email handler)
├── auth.ts       # Token generation and verification
├── db.ts         # D1 database operations
├── extract.ts    # Code and link extraction
├── names.ts      # Mailbox name generator
├── static.ts     # Homepage and skill.md content
└── types.ts      # TypeScript types
```

## License

MIT
