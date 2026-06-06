import 'dotenv/config';
import { z } from 'zod';
import { fatal } from '@/utils/fatal';

const EnvSchema = z.object({
  MOCK:                     z.enum(['true', 'false']).transform((v) => v === 'true'),
  COMPANYRICH_API_KEY:      z.string().min(1),
  PROSPEO_API_KEY:          z.string().min(1),
  COMPANYRICH_BASE_URL:     z.url(),
  COMPANYRICH_MAX_ATTEMPTS: z.coerce.number().int().min(1),
  COMPANYRICH_BACKOFF_MS:   z.coerce.number().int().min(0),
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
