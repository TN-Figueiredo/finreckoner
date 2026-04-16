import { z } from 'zod'

const envSchema = z.object({
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Env validation failed:', parsed.error.flatten())
  throw new Error('Invalid env — see above')
}

export const ENV = parsed.data
