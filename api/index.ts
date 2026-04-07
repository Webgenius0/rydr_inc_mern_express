import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { connectDb } from '../src/app/config/connectDb';

let dbReadyPromise: Promise<void> | null = null;

const ensureDbReady = async () => {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDb();
  }
  await dbReadyPromise;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureDbReady();
  return app(req, res);
}

