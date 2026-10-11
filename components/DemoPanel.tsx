'use client';

import { useCallback, useEffect, useState } from 'react';
import { addCustom, detectedChanges, listCustom, readiness, listScenarios, removeCustom, resetProviders, setScenario, type CustomChange, type Detected, type Readiness, type Scenario } from '../app/demo-actions';

const LABEL: Record<string, string> = {
  'users-rename': 'Rename a field (name → display_name)',
  'payments-amount-type': 'Change a data type (amount → text)',
  'payments-paise': 'Change units (rupees → paise)',
  'orders-limit-cap': 'Cap a limit (500 → 100)',
  'shipping-enum': 'Add a new status value',
  'users-error-shape': 'Change the error format',
  'shipping-deprecation': 'Announce a sunset (header)',
  'orders-cursor': 'Switch pagination to cursors',
};
const ORDER = Object.keys(LABEL);

/** Fields each fake provider sends (suggestions for the form; any field name can be typed). */
const FIELDS: Record<string, string[]> = {
  users: ['name', 'email', 'phone', 'id'],
  payments: ['amount', 'currency', 'status', 'order_id'],
  shipping: ['status', 'carrier', 'order_id'],
  orders: ['total_rupees', 'items', 'user_id', 'data'],
};
const KINDS = [
  { id: 'rename', label: 'Rename field', input: 'New name', placeholder: 'full_name' },
  { id: 'type', label: 'Change type', input: 'New type', placeholder: 'string' },
  { id: 'scale', label: 'Multiply (units)', input: 'Factor', placeholder: '100' },
  { id: 'value', label: 'New value', input: 'Value', placeholder: 'lost' },
  { id: 'remove', label: 'Remove field', input: '', placeholder: '' },
  { id: 'cap', label: 'Cap a list', input: 'Max items', placeholder: '100' },
] as const;
const describeChange = (c: CustomChange) =>
  c.kind === 'rename' ? `${c.service}: ${c.field} → ${c.to}` : c.kind === 'type' ? `${c.service}: ${c.field} becomes ${c.to}` : c.kind === 'scale' ? `${c.service}: ${c.field} × ${c.factor}`
  : c.kind === 'value' ? `${c.service}: ${c.field} = "${c.value}"` : c.kind === 'remove' ? `${c.service}: ${c.field} removed` : `${c.service}: ${c.field} capped at ${c.max}`;
