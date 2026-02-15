// Static content for ClawdEmail

export const HOME_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClawdEmail - Email for AI Agents</title>
  <meta name="description" content="Receive-only email service for AI agents. Instant mailbox, no signup, no verification.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📬</text></svg>">
  <style>
    :root{--bg:#0d1117;--text:#e6edf3;--muted:#7d8590;--accent:#58a6ff;--code-bg:#161b22;--border:#30363d}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;min-height:100vh}
    .container{max-width:720px;margin:0 auto;padding:80px 24px}
    header{text-align:center;margin-bottom:48px}
    h1{font-size:2.75rem;font-weight:700;margin-bottom:12px;letter-spacing:-0.02em}
    h1 span{opacity:0.5}
    .tagline{font-size:1.1rem;color:var(--muted);max-width:420px;margin:0 auto}
    .card{background:var(--code-bg);border:1px solid var(--border);border-radius:16px;padding:28px 32px;margin-bottom:32px}
    .card h2{font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;font-weight:600}
    .card-desc{color:var(--text);font-size:0.95rem;margin-bottom:16px}
    .card-note{color:var(--muted);font-size:0.85rem;margin-top:16px;font-style:italic}
    .code-block{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-family:'SF Mono',Monaco,monospace;font-size:0.9rem;display:flex;justify-content:space-between;align-items:center;gap:12px}
    .code-block code{color:var(--accent);flex:1}
    .copy-btn{background:var(--border);border:none;color:var(--text);padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.8rem;white-space:nowrap;transition:background 0.15s}
    .copy-btn:hover{background:var(--muted)}
    .features{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .feature{background:var(--code-bg);border:1px solid var(--border);border-radius:12px;padding:20px}
    .feature h3{font-size:1rem;margin-bottom:6px;font-weight:600}
    .feature p{color:var(--muted);font-size:0.85rem;line-height:1.5}
    .use-cases{margin-bottom:32px}
    .case{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)}
    .case:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none}
    .case h3{font-size:0.95rem;margin-bottom:6px;font-weight:600}
    .case p{color:var(--muted);font-size:0.85rem;line-height:1.5}
    footer{text-align:center;margin-top:48px;padding-top:24px;border-top:1px solid var(--border);color:var(--muted);font-size:0.85rem}
    footer a{color:var(--accent);text-decoration:none}
    footer a:hover{text-decoration:underline}
    @media(max-width:640px){
      h1{font-size:2rem}
      .container{padding:48px 16px}
      .features{grid-template-columns:1fr}
      .steps{flex-direction:column;gap:12px}
      .arrow{display:none}
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📬 Clawd<span>Email</span></h1>
      <p class="tagline">Receive-only email service for AI agents. Instant mailbox, no signup, no verification.</p>
    </header>
    
    <div class="card">
      <h2>Get Started 🚀</h2>
      <p class="card-desc">Copy this prompt to your AI agent:</p>
      <div class="code-block">
        <code>Read https://clawdemail.com/skill.md and set up a ClawdEmail mailbox for yourself. Save the token securely and create a cron job to check the inbox periodically.</code>
        <button class="copy-btn" onclick="navigator.clipboard.writeText('Read https://clawdemail.com/skill.md and set up a ClawdEmail mailbox for yourself. Save the token securely and create a cron job to check the inbox periodically.');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',2000)">Copy</button>
      </div>
      <p class="card-note">Your agent will handle the rest — no human intervention needed.</p>
    </div>

    <div class="card use-cases">
      <h2>Use Cases 💡</h2>
      <div class="case">
        <h3>🔒 Privacy-First Email Access</h3>
        <p>Don't want your agent reading all your emails? Forward only specific emails here — your agent sees only what you allow.</p>
      </div>
      <div class="case">
        <h3>🔐 Autonomous Account Signup</h3>
        <p>Let your agent register for services on its own. Verification codes and confirm links are auto-extracted — no human needed.</p>
      </div>
      <div class="case">
        <h3>📰 News & Newsletter Reader</h3>
        <p>Subscribe to newsletters, market reports, and daily digests. Your agent reads, summarizes, and briefs you.</p>
      </div>
      <div class="case">
        <h3>🔔 Notification Monitor</h3>
        <p>Receive alerts, order updates, shipping notifications. Your agent watches and acts when something important arrives.</p>
      </div>
      <div class="case">
        <h3>📊 Automated Reports</h3>
        <p>Collect scheduled reports, data exports, and analytics emails. Your agent processes and extracts insights.</p>
      </div>
      <div class="case">
        <h3>⚡ Email-Triggered Actions</h3>
        <p>Trigger agent workflows when specific emails arrive — approvals, reminders, or any custom automation.</p>
      </div>
    </div>

    <div class="features">
      <div class="feature">
        <h3>⚡ Instant</h3>
        <p>One API call. No forms, no verification.</p>
      </div>
      <div class="feature">
        <h3>🤖 Agent-First</h3>
        <p>Simple REST API with token auth.</p>
      </div>
      <div class="feature">
        <h3>🔒 Receive Only</h3>
        <p>No sending, no spam risk.</p>
      </div>
    </div>

    </div>
</body>
</html>`;

export const SKILL_MD = `---
name: clawdemail
version: 1.1.0
description: Receive-only email service for AI agents with auto code/link extraction
homepage: https://clawdemail.com
api_base: https://api.clawdemail.com
---

# ClawdEmail

Receive-only email service for AI agents. Get a mailbox instantly, receive emails, and auto-extract verification codes and links.

**Base URL:** https://api.clawdemail.com

---

## Step 1: Register Your Mailbox

    curl -X POST https://api.clawdemail.com/register

Response:

    {
      "success": true,
      "email": "swift-coral-42@clawdemail.com",
      "token": "a1b2c3d4e5f6..."
    }

**Save your token!** Store it securely. It cannot be recovered.

### Custom Name (Optional)

    curl -X POST https://api.clawdemail.com/register \\
      -H "Content-Type: application/json" \\
      -d '{"name": "my-agent"}'

---

## Step 2: Set Up Inbox Checking (Cron Job)

Add to your cron schedule to check for new emails periodically.

    {
      "schedule": {"kind": "every", "everyMs": 600000},
      "payload": {
        "kind": "agentTurn",
        "message": "Check ClawdEmail inbox. Process new emails."
      }
    }

---

## Step 3: Read Emails

When you read an email, verification codes and action links are auto-extracted:

    curl -H "Authorization: Bearer TOKEN" \\
      https://api.clawdemail.com/email/EMAIL_ID

Response:

    {
      "success": true,
      "email": {
        "id": "uuid",
        "from_addr": "noreply@example.com",
        "subject": "Verify your account",
        "body_text": "Your verification code is 887766",
        "received_at": 1707984000000
      },
      "code": "887766",
      "links": ["https://example.com/verify?token=abc123"]
    }

**code** — Auto-extracted verification code (OTP, PIN, etc.) or null
**links** — Array of verification/action links found, or null

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Create mailbox |
| GET | /inbox | Token | List emails (?limit=N&offset=M) |
| GET | /email/:id | Token | Get email + extracted code/links |
| DELETE | /email/:id | Token | Delete email |
| GET | /stats | Token | Mailbox statistics |
| GET | /health | No | Service status |

### Authentication

    Authorization: Bearer YOUR_TOKEN

---

## Response Examples

### Inbox

    {
      "success": true,
      "email": "swift-coral-42@clawdemail.com",
      "count": 2,
      "unread": 1,
      "emails": [
        {"id": "uuid", "from": "sender@example.com", "subject": "Hello", "received_at": 1707984000000, "read": false}
      ]
    }

### Email with Extracted Data

    {
      "success": true,
      "email": {...},
      "code": "123456",
      "links": ["https://example.com/confirm?token=xyz"]
    }

---

## Auto-Extraction

ClawdEmail automatically extracts:

**Verification Codes:**
- OTP, PIN, passcode
- "Your code is 123456"
- "验证码：123456"

**Action Links:**
- Verify, confirm, activate links
- Password reset links
- Magic login links
- Unsubscribe links

---

## Rate Limits

- Registration: 10 per hour per IP
- API calls: 100 per minute per IP

## Limitations

- Receive only (cannot send)
- Text/HTML only (no attachments)
- 30 day retention
- 1 MB max per email
`;
