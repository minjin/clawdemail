// ClawdEmail - AI Agent Email Service
// Main API Worker

import type { Env, ApiResponse } from './types';
import { extractToken, verifyToken, checkRateLimit } from './auth';
import { createAgent, getInbox, getEmail, deleteEmail, getAgentStats, findAgentByEmail, storeEmail } from './db';
import { HOME_PAGE, SKILL_MD } from './static';
import { extractCode, extractLinks } from './extract';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// JSON response helper
function json(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

// Error response helper
function error(message: string, status = 400, code?: string): Response {
  return json({ success: false, error: message, code }, status);
}

// Email message interface (from Cloudflare)
interface EmailMessage {
  readonly from: string;
  readonly to: string;
  readonly headers: Headers;
  readonly raw: ReadableStream;
  readonly rawSize: number;
  setReject(reason: string): void;
  forward(rcptTo: string, headers?: Headers): Promise<void>;
}

// Parse email address: "Name <email@domain>" -> { name, email }
function parseAddress(addr: string): { name?: string; email: string } {
  const match = addr.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
  if (match) {
    return { name: match[1]?.trim(), email: match[2].toLowerCase() };
  }
  return { email: addr.toLowerCase() };
}

// Decode quoted-printable
function decodeQuotedPrintable(str: string): string {
  return str
    .replace(/=\r?\n/g, '') // soft line breaks
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Decode base64
function decodeBase64(str: string): string {
  try {
    return atob(str.replace(/\s/g, ''));
  } catch {
    return str;
  }
}

// Extract content from a MIME part
function extractPartContent(part: string): { content: string; contentType: string } {
  const headerEnd = part.indexOf('\r\n\r\n');
  if (headerEnd === -1) return { content: part, contentType: 'text/plain' };
  
  const headers = part.slice(0, headerEnd).toLowerCase();
  let content = part.slice(headerEnd + 4);
  
  // Get content type
  const ctMatch = headers.match(/content-type:\s*([^;\r\n]+)/);
  const contentType = ctMatch ? ctMatch[1].trim() : 'text/plain';
  
  // Check encoding
  const encMatch = headers.match(/content-transfer-encoding:\s*([^\r\n]+)/);
  const encoding = encMatch ? encMatch[1].trim().toLowerCase() : '';
  
  // Decode content
  if (encoding === 'base64') {
    content = decodeBase64(content);
  } else if (encoding === 'quoted-printable') {
    content = decodeQuotedPrintable(content);
  }
  
  return { content: content.trim(), contentType };
}

// Parse MIME multipart
function parseMultipart(body: string, boundary: string): { text?: string; html?: string } {
  const parts = body.split(`--${boundary}`);
  let text: string | undefined;
  let html: string | undefined;
  
  for (const part of parts) {
    if (part.trim() === '' || part.trim() === '--') continue;
    
    const { content, contentType } = extractPartContent(part);
    
    if (contentType.includes('text/plain') && !text) {
      text = content;
    } else if (contentType.includes('text/html') && !html) {
      html = content;
    }
  }
  
  return { text, html };
}

// Extract text from raw email stream
async function parseEmailBody(raw: ReadableStream): Promise<{ text?: string; html?: string }> {
  const reader = raw.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  
  const rawText = new TextDecoder().decode(combined);
  const headerBodySplit = rawText.indexOf('\r\n\r\n');
  if (headerBodySplit === -1) return { text: rawText };
  
  const headers = rawText.slice(0, headerBodySplit);
  const body = rawText.slice(headerBodySplit + 4);
  
  // Check for multipart
  const boundaryMatch = headers.match(/boundary="?([^";\r\n]+)"?/i);
  if (boundaryMatch) {
    return parseMultipart(body, boundaryMatch[1]);
  }
  
  // Check content type for single part
  const ctMatch = headers.toLowerCase().match(/content-type:\s*([^;\r\n]+)/);
  const contentType = ctMatch ? ctMatch[1].trim() : 'text/plain';
  
  // Check encoding
  const encMatch = headers.toLowerCase().match(/content-transfer-encoding:\s*([^\r\n]+)/);
  const encoding = encMatch ? encMatch[1].trim() : '';
  
  let content = body;
  if (encoding === 'base64') {
    content = decodeBase64(body);
  } else if (encoding === 'quoted-printable') {
    content = decodeQuotedPrintable(body);
  }
  
  if (contentType.includes('text/html')) {
    return { html: content.trim() };
  }
  return { text: content.trim() };
}

export default {
  // Email handler
  async email(message: EmailMessage, env: Env): Promise<void> {
    const fromParsed = parseAddress(message.from);
    const toParsed = parseAddress(message.to);
    
    console.log(`Email received: ${message.from} -> ${message.to}`);
    
    const agent = await findAgentByEmail(env.DB, toParsed.email, env.DOMAIN);
    
    if (!agent) {
      console.log(`Rejecting: unknown mailbox ${message.to}`);
      message.setReject('Mailbox does not exist');
      return;
    }
    
    const { text, html } = await parseEmailBody(message.raw);
    
    const emailId = await storeEmail(env.DB, agent.id, {
      from: fromParsed.email,
      fromName: fromParsed.name,
      to: toParsed.email,
      subject: message.headers.get('subject') || undefined,
      textBody: text,
      htmlBody: html,
      size: message.rawSize
    });
    
    console.log(`Stored email ${emailId} for agent ${agent.id}`);
  },

  // HTTP handler
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const hostname = url.hostname;

    // Serve static pages on main domain (clawdemail.com or www.clawdemail.com)
    if (hostname === 'clawdemail.com' || hostname === 'www.clawdemail.com') {
      if (path === '/' || path === '/index.html') {
        return new Response(HOME_PAGE, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      if (path === '/skill.md') {
        return new Response(SKILL_MD, {
          headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
        });
      }
      // Redirect other paths to API
      return Response.redirect(`https://api.clawdemail.com${path}`, 302);
    }

    try {
      // Rate limiting by IP
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimit = await checkRateLimit(env.DB, `ip:${ip}`, 100, 60000);
      
      if (!rateLimit.allowed) {
        return error('Rate limit exceeded. Try again in 60 seconds.', 429, 'RATE_LIMITED');
      }

      // === Public Routes ===

      // Health check
      if (path === '/health' || path === '/') {
        return json({ 
          success: true, 
          service: 'ClawdEmail',
          version: '1.0.0',
          domain: env.DOMAIN
        } as any);
      }

      // POST /register - Create new mailbox
      if (method === 'POST' && path === '/register') {
        // Additional rate limit for registration
        const regLimit = await checkRateLimit(env.DB, `reg:${ip}`, 10, 3600000);
        if (!regLimit.allowed) {
          return error('Registration limit exceeded. Max 10 per hour.', 429, 'REG_LIMITED');
        }

        // Parse optional custom name from body
        let customName: string | undefined;
        try {
          const body = await request.json() as { name?: string };
          customName = body.name;
        } catch {
          // No body or invalid JSON - that's fine, we'll generate a name
        }

        const result = await createAgent(env.DB, env.TOKEN_SECRET, customName);
        
        if ('error' in result) {
          return error(result.error, 400, 'INVALID_NAME');
        }
        
        return json({
          success: true,
          email: `${result.id}@${env.DOMAIN}`,
          token: result.token
        }, 201);
      }

      // === Protected Routes (require token) ===

      const token = extractToken(request);
      if (!token) {
        return error('Missing or invalid Authorization header. Use: Bearer <token>', 401, 'UNAUTHORIZED');
      }

      const agent = await verifyToken(env.DB, token, env.TOKEN_SECRET);
      if (!agent) {
        return error('Invalid token', 401, 'INVALID_TOKEN');
      }

      const agentEmail = `${agent.id}@${env.DOMAIN}`;

      // GET /inbox - List emails
      if (method === 'GET' && path === '/inbox') {
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        const emails = await getInbox(env.DB, agent.id, limit, offset);
        const stats = await getAgentStats(env.DB, agent.id);
        
        return json({
          success: true,
          email: agentEmail,
          count: stats.email_count,
          unread: stats.unread_count,
          emails: emails
        } as any);
      }

      // GET /email/:id - Get single email
      const emailMatch = path.match(/^\/email\/([a-f0-9-]+)$/i);
      if (method === 'GET' && emailMatch) {
        const email = await getEmail(env.DB, agent.id, emailMatch[1]);
        
        if (!email) {
          return error('Email not found', 404, 'NOT_FOUND');
        }
        
        // Extract verification code and links
        const code = extractCode(email.body_text, email.body_html);
        const links = extractLinks(email.body_text, email.body_html);
        
        return json({
          success: true,
          email: email,
          code: code,           // null if no code found
          links: links.length > 0 ? links : null  // verification/action links
        } as any);
      }

      // DELETE /email/:id - Delete email
      if (method === 'DELETE' && emailMatch) {
        const deleted = await deleteEmail(env.DB, agent.id, emailMatch[1]);
        
        if (!deleted) {
          return error('Email not found', 404, 'NOT_FOUND');
        }
        
        return json({ success: true, deleted: true } as any);
      }

      // GET /stats - Get mailbox stats
      if (method === 'GET' && path === '/stats') {
        const stats = await getAgentStats(env.DB, agent.id);
        
        return json({
          success: true,
          email: agentEmail,
          ...stats
        } as any);
      }

      // 404 for unknown routes
      return error('Not found', 404, 'NOT_FOUND');

    } catch (e: any) {
      console.error('Error:', e);
      return error('Internal server error', 500, 'INTERNAL_ERROR');
    }
  }
};
