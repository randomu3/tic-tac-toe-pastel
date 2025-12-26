const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST;

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  botToken: process.env.BOT_TOKEN || (isTest ? 'test_token' : ''),
  webappUrl: process.env.WEBAPP_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  usersFile: process.env.USERS_FILE || 'data/users.json',
};

if (!isTest && !config.botToken) {
  throw new Error('Missing required environment variable: BOT_TOKEN');
}

export const HEARTS_PACKAGES = {
  hearts_100: { stars: 10, hearts: 100, title: '100 Hearts 💝' },
  hearts_500: { stars: 45, hearts: 500, title: '500 Hearts 💖' },
  hearts_1000: { stars: 80, hearts: 1000, title: '1000 Hearts 💕' },
} as const;

export type PackageId = keyof typeof HEARTS_PACKAGES;