const DASHBOARD = process.env.NEXT_PUBLIC_SEISMO_DASHBOARD_URL ?? 'http://localhost:3000';
const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** Floating demo controls: make a provider change with one click, then see Seismo detect it (polls every 3 s). */
export default function DemoPanel() {
  const [open, setOpen] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [detected, setDetected] = useState<Detected[] | null>(null);
  const [since, setSince] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState<CustomChange[]>([]);
  const [form, setForm] = useState({ service: 'users', kind: 'rename', field: 'name', input: '' });
  const [formMsg, setFormMsg] = useState('');
  const [learning, setLearning] = useState<Readiness[]>([]);

  const refresh = useCallback(async () => {
    const [s, d, c, r] = await Promise.all([listScenarios(), detectedChanges(), listCustom(), readiness()]);
    setLearning((r ?? []).filter((x) => !x.ready));
    setScenarios(s.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)));
    setDetected(d);
    setCustom(c);
  }, []);
  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, 3000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [refresh]);

  const flip = async (s: Scenario) => {
    setBusy(true);
    if (await setScenario(s.id, !s.enabled)) setSince((p) => ({ ...p, [s.id]: s.enabled ? '' : new Date().toISOString() }));
    await refresh();
    setBusy(false);
  };
  const submit = async () => {
    const k = form.kind;
    const v = form.kind === 'type' ? form.input || 'string' : form.input.trim();
    const change = { service: form.service, kind: k, field: form.field.trim(),
      ...(k === 'rename' || k === 'type' ? { to: v } : {}), ...(k === 'scale' ? { factor: Number(v) } : {}),
      ...(k === 'value' ? { value: v } : {}), ...(k === 'cap' ? { max: Number(v) } : {}) };
    setBusy(true);
    const r = await addCustom(change);
    setFormMsg(r.ok ? `Live now at ${new Date().toLocaleTimeString()}: keep placing orders.` : `Not applied: ${r.message}`);
    await refresh();
    setBusy(false);
  };
  const drop = async (id: string) => {
    setBusy(true);
    await removeCustom(id);
    await refresh();
    setBusy(false);
  };
  const kindMeta = KINDS.find((x) => x.id === form.kind)!;

  const reset = async () => {
    setBusy(true);
    await resetProviders();
    setSince({});
    await refresh();
    setBusy(false);
  };

  const active = scenarios.filter((s) => s.enabled).length + custom.length;
  if (!scenarios.length && !open) return null;   // panel off (DEMO_PANEL not set) or providers down

  return (
    <div className="demo">
      {open && (
        <div className="demo-card">
          <div className="demo-head">
            <strong>Demo: change a provider</strong>
            <button className="demo-x" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>
          <p className="demo-hint">Each button makes one third-party API change silently, the way a real provider would. Keep placing orders; Seismo confirms a change in about a minute.</p>
          <ul className="demo-list">
            {scenarios.map((s) => (
              <li key={s.id}>
                <button className={s.enabled ? 'demo-btn on' : 'demo-btn'} disabled={busy} onClick={() => flip(s)}>
                  <span>{LABEL[s.id] ?? s.title}</span>
                  <span className="demo-state">{s.enabled ? 'ON' : 'off'}</span>
                </button>
                {s.enabled && since[s.id] && <div className="demo-since">changed at {time(since[s.id]!)}</div>}
              </li>
            ))}
          </ul>
          <div className="demo-custom">
            <strong>Or describe your own change</strong>
            <div className="demo-form">
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value, field: FIELDS[e.target.value]![0]! })} aria-label="Provider">
                {Object.keys(FIELDS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value, input: '' })} aria-label="Kind of change">
                {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
              </select>
              <input list="demo-fields" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} placeholder="field" aria-label="Field" />
              <datalist id="demo-fields">{FIELDS[form.service]!.map((f) => <option key={f} value={f} />)}</datalist>
              {kindMeta.input && (
                form.kind === 'type'
                  ? <select value={form.input || 'string'} onChange={(e) => setForm({ ...form, input: e.target.value })} aria-label="New type"><option value="string">string</option><option value="number">number</option></select>
                  : <input value={form.input} onChange={(e) => setForm({ ...form, input: e.target.value })} placeholder={kindMeta.placeholder} aria-label={kindMeta.input} />
              )}
              <button className="demo-btn on" disabled={busy || !form.field.trim() || (!!kindMeta.input && form.kind !== 'type' && !form.input.trim())} onClick={() => void submit()}>Apply</button>
            </div>
            {formMsg && <div className="demo-since">{formMsg}</div>}
            {custom.length > 0 && (
              <ul className="demo-found">
                {custom.map((c) => (
                  <li key={c.id}><span className="demo-sev warning">live</span> {describeChange(c)} · <button className="demo-link" onClick={() => drop(c.id)}>undo</button></li>
                ))}
              </ul>
            )}
          </div>
          <div className="demo-detect">
            <strong>Seismo detected</strong>
            {learning.length > 0 && (
              <p className="demo-hint">
                Still learning normal traffic, changes now would be learned as normal:{' '}
                {learning.map((l) => `${l.endpoint} ${l.samples}/${l.needed}`).join(' · ')}
              </p>
            )}
            {detected === null ? (
              <p className="demo-hint">Not connected to Seismo (SEISMO_KEY / SEISMO_ENDPOINT).</p>
            ) : detected.length === 0 ? (
              <p className="demo-hint">{active ? 'Watching… (about a minute after a change)' : 'Nothing open: all providers look normal.'}</p>
            ) : (
              <ul className="demo-found">
                {detected.slice(0, 5).map((d) => (
                  <li key={d.id}>
                    <span className={'demo-sev ' + d.severity}>{d.severity}</span> {d.title}
                    {d.prUrl && <> · <a href={d.prUrl} target="_blank" rel="noreferrer">fix PR ↗</a></>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="demo-foot">
            <button className="demo-link" disabled={busy} onClick={reset} title="Providers back to normal. Seismo marks the changes resolved ~15 s later. Full reset (fix rules too): Seismo → Demo Control">Turn all changes off</button>
            <a className="demo-link" href={`${DASHBOARD}/app`} target="_blank" rel="noreferrer">Open Seismo ↗</a>
          </div>
        </div>
      )}
      <button className="demo-fab" onClick={() => setOpen((o) => !o)}>
        Demo changes{active ? ` · ${active} on` : ''}{detected?.length ? ` · ${detected.length} detected` : ''}
      </button>
    </div>
  );
}
