import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().default('admin_session'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CONTACT_RECIPIENT_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_SECURE: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().min(1).optional(),
  ANALYTICS_SALT: z.string().min(32).optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}

export const env = loadEnv();

export function getSmtpConfig() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_SECURE ?? false,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM ?? env.SMTP_USER,
  };
}

export function getAnalyticsSalt(): string {
  if (!env.ANALYTICS_SALT) {
    throw new Error('ANALYTICS_SALT is required for analytics features');
  }
  return env.ANALYTICS_SALT;
}

export function getContactRecipientFallback(): string | null {
  return env.CONTACT_RECIPIENT_EMAIL ?? null;
}
