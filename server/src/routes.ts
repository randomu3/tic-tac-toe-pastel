import { Router, Request, Response } from 'express';
import { config, HEARTS_PACKAGES, PackageId } from './config.js';
import { MESSAGES } from './messages.js';
import { sendMessage, sendMessageWithButton, createInvoiceLink, answerPreCheckoutQuery } from './telegram.js';
import { trackUser, getUser, updateUserActivity, getUsers } from './users.js';
import type { NotifyRequest, CreateInvoiceRequest, TelegramUpdate } from './types.js';

export const router = Router();

// Root - redirect to health or show info
router.get('/', (_req: Request, res: Response) => {
  res.json({ 
    name: 'Tic-Tac-Toe Pastel API',
    version: '1.0.0',
    endpoints: ['/health', '/api/packages', '/api/notify', '/webhook']
  });
});

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', users: Object.keys(getUsers()).length });
});

// Get packages
router.get('/api/packages', (_req: Request, res: Response) => {
  res.json(HEARTS_PACKAGES);
});

// Create invoice
router.post('/api/create-invoice', async (req: Request<{}, {}, CreateInvoiceRequest>, res: Response) => {
  const { userId, packageId } = req.body;
  const pkg = HEARTS_PACKAGES[packageId as PackageId];

  if (!pkg) {
    res.status(400).json({ error: 'Invalid package' });
    return;
  }

  const invoiceLink = await createInvoiceLink(userId, packageId, pkg);

  if (invoiceLink) {
    res.json({ success: true, invoiceLink });
  } else {
    res.status(400).json({ error: 'Failed to create invoice' });
  }
});

// Send notification from game
router.post('/api/notify', async (req: Request<{}, {}, NotifyRequest>, res: Response) => {
  const { chatId, message, type, code } = req.body;

  if (!chatId) {
    res.status(400).json({ error: 'chatId required' });
    return;
  }

  // Track activity and log
  const user = getUser(chatId);
  if (user) {
    updateUserActivity(chatId);
    const displayUser = user.username ? `@${user.username}` : user.firstName;
    console.log(`[Game] ${displayUser} → ${type || 'notify'}`);
  }

  let text = message || '';
  let withButton = false;

  if (type === 'win' && code) {
    text = MESSAGES.win(code);
    withButton = true;
  } else if (type === 'lose') {
    text = MESSAGES.lose;
    withButton = true;
  }

  const result = withButton
    ? await sendMessageWithButton(chatId, text, '🎮 Play Again!', config.webappUrl)
    : await sendMessage(chatId, text);

  res.json({ success: true, result });
});

// Telegram webhook
router.post('/webhook', async (req: Request<{}, {}, TelegramUpdate>, res: Response) => {
  const update = req.body;

  try {
    // Handle commands
    if (update.message?.text && update.message.chat && update.message.from) {
      const text = update.message.text;
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const firstName = update.message.from.first_name || 'Player';
      const username = update.message.from.username;

      trackUser(userId, firstName, username);

      const displayUser = username ? `@${username}` : firstName;
      console.log(`[Bot] ${displayUser} → ${text}`);

      const user = getUser(userId);
      const commands: Record<string, () => Promise<any>> = {
        '/start': () => sendMessageWithButton(chatId, MESSAGES.welcome, '🎮 Play Now!', config.webappUrl),
        '/play': () => sendMessageWithButton(chatId, MESSAGES.welcome, '🎮 Play Now!', config.webappUrl),
        '/help': () => sendMessage(chatId, MESSAGES.help),
        '/stats': () => sendMessageWithButton(chatId, MESSAGES.stats(user), '📊 View Full Stats', config.webappUrl, 'stats'),
        '/daily': () => sendMessageWithButton(chatId, MESSAGES.daily, '🎁 Claim Rewards!', config.webappUrl, 'daily'),
        '/shop': () => sendMessageWithButton(chatId, MESSAGES.shop, '🛍️ Open Shop', config.webappUrl, 'shop'),
        '/promo': () => sendMessage(chatId, MESSAGES.promo),
        '/hearts': () => sendMessageWithButton(chatId, MESSAGES.hearts, '💝 Buy Hearts', config.webappUrl, 'hearts'),
        '/about': () => sendMessage(chatId, MESSAGES.about),
        '/support': () => sendMessage(chatId, MESSAGES.support),
      };

      const handler = commands[text];
      if (handler) await handler();
    }

    // Handle pre-checkout
    if (update.pre_checkout_query) {
      await answerPreCheckoutQuery(update.pre_checkout_query.id, true);
    }

    // Handle successful payment
    if (update.message?.successful_payment) {
      const payload = JSON.parse(update.message.successful_payment.invoice_payload);
      const pkg = HEARTS_PACKAGES[payload.packageId as PackageId];
      if (pkg && update.message.from) {
        await sendMessage(update.message.from.id, MESSAGES.paymentSuccess(pkg.hearts));
      }
    }
  } catch (error) {
    console.error('[Webhook Error]', error);
  }

  res.send('ok');
});
