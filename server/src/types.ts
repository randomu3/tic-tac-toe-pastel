export interface User {
  firstName: string;
  username: string | null;
  lastActive: number;
  lastSpinReminder: number;
  lastInactiveReminder: number;
}

export interface Users {
  [oderId: string]: User;
}

export interface NotifyRequest {
  chatId: number;
  message?: string;
  type?: 'win' | 'lose' | 'promo' | 'general';
  code?: string;
}

export interface CreateInvoiceRequest {
  userId: number;
  packageId: string;
}

export interface TelegramUpdate {
  message?: {
    text?: string;
    chat?: { id: number };
    from?: {
      id: number;
      first_name?: string;
      username?: string;
    };
    successful_payment?: {
      invoice_payload: string;
    };
  };
  pre_checkout_query?: {
    id: string;
    from: { id: number };
    invoice_payload: string;
  };
}
