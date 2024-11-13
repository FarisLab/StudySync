import { Db } from 'mongodb';
import { connectToDatabase } from './mongodb';

let cachedDb: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const { db } = await connectToDatabase();
  cachedDb = db;
  return db;
} 