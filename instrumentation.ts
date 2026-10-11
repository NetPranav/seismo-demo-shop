// Seismo SDK: read-only, fail-open. Initialised once at server start, before any outbound call.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.SEISMO_KEY) return;
  const { seismo } = await import('@seismo/sdk');
  const base = (k: string) => process.env[k] ?? '';
  seismo.init({
    key: process.env.SEISMO_KEY,
    endpoint: process.env.SEISMO_ENDPOINT,
    sampleRate: Number(process.env.SEISMO_SAMPLE_RATE ?? 1),
    enumAllowList: ['status', 'currency'],
    services: {
      [`${base('USERS_API_URL')}/users`]: 'users',
      [`${base('PAYMENTS_API_URL')}/payments`]: 'payments',
      [`${base('SHIPPING_API_URL')}/shipments`]: 'shipping',
      [`${base('ORDERS_API_URL')}/orders`]: 'orders',
    },
  });
}
