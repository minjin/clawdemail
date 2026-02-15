// Verification Code Extraction

// Common patterns for verification codes
const CODE_PATTERNS = [
  // "验证码：123456" or "验证码: 123456" or "验证码是 123456"
  /验证码[：:\s是为]+([A-Za-z0-9]{4,8})/i,
  // "code: 123456" or "code is 123456"
  /\bcode[:\s]+is[:\s]*([A-Za-z0-9]{4,8})\b/i,
  /\bcode[:\s]+([A-Za-z0-9]{4,8})\b/i,
  // "verification code: 123456"
  /verification\s*code[:\s]+([A-Za-z0-9]{4,8})/i,
  // "confirmation code: 123456"
  /confirmation\s*code[:\s]+([A-Za-z0-9]{4,8})/i,
  // "OTP: 123456" or "OTP is 123456"
  /\bOTP[:\s]+([A-Za-z0-9]{4,8})\b/i,
  // "PIN: 1234"
  /\bPIN[:\s]+([0-9]{4,8})\b/i,
  // "passcode: 123456"
  /\bpasscode[:\s]+([A-Za-z0-9]{4,8})\b/i,
  // "security code: 123456"
  /security\s*code[:\s]+([A-Za-z0-9]{4,8})/i,
  // "one-time password: 123456"
  /one[- ]?time\s*(password|code)[:\s]+([A-Za-z0-9]{4,8})/i,
  // "Your code is: 123456" or "Your code: 123456"
  /your\s*(verification\s*)?code[:\s]+is[:\s]*([A-Za-z0-9]{4,8})/i,
  /your\s*(verification\s*)?code[:\s]+([A-Za-z0-9]{4,8})/i,
  // "Enter 123456 to verify"
  /enter\s+([A-Za-z0-9]{4,8})\s+to\s+(verify|confirm|complete)/i,
  // "use 123456 as your"
  /use\s+([A-Za-z0-9]{4,8})\s+as\s+your/i,
  // Standalone 6-digit code (common format) - be careful with this one
  /\b(\d{6})\b/,
];

// Keywords that indicate an email contains a verification code
const CODE_KEYWORDS = [
  'verification', 'verify', 'code', 'confirm', 'otp', 'pin',
  'passcode', 'one-time', 'security code', '验证码', '验证',
  'authenticate', 'login code', 'sign in code', 'access code'
];

export function extractVerificationCode(text: string): string | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // First check if the email likely contains a code
  const hasKeyword = CODE_KEYWORDS.some(kw => lowerText.includes(kw.toLowerCase()));
  
  // Try each pattern
  for (const pattern of CODE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Get the last captured group (some patterns have multiple groups)
      const code = match[match.length - 1];
      // Validate: should be 4-8 chars, alphanumeric
      if (code && /^[A-Za-z0-9]{4,8}$/.test(code)) {
        return code;
      }
    }
  }
  
  // If we have keywords but no match yet, try to find standalone 6-digit codes
  if (hasKeyword) {
    const sixDigitMatch = text.match(/\b(\d{6})\b/);
    if (sixDigitMatch) {
      return sixDigitMatch[1];
    }
  }
  
  return null;
}

// Extract from both text and HTML, prefer text
export function extractCode(textBody?: string | null, htmlBody?: string | null): string | null {
  // Try text body first
  if (textBody) {
    const code = extractVerificationCode(textBody);
    if (code) return code;
  }
  
  // Try HTML body (strip tags first)
  if (htmlBody) {
    const strippedHtml = htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const code = extractVerificationCode(strippedHtml);
    if (code) return code;
  }
  
  return null;
}

// Keywords that indicate a verification/action link
const LINK_KEYWORDS = [
  'verify', 'confirm', 'activate', 'validate', 'reset',
  'unsubscribe', 'opt-out', 'click here', 'click to',
  'token=', 'code=', 'key=', 'auth=', 'session=',
  'magic', 'login', 'signin', 'sign-in', 'signup', 'sign-up',
  'accept', 'approve', 'complete', 'finish'
];

// Extract verification/action links from HTML
function extractLinksFromHtml(html: string): string[] {
  const links: string[] = [];
  
  // Match href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1];
    // Filter out common non-verification links
    if (url.startsWith('mailto:')) continue;
    if (url.startsWith('#')) continue;
    if (url === '/') continue;
    if (url.length < 20) continue; // Too short to be a verification link
    
    // Check if URL contains verification keywords
    const lowerUrl = url.toLowerCase();
    const hasKeyword = LINK_KEYWORDS.some(kw => lowerUrl.includes(kw));
    
    if (hasKeyword) {
      links.push(url);
    }
  }
  
  return links;
}

// Extract links from plain text
function extractLinksFromText(text: string): string[] {
  const links: string[] = [];
  
  // Match URLs
  const urlRegex = /https?:\/\/[^\s<>"')\]]+/gi;
  let match;
  
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    if (url.length < 20) continue;
    
    const lowerUrl = url.toLowerCase();
    const hasKeyword = LINK_KEYWORDS.some(kw => lowerUrl.includes(kw));
    
    if (hasKeyword) {
      links.push(url);
    }
  }
  
  return links;
}

// Extract verification links from email
export function extractLinks(textBody?: string | null, htmlBody?: string | null): string[] {
  const links: string[] = [];
  
  // Extract from HTML first (more reliable)
  if (htmlBody) {
    links.push(...extractLinksFromHtml(htmlBody));
  }
  
  // Also try plain text
  if (textBody) {
    links.push(...extractLinksFromText(textBody));
  }
  
  // Deduplicate
  return [...new Set(links)];
}
