import http from 'http';
import https from 'https';
import fs from 'fs';

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3001;
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('[Server] Error: BOT_TOKEN environment variable is required');
  process.exit(1);
}
const USERS_FILE = 'users.json';

// Store for pending payments (in production use database)
const pendingPayments = new Map();

// User tracking for notifications
let users = {};

// Load users from file
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      console.log(`[Users] Loaded ${Object.keys(users).length} users`);
    }
  } catch (e) {
    console.error('[Users] Failed to load:', e);
    users = {};
  }
}

// Save users to file
function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('[Users] Failed to save:', e);
  }
}

// Track user activity
function trackUser(userId, firstName, username) {
  const now = Date.now();
  const isNew = !users[userId];
  
  users[userId] = {
    firstName: firstName || users[userId]?.firstName || 'Player',
    username: username || users[userId]?.username || null,
    lastActive: now,
    lastSpinReminder: users[userId]?.lastSpinReminder || 0,
    lastInactiveReminder: users[userId]?.lastInactiveReminder || 0
  };
  
  saveUsers();
  
  const displayName = username ? `@${username}` : firstName;
  
  if (isNew) {
    console.log(`[Users] 🆕 New user: ${displayName} (${userId})`);
  }
}

// Load users on startup
loadUsers();

// Hearts packages for purchase
const HEARTS_PACKAGES = {
  'hearts_100': { stars: 10, hearts: 100, title: '100 Hearts 💝' },
  'hearts_500': { stars: 45, hearts: 500, title: '500 Hearts 💖' },
  'hearts_1000': { stars: 80, hearts: 1000, title: '1000 Hearts 💕' },
};

// Beautiful message templates
const MESSAGES = {
  welcome: `🎀 *Welcome to Tic-Tac-Toe Pastel!* 🎀

Hey there, gorgeous! 💕

Ready for some cozy gaming? Play against our cute AI, win games and collect exclusive promo codes for discounts!

✨ *What awaits you:*
• 🎮 Classic Tic-Tac-Toe with pastel vibes
• 🎁 Win = Get a promo code!
• 💝 Collect hearts & unlock themes
• 🎡 Daily fortune wheel
• 📔 Affirmation journal

Tap the button below to start playing! 🌸`,

  help: `📖 *Available Commands*

🎮 *Game Commands:*
/start - Start the game
/play - Quick play button
/stats - View your statistics
/daily - Check daily rewards

💝 *Shop & Rewards:*
/shop - Open the shop
/promo - How to use promo codes
/hearts - Buy hearts with Stars ⭐

ℹ️ *Info:*
/help - Show this message
/about - About the game
/support - Get help

Have fun playing! 🌸`,

  stats: (name) => `📊 *Your Statistics*

👤 Player: *${name}*

Use the game to see detailed stats including:
• 🏆 Total wins, losses, draws
• 🔥 Win streaks
• 💝 Hearts balance
• 🎖️ Achievements

Tap below to check your full profile! 🌟`,

  daily: `🎁 *Daily Rewards*

Every day you can get free rewards:

🎡 *Fortune Wheel*
Spin once daily for free hearts!
Prizes: 5, 10, 25, 50, or 100 hearts

📋 *Daily Quests*
Complete tasks to earn +50 hearts:
• Play games
• Win matches
• Get draw results

💌 *Affirmation Cards*
Win a game to unlock a daily positive message!

Open the game to claim your rewards! 🌸`,

  shop: `🛍️ *Game Shop*

Spend your hearts on cute items:

🎨 *Themes* (50-150 💝)
• Classic, Love, Nature styles

😊 *Stickers* (25-75 💝)
• Express yourself in game!

🖼️ *Wallpapers* (100-200 💝)
• Beautiful backgrounds

⭐ *Buy Hearts with Stars:*
• 100 💝 = 10 ⭐
• 500 💝 = 45 ⭐ (Best value!)
• 1000 💝 = 80 ⭐

Open the game to start shopping! 🛒`,

  promo: `🎫 *Promo Codes*

Win games to earn exclusive promo codes!

*How it works:*
1. 🎮 Play and win against AI
2. 🎉 Get a 5-digit promo code
3. 📱 Enter it in the game menu
4. 🎁 Receive rewards!

*Rewards per code:*
• +25 bonus hearts 💝
• 50% discount for 10 minutes 🏷️

Each code can only be used once.
Keep winning to collect more! ✨`,

  hearts: `💝 *Buy Hearts*

Get hearts instantly with Telegram Stars! ⭐

*Packages:*
• 100 💝 = 10 ⭐
• 500 💝 = 45 ⭐ ← Best value!
• 1000 💝 = 80 ⭐

Hearts are used to:
• 🎨 Unlock themes
• 😊 Buy stickers  
• 🖼️ Get wallpapers

Open the game and tap "Get Hearts" to purchase! 🛒`,

  about: `🎀 *About Tic-Tac-Toe Pastel*

A cozy, relaxing tic-tac-toe game designed with love! 💕

*Features:*
• 🎮 Classic gameplay with cute AI
• 🎨 Beautiful pastel aesthetics
• 🎁 Win promo codes for discounts
• 💝 Collect hearts & customize
• 🎡 Daily fortune wheel
• 📔 Affirmation journal
• 🏆 Achievements system

Perfect for a quick break or unwinding after a long day! 🌸

Made with 💖 for you!`,

  support: `💬 *Need Help?*

Having issues? Here's what to try:

*Common solutions:*
• 🔄 Restart the Mini App
• 📱 Update Telegram app
• 🌐 Check internet connection

*Still stuck?*
Describe your issue and we'll help!

Enjoy the game! 🌸`,

  // Reminder messages
  spinReminder: (name) => `🎡 *Hey ${name}!*

Your daily fortune wheel is ready to spin! 🌟

Come back and try your luck — you could win up to *100 hearts* today! 💝

Don't miss your free daily reward! 🎁`,

  inactiveReminder: (name, days) => `💕 *We miss you, ${name}!*

It's been ${days} days since your last game! 😢

Your daily rewards are waiting:
• 🎡 Fortune wheel spin
• 📋 Daily quests
• 💌 Affirmation cards

Come back and play! We saved your progress 🌸`,

  win: (code) => `🎉 *VICTORY!* 🎉

Congratulations, superstar! ⭐

You've defeated the AI and earned a special reward!

🎫 *Your Promo Code:*
\`${code}\`

💝 Use it in the game menu for:
• +25 bonus hearts
• 50% off all shop items (10 min)

Keep winning, keep shining! ✨`,

  lose: `😢 *Better luck next time!*

Don't worry, sweetie! 💕

The AI got lucky this round, but you're amazing and we believe in you!

🌟 *Tips for next game:*
• Try to take the center first
• Watch for AI's winning moves
• Practice makes perfect!

Ready for a rematch? Let's go! 🎮`,

  promoRedeemed: (code) => `✅ *Promo Code Activated!*

Code \`${code}\` successfully redeemed! 🎊

*Your rewards:*
• 💝 +25 Hearts added
• 🏷️ 50% discount active for 10 minutes

Happy shopping! 🛍️✨`,

  paymentSuccess: (hearts) => `🎉 *Payment Successful!*

Thank you for your purchase! 💕

You received *${hearts} Hearts* 💝

Enjoy shopping in the game! 🛍️✨`
};

