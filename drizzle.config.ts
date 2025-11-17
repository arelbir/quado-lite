import { config } from 'dotenv';
import { resolve } from 'path';
import type { Config } from 'drizzle-kit';

// Load .env.local first (higher priority), then .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

export default {
  dialect: "postgresql",
  out: './src/core/database/migrations',
  schema: './src/core/database/schema/index.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
} satisfies Config;