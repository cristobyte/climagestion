import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL || 'file:local.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations completed!');

  client.close();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