// Telegram API helper
function telegramApi(method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ ok: false, error: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Send message
async function sendMessage(chatId, text, parseMode = 'Markdown') {
  return telegramApi('sendMessage', { chat_id: chatId, text, parse_mode: parseMode });
}

// Send message with button
async function sendMessageWithButton(chatId, text, buttonText, buttonUrl) {
  return telegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: buttonText, web_app: { url: buttonUrl } }]]
    }
  });
}

// Create invoice link for Stars payment
async function createInvoiceLink(userId, packageId) {
  const pkg = HEARTS_PACKAGES[packageId];
  if (!pkg) return null;

  const result = await telegramApi('createInvoiceLink', {
    title: pkg.title,
    description: `Get ${pkg.hearts} hearts for your game!`,
    payload: JSON.stringify({ packageId, userId }),
    currency: 'XTR', // Telegram Stars
    prices: [{ label: pkg.title, amount: pkg.stars }]
  });

  if (result.ok) {
    return result.result;
  }
  console.error('[Invoice Error]', result);
  return null;
}

// Handle incoming requests
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Get packages list
  if (req.url === '/api/packages') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(HEARTS_PACKAGES));
    return;
  }

  // Create invoice for purchase
  if (req.url === '/api/create-invoice' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { userId, packageId } = JSON.parse(body);
        const invoiceLink = await createInvoiceLink(userId, packageId);
        
        if (invoiceLink) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, invoiceLink }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to create invoice' }));
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Telegram webhook
  if (req.url === '/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        
        // Handle commands
        const text = update.message?.text;
        const chatId = update.message?.chat?.id;
        const userId = update.message?.from?.id;
        const userName = update.message?.from?.first_name || 'Player';
        const userUsername = update.message?.from?.username;
        
        // Track user activity
        if (userId) {
          trackUser(userId, userName, userUsername);
        }
        
        // Log user action
        const displayUser = userUsername ? `@${userUsername}` : userName;
        if (text) {
          console.log(`[Bot] ${displayUser} → ${text}`);
        }
        
        if (text && chatId) {
          switch (text) {
            case '/start':
            case '/play':
              await sendMessageWithButton(chatId, MESSAGES.welcome, '🎮 Play Now!', WEBAPP_URL);
              break;
              
            case '/help':
              await sendMessage(chatId, MESSAGES.help);
              break;
              
            case '/stats':
              await sendMessageWithButton(chatId, MESSAGES.stats(userName), '📊 View Stats', WEBAPP_URL);
              break;
              
            case '/daily':
              await sendMessageWithButton(chatId, MESSAGES.daily, '🎁 Claim Rewards', WEBAPP_URL);
              break;
              
            case '/shop':
              await sendMessageWithButton(chatId, MESSAGES.shop, '🛍️ Open Shop', WEBAPP_URL);
              break;
              
            case '/promo':
              await sendMessageWithButton(chatId, MESSAGES.promo, '🎮 Play to Win', WEBAPP_URL);
              break;
              
            case '/hearts':
              await sendMessageWithButton(chatId, MESSAGES.hearts, '💝 Buy Hearts', WEBAPP_URL);
              break;
              
            case '/about':
              await sendMessageWithButton(chatId, MESSAGES.about, '🎮 Play Now!', WEBAPP_URL);
              break;
              
            case '/support':
              await sendMessage(chatId, MESSAGES.support);
              break;
          }
        }
        
        // Handle pre_checkout_query (must answer within 10 seconds)
        if (update.pre_checkout_query) {
          const query = update.pre_checkout_query;
          console.log('[Payment] Pre-checkout:', query.id);
          
          // Always approve (in production, validate here)
          await telegramApi('answerPreCheckoutQuery', {
            pre_checkout_query_id: query.id,
            ok: true
          });
          
          // Store pending payment
          pendingPayments.set(query.from.id, JSON.parse(query.invoice_payload));
        }
        
        // Handle successful payment
        if (update.message?.successful_payment) {
          const payment = update.message.successful_payment;
          const userId = update.message.from.id;
          const payload = JSON.parse(payment.invoice_payload);
          const pkg = HEARTS_PACKAGES[payload.packageId];
          
          console.log(`[Payment] Success! User ${userId} bought ${pkg?.hearts} hearts`);
          
          // Send confirmation
          await sendMessage(userId, MESSAGES.paymentSuccess(pkg?.hearts || 0));
          
          // Clean up
          pendingPayments.delete(userId);
        }
        
        res.writeHead(200);
        res.end('ok');
      } catch (error) {
        console.error('[Webhook Error]', error);
        res.writeHead(200);
        res.end('ok');
      }
    });
    return;
  }

  // Send notification (from game)
  if (req.url === '/api/notify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { chatId, message, type, code } = JSON.parse(body);
        
        // Track user activity from game and log
        if (chatId && users[chatId]) {
          users[chatId].lastActive = Date.now();
          saveUsers();
          
          const user = users[chatId];
          const displayUser = user.username ? `@${user.username}` : user.firstName;
          console.log(`[Game] ${displayUser} → ${type || 'notify'}`);
        }
        
        if (!chatId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'chatId required' }));
          return;
        }

        let text = message;
        let withButton = false;

        if (type === 'win' && code) {
          text = MESSAGES.win(code);
          withButton = true;
        } else if (type === 'lose') {
          text = MESSAGES.lose;
          withButton = true;
        } else if (type === 'promo' && code) {
          text = MESSAGES.promoRedeemed(code);
        }

        let result;
        if (withButton) {
          result = await sendMessageWithButton(chatId, text, '🎮 Play Again!', WEBAPP_URL);
        } else {
          result = await sendMessage(chatId, text);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, result }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Send reminders to users
