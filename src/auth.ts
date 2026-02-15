// ClawdEmail Auth Module

import type { Env, Agent } from './types';

// Moved to names.ts - use generateName() instead

// Generate a secure token (32 bytes = 64 hex chars)
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Hash token with secret (for storage)
export async function hashToken(token: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(token + secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

// Verify token and return agent
export async function verifyToken(
  db: D1Database,
  token: string,
  secret: string
): Promise<Agent | null> {
  const hash = await hashToken(token, secret);
  
  const result = await db.prepare(
    'SELECT * FROM agents WHERE token_hash = ?'
  ).bind(hash).first<Agent>();
  
  if (result) {
    // Update last access
    await db.prepare(
      'UPDATE agents SET last_access = ? WHERE id = ?'
    ).bind(Date.now(), result.id).run();
  }
  
  return result;
}

// Extract token from Authorization header
export function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth) return null;
  
  // Support: "Bearer <token>" or just "<token>"
  const match = auth.match(/^(?:Bearer\s+)?([a-f0-9]{64})$/i);
  return match ? match[1] : null;
}

// Rate limiting check
export async function checkRateLimit(
  db: D1Database,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean old entries and get current count
  const result = await db.prepare(`
    INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE 
        WHEN window_start < ? THEN 1 
        ELSE count + 1 
      END,
      window_start = CASE 
        WHEN window_start < ? THEN ? 
        ELSE window_start 
      END
    RETURNING count
  `).bind(key, now, windowStart, windowStart, now).first<{ count: number }>();
  
  const count = result?.count || 1;
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count)
  };
}
