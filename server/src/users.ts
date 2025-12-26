import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import type { User, Users } from './types.js';

let users: Users = {};

export function loadUsers(): void {
  try {
    const dir = path.dirname(config.usersFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(config.usersFile)) {
      users = JSON.parse(fs.readFileSync(config.usersFile, 'utf8'));
      console.log(`[Users] Loaded ${Object.keys(users).length} users`);
    }
  } catch (e) {
    console.error('[Users] Failed to load:', e);
    users = {};
  }
}

export function saveUsers(): void {
  try {
    const dir = path.dirname(config.usersFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(config.usersFile, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('[Users] Failed to save:', e);
  }
}

export function getUsers(): Users {
  return users;
}

export function getUser(userId: number): User | undefined {
  return users[userId];
}

export function trackUser(userId: number, firstName: string, username?: string): boolean {
  const now = Date.now();
  const isNew = !users[userId];

  users[userId] = {
    firstName: firstName || users[userId]?.firstName || 'Player',
    username: username || users[userId]?.username || null,
    lastActive: now,
    lastSpinReminder: users[userId]?.lastSpinReminder || 0,
    lastInactiveReminder: users[userId]?.lastInactiveReminder || 0,
  };

  saveUsers();

  if (isNew) {
    const displayName = username ? `@${username}` : firstName;
    console.log(`[Users] 🆕 New user: ${displayName} (${userId})`);
  }

  return isNew;
}

export function updateUserActivity(userId: number): void {
  if (users[userId]) {
    users[userId].lastActive = Date.now();
    saveUsers();
  }
}

export function updateUserReminder(userId: number, type: 'spin' | 'inactive'): void {
  if (users[userId]) {
    const key = type === 'spin' ? 'lastSpinReminder' : 'lastInactiveReminder';
    users[userId][key] = Date.now();
    saveUsers();
  }
}
