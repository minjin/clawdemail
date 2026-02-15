// ClawdEmail Name Generator
// Creates memorable email addresses like: swift-coral-42@clawdemail.com

const adjectives = [
  'swift', 'bright', 'calm', 'bold', 'keen',
  'wild', 'cool', 'warm', 'soft', 'sharp',
  'quick', 'slow', 'deep', 'vast', 'pure',
  'free', 'wise', 'fair', 'true', 'kind',
  'brave', 'glad', 'neat', 'rare', 'safe',
  'vivid', 'crisp', 'fresh', 'light', 'dark',
  'rapid', 'quiet', 'proud', 'humble', 'gentle',
  'fierce', 'silent', 'cosmic', 'lunar', 'solar'
];

const nouns = [
  'coral', 'reef', 'wave', 'tide', 'moon',
  'star', 'cloud', 'storm', 'wind', 'rain',
  'snow', 'frost', 'leaf', 'tree', 'river',
  'lake', 'peak', 'vale', 'dawn', 'dusk',
  'hawk', 'wolf', 'bear', 'fox', 'owl',
  'pine', 'oak', 'fern', 'moss', 'sage',
  'ember', 'spark', 'flame', 'stone', 'sand',
  'claw', 'shell', 'pearl', 'jade', 'ruby'
];

// Generate a random name: adjective-noun-number
export function generateName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

// Validate a custom name (if user provides one)
export function isValidName(name: string): boolean {
  // 3-30 chars, lowercase, alphanumeric, hyphens allowed (not at start/end)
  return /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(name) && !name.includes('--');
}
