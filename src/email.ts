// ClawdEmail - Email Receiving Worker
// Handles incoming emails via Cloudflare Email Routing

import type { Env } from './types';
import { findAgentByEmail, storeEmail } from './db';

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

// Extract text content from raw email
async function parseEmailBody(raw: ReadableStream): Promise<{ text?: string; html?: string }> {
  const reader = raw.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const rawText = new TextDecoder().decode(
    new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      .map((_, i) => {
        let offset = 0;
        for (const chunk of chunks) {
          if (i < offset + chunk.length) return chunk[i - offset];
          offset += chunk.length;
        }
        return 0;
      })
  );
  
  // Simple parsing - find body after headers
  const headerBodySplit = rawText.indexOf('\r\n\r\n');
  if (headerBodySplit === -1) {
    return { text: rawText };
  }
  
  const body = rawText.slice(headerBodySplit + 4);
  
  // Check content type from headers
  const contentType = rawText.slice(0, headerBodySplit).toLowerCase();
  
  if (contentType.includes('text/html')) {
    return { html: body };
  }
  
  // For multipart, just extract text for now (simplified)
  if (contentType.includes('multipart/')) {
    // Find text/plain part
    const textMatch = body.match(/content-type:\s*text\/plain[^\r\n]*\r\n\r\n([\s\S]*?)(?:\r\n--|\z)/i);
    const htmlMatch = body.match(/content-type:\s*text\/html[^\r\n]*\r\n\r\n([\s\S]*?)(?:\r\n--|\z)/i);
    return {
      text: textMatch?.[1]?.trim(),
      html: htmlMatch?.[1]?.trim()
    };
  }
  
  return { text: body };
}

// Email handler export
export default {
  async email(message: EmailMessage, env: Env): Promise<void> {
    const fromParsed = parseAddress(message.from);
    const toParsed = parseAddress(message.to);
    
    console.log(`Email received: ${message.from} -> ${message.to}`);
    
    // Find the agent by recipient email
    const agent = await findAgentByEmail(env.DB, toParsed.email, env.DOMAIN);
    
    if (!agent) {
      // No such mailbox - reject
      console.log(`Rejecting email to unknown mailbox: ${message.to}`);
      message.setReject('Mailbox does not exist');
      return;
    }
    
    // Parse email body
    const { text, html } = await parseEmailBody(message.raw);
    
    // Extract headers
    const headers: Record<string, string> = {};
    message.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Store the email
    const emailId = await storeEmail(env.DB, agent.id, {
      from: fromParsed.email,
      fromName: fromParsed.name,
      to: toParsed.email,
      subject: message.headers.get('subject') || undefined,
      textBody: text,
      htmlBody: html,
      headers: headers,
      size: message.rawSize
    });
    
    console.log(`Stored email ${emailId} for agent ${agent.id}`);
  }
};
