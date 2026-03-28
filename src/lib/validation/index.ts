import { z } from 'zod'

// All admin API route handlers MUST import and use Zod schemas from this
// directory for server-side request validation.
// All admin API route handlers MUST validate request bodies using Zod schemas.
// Add domain-specific schemas here as features are implemented.
export const exampleSchema = z.object({
  id: z.string().cuid(),
})
