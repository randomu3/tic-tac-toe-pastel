import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { router } from './routes.js';
import { loadUsers } from './users.js';
import { startReminderScheduler } from './reminders.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(router);

// Load users and start server
loadUsers();

app.listen(config.port, () => {
  console.log(`[Server] Running on http://localhost:${config.port}`);
  console.log('[Server] Endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  GET  /api/packages - Get hearts packages');
  console.log('  POST /api/create-invoice - Create Stars invoice');
  console.log('  POST /api/notify - Send notifications');
  console.log('  POST /webhook - Telegram webhook');

  startReminderScheduler();
});

export { app };
