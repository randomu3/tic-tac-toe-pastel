import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn().mockReturnValue('{}'),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

// Import after mocking
import { trackUser, getUser, getUsers, updateUserActivity } from './users.js';

describe('Users Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackUser', () => {
    it('should track new user', () => {
      const isNew = trackUser(123, 'John', 'johndoe');
      expect(isNew).toBe(true);
    });

    it('should update existing user', () => {
      trackUser(123, 'John', 'johndoe');
      const isNew = trackUser(123, 'John Updated', 'johndoe');
      expect(isNew).toBe(false);
    });

    it('should handle user without username', () => {
      const isNew = trackUser(456, 'Jane');
      expect(isNew).toBe(true);
      
      const user = getUser(456);
      expect(user?.firstName).toBe('Jane');
      expect(user?.username).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return undefined for non-existent user', () => {
      const user = getUser(999);
      expect(user).toBeUndefined();
    });

    it('should return user data', () => {
      trackUser(789, 'Bob', 'bobby');
      const user = getUser(789);
      
      expect(user).toBeDefined();
      expect(user?.firstName).toBe('Bob');
      expect(user?.username).toBe('bobby');
      expect(user?.lastActive).toBeGreaterThan(0);
    });
  });

  describe('getUsers', () => {
    it('should return all users', () => {
      trackUser(1, 'User1');
      trackUser(2, 'User2');
      
      const users = getUsers();
      expect(Object.keys(users).length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('updateUserActivity', () => {
    it('should update lastActive timestamp', async () => {
      trackUser(100, 'Active');
      const before = getUser(100)?.lastActive || 0;
      
      // Wait a bit
      await new Promise(r => setTimeout(r, 10));
      updateUserActivity(100);
      
      const after = getUser(100)?.lastActive || 0;
      expect(after).toBeGreaterThanOrEqual(before);
    });
  });
});
