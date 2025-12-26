import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { router } from './routes.js';

// Mock telegram module
vi.mock('./telegram.js', () => ({
  sendMessage: vi.fn().mockResolvedValue({ ok: true }),
  sendMessageWithButton: vi.fn().mockResolvedValue({ ok: true }),
  createInvoiceLink: vi.fn().mockResolvedValue('https://t.me/invoice/xxx'),
  answerPreCheckoutQuery: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock users module
vi.mock('./users.js', () => ({
  trackUser: vi.fn().mockReturnValue(false),
  getUser: vi.fn().mockReturnValue({ firstName: 'Test', username: 'testuser', lastActive: Date.now() }),
  updateUserActivity: vi.fn(),
  getUsers: vi.fn().mockReturnValue({}),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('API Routes', () => {
  describe('GET /health', () => {
    it('should return ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/packages', () => {
    it('should return hearts packages', async () => {
      const res = await request(app).get('/api/packages');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hearts_100');
      expect(res.body).toHaveProperty('hearts_500');
      expect(res.body).toHaveProperty('hearts_1000');
      expect(res.body.hearts_100.hearts).toBe(100);
      expect(res.body.hearts_500.stars).toBe(45);
    });
  });

  describe('POST /api/create-invoice', () => {
    it('should create invoice for valid package', async () => {
      const res = await request(app)
        .post('/api/create-invoice')
        .send({ userId: 123, packageId: 'hearts_100' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.invoiceLink).toBeDefined();
    });

    it('should reject invalid package', async () => {
      const res = await request(app)
        .post('/api/create-invoice')
        .send({ userId: 123, packageId: 'invalid' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid package');
    });
  });

  describe('POST /api/notify', () => {
    it('should require chatId', async () => {
      const res = await request(app)
        .post('/api/notify')
        .send({ message: 'test' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('chatId required');
    });

    it('should send notification', async () => {
      const res = await request(app)
        .post('/api/notify')
        .send({ chatId: 123, message: 'Hello' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle win type', async () => {
      const res = await request(app)
        .post('/api/notify')
        .send({ chatId: 123, type: 'win', code: 'ABC12' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle lose type', async () => {
      const res = await request(app)
        .post('/api/notify')
        .send({ chatId: 123, type: 'lose' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /webhook', () => {
    it('should handle /start command', async () => {
      const res = await request(app)
        .post('/webhook')
        .send({
          message: {
            text: '/start',
            chat: { id: 123 },
            from: { id: 123, first_name: 'Test', username: 'testuser' },
          },
        });
      
      expect(res.status).toBe(200);
      expect(res.text).toBe('ok');
    });

    it('should handle pre_checkout_query', async () => {
      const res = await request(app)
        .post('/webhook')
        .send({
          pre_checkout_query: {
            id: 'query123',
            from: { id: 123 },
            invoice_payload: '{"packageId":"hearts_100"}',
          },
        });
      
      expect(res.status).toBe(200);
    });
  });
});
