// ClawdEmail Database Operations

import type { Agent, Email, EmailSummary } from './types';
import { generateToken, hashToken } from './auth';
import { generateName, isValidName } from './names';

// Create a new agent mailbox
export async function createAgent(
  db: D1Database,
  secret: string,
  customName?: string
): Promise<{ id: string; token: string } | { error: string }> {
  // Use custom name or generate one
  const id = customName?.toLowerCase() || generateName();
  
  // Validate custom name if provided
  if (customName && !isValidName(customName.toLowerCase())) {
    return { error: 'Invalid name. Use 3-30 chars, lowercase alphanumeric and hyphens.' };
  }
  
  const token = generateToken();
  const tokenHash = await hashToken(token, secret);
  const now = Date.now();
  
  // Try to insert
  try {
    await db.prepare(`
      INSERT INTO agents (id, token_hash, created_at, email_count)
      VALUES (?, ?, ?, 0)
    `).bind(id, tokenHash, now).run();
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint failed')) {
      if (customName) {
        return { error: 'Name already taken. Try another.' };
      }
      // Retry with new generated name
      return createAgent(db, secret);
    }
    throw e;
  }
  
  return { id, token };
}

// Store incoming email
export async function storeEmail(
  db: D1Database,
  agentId: string,
  email: {
    from: string;
    fromName?: string;
    to: string;
    subject?: string;
    textBody?: string;
    htmlBody?: string;
    headers?: Record<string, string>;
    size?: number;
  }
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  
  await db.batch([
    db.prepare(`
      INSERT INTO emails (id, agent_id, from_addr, from_name, to_addr, subject, body_text, body_html, headers, size_bytes, received_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      agentId,
      email.from,
      email.fromName || null,
      email.to,
      email.subject || null,
      email.textBody || null,
      email.htmlBody || null,
      email.headers ? JSON.stringify(email.headers) : null,
      email.size || null,
      now
    ),
    db.prepare(`
      UPDATE agents SET email_count = email_count + 1 WHERE id = ?
    `).bind(agentId)
  ]);
  
  return id;
}

// Get agent's inbox
export async function getInbox(
  db: D1Database,
  agentId: string,
  limit = 50,
  offset = 0
): Promise<EmailSummary[]> {
  const results = await db.prepare(`
    SELECT id, from_addr, from_name, subject, received_at, read_at
    FROM emails
    WHERE agent_id = ? AND deleted_at IS NULL
    ORDER BY received_at DESC
    LIMIT ? OFFSET ?
  `).bind(agentId, limit, offset).all<Email>();
  
  return results.results.map(e => ({
    id: e.id,
    from: e.from_name ? `${e.from_name} <${e.from_addr}>` : e.from_addr,
    subject: e.subject,
    received_at: e.received_at,
    read: e.read_at !== null
  }));
}

// Get single email
export async function getEmail(
  db: D1Database,
  agentId: string,
  emailId: string
): Promise<Email | null> {
  const email = await db.prepare(`
    SELECT * FROM emails
    WHERE id = ? AND agent_id = ? AND deleted_at IS NULL
  `).bind(emailId, agentId).first<Email>();
  
  if (email && !email.read_at) {
    // Mark as read
    await db.prepare(
      'UPDATE emails SET read_at = ? WHERE id = ?'
    ).bind(Date.now(), emailId).run();
    email.read_at = Date.now();
  }
  
  return email;
}

// Delete email (soft delete)
export async function deleteEmail(
  db: D1Database,
  agentId: string,
  emailId: string
): Promise<boolean> {
  const result = await db.prepare(`
    UPDATE emails SET deleted_at = ?
    WHERE id = ? AND agent_id = ? AND deleted_at IS NULL
  `).bind(Date.now(), emailId, agentId).run();
  
  if (result.meta.changes > 0) {
    await db.prepare(
      'UPDATE agents SET email_count = email_count - 1 WHERE id = ? AND email_count > 0'
    ).bind(agentId).run();
    return true;
  }
  return false;
}

// Find agent by email address
export async function findAgentByEmail(
  db: D1Database,
  email: string,
  domain: string
): Promise<Agent | null> {
  // Extract ID from email like "swift-coral-42@clawdemail.com" or "ax7k2m9p@clawdemail.com"
  const match = email.toLowerCase().match(new RegExp(`^([a-z0-9-]+)@${domain.replace('.', '\\.')}$`));
  if (!match) return null;
  
  return db.prepare('SELECT * FROM agents WHERE id = ?').bind(match[1]).first<Agent>();
}

// Get agent stats
export async function getAgentStats(
  db: D1Database,
  agentId: string
): Promise<{ email_count: number; unread_count: number }> {
  const result = await db.prepare(`
    SELECT 
      (SELECT email_count FROM agents WHERE id = ?) as email_count,
      (SELECT COUNT(*) FROM emails WHERE agent_id = ? AND read_at IS NULL AND deleted_at IS NULL) as unread_count
  `).bind(agentId, agentId).first<{ email_count: number; unread_count: number }>();
  
  return result || { email_count: 0, unread_count: 0 };
}

// Cleanup emails older than specified minutes (hard delete)
export async function cleanupOldEmails(
  db: D1Database,
  retentionMinutes: number = 30
): Promise<{ deleted: number }> {
  const cutoffTime = Date.now() - (retentionMinutes * 60 * 1000);
  
  // Get count of emails to delete
  const countResult = await db.prepare(`
    SELECT COUNT(*) as count FROM emails WHERE received_at < ?
  `).bind(cutoffTime).first<{ count: number }>();
  
  const toDelete = countResult?.count || 0;
  
  if (toDelete > 0) {
    // Update agent email counts
    await db.prepare(`
      UPDATE agents SET email_count = (
        SELECT COUNT(*) FROM emails 
        WHERE agent_id = agents.id AND received_at >= ? AND deleted_at IS NULL
      )
    `).bind(cutoffTime).run();
    
    // Hard delete old emails
    await db.prepare(`
      DELETE FROM emails WHERE received_at < ?
    `).bind(cutoffTime).run();
  }
  
  return { deleted: toDelete };
}
