import { config } from './config.js';
import { MESSAGES } from './messages.js';
import { sendMessageWithButton } from './telegram.js';
import { getUsers, updateUserReminder } from './users.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = 3 * ONE_DAY;

export async function sendReminders(): Promise<void> {
  const now = Date.now();
  const users = getUsers();

  console.log(`[Reminders] Checking ${Object.keys(users).length} users...`);

  for (const [oderId, user] of Object.entries(users)) {
    const timeSinceActive = now - user.lastActive;
    const daysSinceActive = Math.floor(timeSinceActive / ONE_DAY);

    // Daily spin reminder (once per day, if user was active in last 3 days)
    if (timeSinceActive < THREE_DAYS && now - user.lastSpinReminder > ONE_DAY) {
      try {
        await sendMessageWithButton(
          parseInt(oderId),
          MESSAGES.spinReminder(user.firstName),
          '🎡 Spin Now!',
          config.webappUrl
        );
        updateUserReminder(parseInt(oderId), 'spin');
        console.log(`[Reminders] Spin reminder sent to ${user.username ? '@' + user.username : user.firstName}`);
      } catch (e) {
        console.error(`[Reminders] Failed to send spin reminder to ${oderId}`);
      }
    }

    // Inactive reminder (after 3 days, once per 3 days)
    if (daysSinceActive >= 3 && now - user.lastInactiveReminder > THREE_DAYS) {
      try {
        await sendMessageWithButton(
          parseInt(oderId),
          MESSAGES.inactiveReminder(user.firstName, daysSinceActive),
          '🎮 Play Now!',
          config.webappUrl
        );
        updateUserReminder(parseInt(oderId), 'inactive');
        console.log(`[Reminders] Inactive reminder sent to ${user.username ? '@' + user.username : user.firstName}`);
      } catch (e) {
        console.error(`[Reminders] Failed to send inactive reminder to ${oderId}`);
      }
    }
  }
}

export function startReminderScheduler(): void {
  // Check every hour
  setInterval(sendReminders, 60 * 60 * 1000);
  console.log('[Reminders] Scheduler started (every hour)');
}
