'use server';

/**
 * Demo panel (bottom-right of every page): flips the fake providers' changes and asks Seismo what it has detected.
 * Only active with DEMO_PANEL=true. The admin token and the SDK key stay on the server.
 */
export interface Scenario { id: string; service: string; title: string; kind: string; detector?: string; description: string; enabled: boolean; percent: number }
export interface Detected { id: string; title: string; state: string; severity: string; detectedAt: string; prUrl?: string }

const providers = () => process.env.USERS_API_URL ?? 'http://localhost:4100';
const admin = () => ({ 'x-admin-token': process.env.DEMO_ADMIN_TOKEN ?? 'dev-admin', 'content-type': 'application/json' });
const enabled = () => process.env.DEMO_PANEL === 'true';

export async function listScenarios(): Promise<Scenario[]> {
  if (!enabled()) return [];
  try {
    const r = await fetch(`${providers()}/admin/scenarios`, { headers: admin(), cache: 'no-store' });
    return r.ok ? ((await r.json()) as Scenario[]) : [];
  } catch { return []; }
}

export async function setScenario(id: string, on: boolean): Promise<boolean> {
  if (!enabled() || !/^[a-z-]+$/.test(id)) return false;
  const r = await fetch(`${providers()}/admin/scenarios/${id}`, { method: 'POST', headers: admin(), body: JSON.stringify({ enabled: on }), cache: 'no-store' }).catch(() => null);
  return !!r?.ok;
}

export async function resetProviders(): Promise<boolean> {
  if (!enabled()) return false;
  const r = await fetch(`${providers()}/admin/reset`, { method: 'POST', headers: admin(), body: '{}', cache: 'no-store' }).catch(() => null);
  return !!r?.ok;
}

/** What Seismo has detected for this app's project (asked with the app's own SDK key). */
export async function detectedChanges(): Promise<Detected[] | null> {
  if (!enabled() || !process.env.SEISMO_KEY) return null;
  try {
    const r = await fetch(`${process.env.SEISMO_ENDPOINT ?? 'http://localhost:4000'}/v1/sdk/changes`, { headers: { 'x-seismo-key': process.env.SEISMO_KEY }, cache: 'no-store' });
    return r.ok ? ((await r.json()) as Detected[]) : null;
  } catch { return null; }
}

/** Custom changes typed into the panel's form (applied by the fake provider to every response). */
export interface CustomChange { id: string; service: string; kind: string; field: string; to?: string; factor?: number; value?: string; max?: number }

export async function listCustom(): Promise<CustomChange[]> {
  if (!enabled()) return [];
  try {
    const r = await fetch(`${providers()}/admin/custom`, { headers: admin(), cache: 'no-store' });
    return r.ok ? ((await r.json()) as CustomChange[]) : [];
  } catch { return []; }
}

export async function addCustom(c: Omit<CustomChange, 'id'>): Promise<{ ok: boolean; message?: string }> {
  if (!enabled()) return { ok: false, message: 'demo panel is off' };
  try {
    const r = await fetch(`${providers()}/admin/custom`, { method: 'POST', headers: admin(), body: JSON.stringify(c), cache: 'no-store' });
    if (r.ok) return { ok: true };
    return { ok: false, message: ((await r.json().catch(() => ({}))) as { message?: string }).message ?? `error ${r.status}` };
  } catch { return { ok: false, message: 'providers unreachable' }; }
}

export async function removeCustom(id: string): Promise<void> {
  if (!enabled() || !/^[a-z0-9]+$/.test(id)) return;
  await fetch(`${providers()}/admin/custom/${id}`, { method: 'DELETE', headers: admin(), cache: 'no-store' }).catch(() => undefined);
}