async function sendReminders() {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const THREE_DAYS = 3 * ONE_DAY;
  
  console.log(`[Reminders] Checking ${Object.keys(users).length} users...`);
  
  for (const [userId, user] of Object.entries(users)) {
    const timeSinceActive = now - user.lastActive;
    const daysSinceActive = Math.floor(timeSinceActive / ONE_DAY);
    
    // Daily spin reminder (once per day, if user was active in last 3 days)
    if (timeSinceActive < THREE_DAYS && now - user.lastSpinReminder > ONE_DAY) {
      try {
        await sendMessageWithButton(
          userId,
          MESSAGES.spinReminder(user.firstName),
          '🎡 Spin Now!',
          WEBAPP_URL
        );
        users[userId].lastSpinReminder = now;
        console.log(`[Reminders] Spin reminder sent to ${user.firstName}`);
      } catch (e) {
        console.error(`[Reminders] Failed to send spin reminder to ${userId}`);
      }
    }
    
    // Inactive reminder (after 3 days, once per 3 days)
    if (daysSinceActive >= 3 && now - user.lastInactiveReminder > THREE_DAYS) {
      try {
        await sendMessageWithButton(
          userId,
          MESSAGES.inactiveReminder(user.firstName, daysSinceActive),
          '🎮 Play Now!',
          WEBAPP_URL
        );
        users[userId].lastInactiveReminder = now;
        console.log(`[Reminders] Inactive reminder sent to ${user.firstName} (${daysSinceActive} days)`);
      } catch (e) {
        console.error(`[Reminders] Failed to send inactive reminder to ${userId}`);
      }
    }
  }
  
  saveUsers();
}

server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Endpoints:`);
  console.log(`  POST /webhook - Telegram webhook`);
  console.log(`  POST /api/notify - Send notifications`);
  console.log(`  POST /api/create-invoice - Create Stars invoice`);
  console.log(`  GET /api/packages - Get hearts packages`);
  
  // Check reminders every hour
  setInterval(sendReminders, 60 * 60 * 1000);
  console.log(`[Reminders] Scheduler started (every hour)`);
});
