// ClawdEmail Types

export interface Env {
  DB: D1Database;
  DOMAIN: string;
  TOKEN_SECRET: string;
}

export interface Agent {
  id: string;
  token_hash: string;
  created_at: number;
  last_access: number | null;
  email_count: number;
  metadata: string | null;
}

export interface Email {
  id: string;
  agent_id: string;
  from_addr: string;
  from_name: string | null;
  to_addr: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  headers: string | null;
  size_bytes: number | null;
  received_at: number;
  read_at: number | null;
  deleted_at: number | null;
}

export interface EmailSummary {
  id: string;
  from: string;
  subject: string | null;
  received_at: number;
  read: boolean;
}

export interface RegisterResponse {
  success: true;
  email: string;
  token: string;
}

export interface InboxResponse {
  success: true;
  email: string;
  count: number;
  emails: EmailSummary[];
}

export interface EmailResponse {
  success: true;
  email: Email;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse = RegisterResponse | InboxResponse | EmailResponse | ErrorResponse;
