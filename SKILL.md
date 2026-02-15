---
name: clawdemail
version: 1.0.0
description: Receive-only email service for AI agents. Instant mailbox, no signup, no verification.
homepage: https://clawdemail.com
metadata: {"api_base": "https://api.clawdemail.com", "emoji": "📬"}
---

# ClawdEmail

Receive-only email service for AI agents. Get an email address instantly — no signup forms, no verification, no waiting.

**Base URL:** `https://api.clawdemail.com`

## Quick Start

### 1. Register a Mailbox

```bash
curl -X POST https://api.clawdemail.com/register
```

Response:
```json
{
  "success": true,
  "email": "swift-coral-42@clawdemail.com",
  "token": "a1b2c3d4e5f6..."
}
```

**⚠️ Save your `token` immediately!** It cannot be recovered.

### 2. Custom Name (Optional)

Want a specific name? Include it in the request:

```bash
curl -X POST https://api.clawdemail.com/register \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent-inbox"}'
```

Names must be 3-30 chars, lowercase alphanumeric with hyphens.

### 3. Check Inbox

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.clawdemail.com/inbox
```

Response:
```json
{
  "success": true,
  "email": "swift-coral-42@clawdemail.com",
  "count": 2,
  "unread": 1,
  "emails": [
    {
      "id": "uuid-123",
      "from": "sender@example.com",
      "subject": "Welcome!",
      "received_at": 1707984000000,
      "read": false
    }
  ]
}
```

### 4. Read an Email

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.clawdemail.com/email/uuid-123
```

### 5. Delete an Email

```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.clawdemail.com/email/uuid-123
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | No | Create new mailbox |
| `GET` | `/inbox` | Token | List emails |
| `GET` | `/inbox?limit=20&offset=0` | Token | Paginated inbox |
| `GET` | `/email/:id` | Token | Get full email content |
| `DELETE` | `/email/:id` | Token | Delete an email |
| `GET` | `/stats` | Token | Mailbox statistics |
| `GET` | `/health` | No | Service status |

---

## Authentication

Include your token in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN
```

🔒 **Security:** Only send your token to `https://api.clawdemail.com` — never anywhere else!

---

## Rate Limits

| Action | Limit |
|--------|-------|
| Registration | 10 per hour per IP |
| API calls | 100 per minute per IP |

---

## Use Cases

- **OAuth callbacks** — Receive verification codes
- **Service notifications** — Get alerts from APIs
- **Testing** — Disposable emails for development
- **Webhooks via email** — Some services only support email

---

## Limitations

| Limit | Value |
|-------|-------|
| Sending | ❌ Receive only |
| Attachments | Text/HTML body only |
| Retention | 30 days |
| Email size | 1 MB max |

---

## Code Examples

### Python

```python
import requests

# Register (auto-generated name)
r = requests.post("https://api.clawdemail.com/register")
data = r.json()
email = data["email"]   # swift-coral-42@clawdemail.com
token = data["token"]

# Or register with custom name
r = requests.post("https://api.clawdemail.com/register", 
    json={"name": "my-agent"})

# Check inbox
headers = {"Authorization": f"Bearer {token}"}
inbox = requests.get("https://api.clawdemail.com/inbox", 
    headers=headers).json()

for msg in inbox["emails"]:
    print(f"From: {msg['from']}, Subject: {msg['subject']}")

# Read full email
email_id = inbox["emails"][0]["id"]
full = requests.get(f"https://api.clawdemail.com/email/{email_id}",
    headers=headers).json()
print(full["email"]["body_text"])
```

### JavaScript

```javascript
// Register
const { email, token } = await fetch("https://api.clawdemail.com/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "my-agent" }) // optional
}).then(r => r.json());

// Save token!
console.log(`Email: ${email}, Token: ${token}`);

// Check inbox
const inbox = await fetch("https://api.clawdemail.com/inbox", {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());

console.log(`${inbox.unread} unread emails`);

// Read email
if (inbox.emails.length > 0) {
  const full = await fetch(`https://api.clawdemail.com/email/${inbox.emails[0].id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  
  console.log(full.email.body_text);
}
```

### Shell (save credentials)

```bash
# Register and save
RESULT=$(curl -s -X POST https://api.clawdemail.com/register)
echo "$RESULT" > ~/.clawdemail-credentials.json
EMAIL=$(echo "$RESULT" | jq -r '.email')
TOKEN=$(echo "$RESULT" | jq -r '.token')

echo "Your email: $EMAIL"
echo "Your token: $TOKEN"

# Check inbox later
curl -s -H "Authorization: Bearer $TOKEN" \
  https://api.clawdemail.com/inbox | jq '.emails[] | {from, subject}'
```

---

## Response Format

**Success:**
```json
{"success": true, "data": {...}}
```

**Error:**
```json
{"success": false, "error": "Description", "code": "ERROR_CODE"}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `RATE_LIMITED` | Too many requests |
| `REG_LIMITED` | Too many registrations |
| `UNAUTHORIZED` | Missing token |
| `INVALID_TOKEN` | Bad token |
| `INVALID_NAME` | Name taken or invalid format |
| `NOT_FOUND` | Email not found |

---

## Status

Service health: https://api.clawdemail.com/health

---

## Open Source

Code: `https://github.com/openclaw/clawdemail` (coming soon)

Built with ❤️ on Cloudflare Workers + D1
