import 'dotenv/config';
import { z } from 'zod';
import { fatal } from '@/utils/fatal.ts';

const EnvSchema = z.object({
  APOLLO_API_KEY: z.string().min(1),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
  fatal('Missing required environment variables', {
    got:  missing,
    hint: 'Check your .env file.',
  });
}

export const config = result.data;
