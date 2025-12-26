<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Telegram-Mini%20App-26A5E4?style=for-the-badge&logo=telegram" alt="Telegram"/>
</p>

<h1 align="center">Tic-Tac-Toe Pastel</h1>

<p align="center">
  <strong>A cozy tic-tac-toe game with pastel aesthetics</strong><br>
  Telegram Mini App featuring gamification, achievements, and rewards
</p>

<p align="center">
  <a href="https://t.me/TicTacToe_3242_robot">
    <img src="https://img.shields.io/badge/Play%20Now-Telegram-26A5E4?style=for-the-badge" alt="Play"/>
  </a>
</p>

---

## Features

### Game Modes
- **Classic** - Standard tic-tac-toe against AI (easy/hard difficulty) or local two-player mode
- **Zen Mode** - Infinite gameplay where oldest moves fade after 3 moves per player

### Economy and Engagement
- **Hearts** - In-game currency for purchases
- **Fortune Wheel** - Daily rewards with randomized prizes
- **Daily Quests** - Tasks with progress tracking and rewards
- **Achievements** - Unlockable badges for gameplay milestones
- **Promo Codes** - Generated on wins, redeemable for bonuses

### Customization
- **Themes** - Classic, Love, Nature visual styles
- **Wallpapers** - Dreamy, Midnight, Sakura, Fresh backgrounds
- **Stickers** - Emoji reactions for in-game communication
- **Avatars** - Cute animal characters (cat, dog, rabbit, etc.)
- **Affirmations** - Collectible cards with positive messages

### AI Opponent
- Minimax algorithm for hard difficulty
- Reactive phrases and emotions
- Adaptive difficulty levels

---

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6 |
| **Styling** | Tailwind CSS (utility-first) |
| **Icons** | Lucide React |
| **Audio** | Web Audio API (synthesized sounds) |
| **Storage** | LocalStorage |
| **Platform** | Telegram WebApp API |
| **Backend** | Express.js, Node.js |
| **Deployment** | Docker, Docker Compose |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/randomu3/tic-tac-toe-pastel.git
cd tic-tac-toe-pastel

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

### Docker Deployment

```bash
# Copy environment template
cp .env.example .env

# Configure required variables in .env
# BOT_TOKEN, TUNA_TOKEN, etc.

# Start the full stack
docker-compose up -d
```

---

## Project Structure

```
├── App.tsx              # Main component - state management, game loop
├── index.tsx            # React entry point
├── types.ts             # TypeScript types and interfaces
├── components/          # UI components
│   ├── Cell.tsx         # Game board cell
│   ├── CardReveal.tsx   # Affirmation card animation
│   ├── Decorations.tsx  # Background decorations and particles
│   ├── FortuneWheel.tsx # Daily reward wheel
│   ├── JournalModal.tsx # Affirmation journal
│   ├── LivingAvatar.tsx # Animated avatar
│   ├── Overlay.tsx      # Win/lose overlays
│   └── StatsModal.tsx   # Statistics modal
├── services/            # Business logic
│   ├── gameLogic.ts     # Game rules, AI (minimax), configs
│   ├── audioService.ts  # Web Audio API sounds
│   ├── storage.ts       # LocalStorage persistence
│   └── telegramService.ts # Telegram WebApp API wrapper
├── server/              # Backend API
│   └── src/
│       └── index.ts     # Express server
└── docker-compose.yml   # Docker configuration
```

---

## Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend

```bash
cd server
npm install
npm run dev      # Start with hot-reload
npm run test     # Run tests
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Required
BOT_TOKEN=your_telegram_bot_token

# Optional (for tunnel deployment)
TUNA_TOKEN=your_tuna_token
TUNA_FRONTEND_SUBDOMAIN=your-frontend-subdomain
TUNA_BACKEND_SUBDOMAIN=your-backend-subdomain
WEBAPP_URL=https://your-frontend-url
BACKEND_URL=https://your-backend-url
```

---

## Telegram Mini App Setup

### 1. Create a Bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/newbot` and follow the prompts
3. Save the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Configure the Mini App

Send these commands to @BotFather:

```
/setmenubutton
```
Select your bot, then choose "Configure menu button" and set:
- Button text: `Play Game`
- Web App URL: Your deployed frontend URL

Alternatively, use the Telegram Bot API:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Play Game",
      "web_app": {"url": "https://your-frontend-url"}
    }
  }'
```

### 3. Set Up Webhook

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-backend-url/webhook"}'
```

### 4. Configure Bot Commands

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Start the game"},
      {"command": "play", "description": "Quick play"},
      {"command": "stats", "description": "View statistics"},
      {"command": "daily", "description": "Daily rewards"},
      {"command": "shop", "description": "Open shop"},
      {"command": "promo", "description": "Promo codes info"},
      {"command": "hearts", "description": "Hearts balance"},
      {"command": "about", "description": "About the game"},
      {"command": "support", "description": "Get help"}
    ]
  }'
```

---

## Tunnel Deployment with Tuna

[Tuna](https://tuna.am) is a tunneling service that exposes local servers to the internet with custom subdomains.

### Setup

1. Get a Tuna token from [tuna.am](https://tuna.am)

2. Configure environment variables:
```env
TUNA_TOKEN=your_tuna_token
TUNA_FRONTEND_SUBDOMAIN=myapp
TUNA_BACKEND_SUBDOMAIN=myapp-api
```

3. Start with Docker Compose:
```bash
docker-compose up -d
```

Your app will be available at:
- Frontend: `https://myapp.ru.tuna.am`
- Backend: `https://myapp-api.ru.tuna.am`

### Manual Tunnel (Development)

```bash
# Install tuna CLI
# See: https://tuna.am/docs

# Save token
tuna config save-token YOUR_TOKEN

# Start tunnel
tuna http 3000 --subdomain=myapp
```

---

## Achievements

| Achievement | Description |
|-------------|-------------|
| First Steps | Win your first game |
| On Fire | Win 3 games in a row |
| Veteran | Play 20 games |
| Champion | Reach 10 total wins |
| Peacekeeper | Get 5 draws |

---

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Launch the game |
| `/stats` | View player statistics |
| `/daily` | Check daily rewards |
| `/shop` | Open the shop |
| `/promo` | Promo codes information |
| `/hearts` | Hearts balance |
| `/about` | About the application |
| `/support` | Get help |

---

## License

MIT License - feel free to use and modify!

---

<p align="center">
  Built with React and TypeScript
</p>
