import { getAnalyticsSalt } from '@/lib/config/env';
import { hashSession } from '@/lib/security/hash';

export function buildSessionHash(params: { ip: string; userAgent: string }): string {
  const date = new Date().toISOString().split('T')[0] ?? '';
  const salt = getAnalyticsSalt();
  return hashSession(params.ip, params.userAgent, date, salt);
}
