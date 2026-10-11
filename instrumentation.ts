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
    // only the four providers (not Next.js's own calls, e.g. its update check to the npm registry)
    // the providers' admin routes (used by the demo panel) are not API traffic
    ignore: ['USERS_API_URL', 'PAYMENTS_API_URL', 'SHIPPING_API_URL', 'ORDERS_API_URL'].map((k) => base(k)).filter(Boolean).map((u) => `${u}/admin`),
    allowHosts: [...new Set(['USERS_API_URL', 'PAYMENTS_API_URL', 'SHIPPING_API_URL', 'ORDERS_API_URL'].map((k) => base(k)).filter(Boolean).map((u) => new URL(u).host))],
    services: {
      [`${base('USERS_API_URL')}/users`]: 'users',
      [`${base('PAYMENTS_API_URL')}/payments`]: 'payments',
      [`${base('SHIPPING_API_URL')}/shipments`]: 'shipping',
      [`${base('ORDERS_API_URL')}/orders`]: 'orders',
    },
  });
}
