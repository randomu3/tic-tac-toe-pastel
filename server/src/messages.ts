export const MESSAGES = {
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
/support - Get help`,

  win: (code: string) => `🎉 *VICTORY!* 🎉

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

  spinReminder: (name: string) => `🎡 *Hey ${name}!*

Your daily fortune wheel is ready to spin! 🌟

Come back and try your luck — you could win up to *100 hearts* today! 💝`,

  inactiveReminder: (name: string, days: number) => `💕 *We miss you, ${name}!*

It's been ${days} days since your last game! 😢

Your daily rewards are waiting:
• 🎡 Fortune wheel spin
• 📋 Daily quests
• 💌 Affirmation cards

Come back and play! 🌸`,

  paymentSuccess: (hearts: number) => `🎉 *Payment Successful!*

Thank you for your purchase! 💕

You received *${hearts} Hearts* 💝

Enjoy shopping in the game! 🛍️✨`,

  stats: (user: any) => user ? `📊 *Your Statistics*

👤 Player: ${user.username ? '@' + user.username : user.firstName}
📅 Joined: ${new Date(user.createdAt).toLocaleDateString()}
🕐 Last active: ${new Date(user.lastActive).toLocaleDateString()}

Open the game to see detailed stats! 🎮` : `📊 *Statistics*

Play your first game to start tracking stats! 🎮`,

  daily: `🎁 *Daily Rewards*

Your daily bonuses are waiting! 💕

• 🎡 *Fortune Wheel* — spin for free hearts
• 📋 *Daily Quest* — complete for bonus rewards  
• 💌 *Affirmation Card* — collect wisdom

Tap below to claim your rewards! ✨`,

  shop: `🛍️ *Game Shop*

Customize your game with:

• 🎨 *Themes* — Classic, Love, Nature
• 😊 *Stickers* — Express yourself
• 🖼️ *Wallpapers* — Beautiful backgrounds

Pay with Hearts 💝 or buy more with Telegram Stars ⭐`,

  promo: `🎫 *Promo Codes*

*How to get codes:*
Win games against AI to earn unique promo codes!

*How to use:*
1. Open the game
2. Find "Promo Code" section on main screen
3. Enter your 5-letter code
4. Get bonus hearts + 50% shop discount!

*Share with friends:*
Your codes work for others too! 💕`,

  hearts: `💝 *Buy Hearts*

Hearts are the game currency for:
• Unlocking themes
• Buying stickers
• Getting wallpapers

*Packages:*
• 100 Hearts — 10 Stars ⭐
• 500 Hearts — 45 Stars ⭐ (Best value!)
• 1000 Hearts — 80 Stars ⭐

Tap below to purchase! 🛒`,

  about: `🎀 *About Tic-Tac-Toe Pastel*

A cozy mobile game with pastel vibes! 💕

*Features:*
• 4 game modes (Easy, Hard, Zen, 2P)
• Daily rewards & quests
• Shop with themes & stickers
• Promo codes for winners
• Affirmation journal

Made with love 🌸`,

  support: `💬 *Support*

Need help? Here's what to do:

*Common issues:*
• Game not loading — check internet connection
• Lost progress — progress saves automatically
• Payment issues — contact @TelegramSupport

*Feedback:*
We'd love to hear from you! Share your ideas and suggestions.

Happy gaming! 🎮`,
};
