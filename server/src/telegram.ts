import { config } from './config.js';

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

export async function telegramApi(method: string, data: object): Promise<TelegramResponse> {
  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function sendMessage(chatId: number, text: string, parseMode = 'Markdown') {
  return telegramApi('sendMessage', { chat_id: chatId, text, parse_mode: parseMode });
}

export async function sendMessageWithButton(chatId: number, text: string, buttonText: string, buttonUrl: string, startParam?: string) {
  const url = startParam ? `${buttonUrl}?startapp=${startParam}` : buttonUrl;
  return telegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: buttonText, web_app: { url } }]],
    },
  });
}

export async function createInvoiceLink(userId: number, packageId: string, pkg: { stars: number; hearts: number; title: string }) {
  const result = await telegramApi('createInvoiceLink', {
    title: pkg.title,
    description: `Get ${pkg.hearts} hearts for your game!`,
    payload: JSON.stringify({ packageId, userId }),
    currency: 'XTR',
    prices: [{ label: pkg.title, amount: pkg.stars }],
  });

  return result.ok ? result.result : null;
}

export async function answerPreCheckoutQuery(queryId: string, ok: boolean) {
  return telegramApi('answerPreCheckoutQuery', {
    pre_checkout_query_id: queryId,
    ok,
  });
}
