import mongoose from 'mongoose';
import config from '.';

let isConnected = false;

export const connectDb = async () => {
  if (isConnected) return;

  const uri = config.db_url;
  if (!uri) {
    throw new Error('DB_URL is not defined in environment variables.');
  }

  await mongoose.connect(uri);
  isConnected = true;
};

