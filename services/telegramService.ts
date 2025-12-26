// Telegram WebApp API
const TG = (window as any).Telegram?.WebApp;

// Backend API URL
const API_URL = 'https://tictactoe-api.ru.tuna.am';

export const triggerHaptic = (
  style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
) => {
  if (TG?.HapticFeedback) {
    TG.HapticFeedback.impactOccurred(style);
  }
};

export const triggerNotification = (type: 'error' | 'success' | 'warning') => {
  if (TG?.HapticFeedback) {
    TG.HapticFeedback.notificationOccurred(type);
  }
};

export const getTelegramUserId = (): number | null => {
  const userId = TG?.initDataUnsafe?.user?.id;
  return userId || null;
};

interface NotifyOptions {
  type?: 'win' | 'lose' | 'promo' | 'general';
  code?: string;
}

export const notifyTelegramBot = async (
  message: string,
  options: NotifyOptions = {}
): Promise<void> => {
  const chatId = getTelegramUserId();

  if (!chatId) {
    console.warn('[Telegram] No user ID - must open from Telegram app');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        message,
        type: options.type,
        code: options.code,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('[Telegram] Message sent successfully');
    } else {
      console.error('[Telegram] Failed:', result.error);
    }
  } catch (error) {
    console.error('[Telegram] Error:', error);
  }
};

// Hearts packages
export interface HeartsPackage {
  stars: number;
  hearts: number;
  title: string;
}

export const getHeartsPackages = async (): Promise<Record<string, HeartsPackage>> => {
  try {
    const response = await fetch(`${API_URL}/api/packages`);
    return await response.json();
  } catch (error) {
    console.error('[Telegram] Failed to get packages:', error);
    return {};
  }
};

export const purchaseHearts = async (
  packageId: string,
  onSuccess: (hearts: number) => void
): Promise<boolean> => {
  const userId = getTelegramUserId();

  if (!userId) {
    console.warn('[Telegram] No user ID for purchase');
    return false;
  }

  if (!TG?.openInvoice) {
    console.warn('[Telegram] openInvoice not available');
    return false;
  }

  try {
    // Get invoice link from backend
    const response = await fetch(`${API_URL}/api/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, packageId }),
    });

    const data = await response.json();

    if (!data.success || !data.invoiceLink) {
      console.error('[Telegram] Failed to create invoice');
      return false;
    }

    // Open Telegram payment dialog
    TG.openInvoice(data.invoiceLink, (status: string) => {
      console.log('[Telegram] Payment status:', status);
      if (status === 'paid') {
        // Payment successful - get hearts amount from packages
        getHeartsPackages().then((packages) => {
          const pkg = packages[packageId];
          if (pkg) {
            onSuccess(pkg.hearts);
          }
        });
      }
    });

    return true;
  } catch (error) {
    console.error('[Telegram] Purchase error:', error);
    return false;
  }
};





