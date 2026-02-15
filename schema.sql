-- ClawdEmail D1 Schema
-- Run: wrangler d1 execute clawdemail --file=schema.sql

-- Agents table (mailboxes)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,              -- 8-char random ID (e.g., "ax7k2m9p")
  token_hash TEXT NOT NULL,         -- SHA-256 hash of token
  created_at INTEGER NOT NULL,      -- Unix timestamp
  last_access INTEGER,              -- Last API access
  email_count INTEGER DEFAULT 0,    -- Cached count
  metadata TEXT                     -- JSON for future use
);

CREATE INDEX idx_agents_created ON agents(created_at);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,              -- UUID
  agent_id TEXT NOT NULL,           -- FK to agents.id
  from_addr TEXT NOT NULL,          -- Sender email
  from_name TEXT,                   -- Sender display name
  to_addr TEXT NOT NULL,            -- Recipient (the agent's email)
  subject TEXT,
  body_text TEXT,                   -- Plain text body
  body_html TEXT,                   -- HTML body (optional)
  headers TEXT,                     -- JSON of all headers
  size_bytes INTEGER,
  received_at INTEGER NOT NULL,     -- Unix timestamp
  read_at INTEGER,                  -- When agent fetched it
  deleted_at INTEGER,               -- Soft delete
  
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_emails_agent ON emails(agent_id, received_at DESC);
CREATE INDEX idx_emails_unread ON emails(agent_id, read_at) WHERE deleted_at IS NULL;

-- Rate limiting / abuse tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,             -- e.g., "ip:1.2.3.4" or "agent:abc123"
  count INTEGER DEFAULT 0,
  window_start INTEGER NOT NULL
);

-- Stats (optional, for monitoring)
CREATE TABLE IF NOT EXISTS stats (
  date TEXT PRIMARY KEY,            -- YYYY-MM-DD
  registrations INTEGER DEFAULT 0,
  emails_received INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0
);
