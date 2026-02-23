import postgres from 'postgres';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

export function getDb(): ReturnType<typeof postgres> {
  if (!g.__db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    g.__db = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return g.__db;
}
