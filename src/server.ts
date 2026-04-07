/* eslint-disable no-console */
import { Server } from 'http';
import app from './app';
import { connectDb } from './app/config/connectDb';

const port = process.env.PORT || 3000;
let server: Server;

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  if (server) {
    server.close(() => {
      console.error('Server closed due to unhandled rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

const startServer = async () => {
  try {
    await connectDb();
    console.log('Connected to the database successfully');
    server = app.listen(port, () => {
      console.log(`Application is running on port http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
};

(async () => {
  await startServer();
})();

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close(() => {
      console.log('Server closed due to SIGTERM');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  if (server) {
    server.close(() => {
      console.log('Server closed due to SIGINT');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
