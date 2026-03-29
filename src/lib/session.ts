import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type AdminSessionData = {
  adminId?: string;
  loginTime?: number;
  expiresAt?: number;
};

export type AdminSession = IronSession<AdminSessionData>;

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: process.env.SESSION_COOKIE_NAME ?? 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 28800,
    path: '/',
  },
};

export async function getSession(_req?: Request): Promise<AdminSession> {
  return getIronSession<AdminSessionData>(cookies(), sessionOptions);
}

export async function requireSession(_req?: Request): Promise<AdminSession | NextResponse> {
  const session = await getSession();

  if (!session.adminId || !session.expiresAt || session.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return session;
}
