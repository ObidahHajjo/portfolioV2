import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be between 2 and 120 characters')
    .max(120, 'Name must be between 2 and 120 characters'),
  email: z
    .string()
    .trim()
    .max(254, 'Email must be at most 254 characters')
    .email('Please enter a valid email address'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
});

export type ContactPayload = z.infer<typeof contactSchema>;

export interface ValidationSuccess {
  success: true;
  data: ContactPayload;
}

export interface ValidationFailure {
  success: false;
  errors: Record<string, string>;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateContactPayload(data: unknown): ValidationResult {
  const result = contactSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}

export function sanitizeForEmail(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

export function formatEmailBody(data: ContactPayload, timestamp: string): string {
  return `
Name: ${sanitizeForEmail(data.name)}
Email: ${sanitizeForEmail(data.email)}
Submitted: ${timestamp}

Message:
${sanitizeForEmail(data.message)}

---
This message was sent via the contact form on your portfolio.
`.trim();
}
