import { createHash } from 'crypto';

export function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hashIp(ip: string): string {
  return hashValue(ip);
}

export function hashSession(ip: string, userAgent: string, date: string, salt: string): string {
  const input = `${date}|${ip}|${userAgent}|${salt}`;
  return hashValue(input);
}

export function sanitizeForStorage(value: string, maxLength: number): string {
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

export function truncateStack(stack: string | undefined, maxLength: number = 2000): string | null {
  if (!stack) return null;
  const sanitized = stack.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  return sanitized.length > maxLength ? sanitized.slice(0, maxLength) + '...' : sanitized;
}
