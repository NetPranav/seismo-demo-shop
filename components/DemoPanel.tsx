'use client';

import { useCallback, useEffect, useState } from 'react';
import { detectedChanges, listScenarios, resetProviders, setScenario, type Detected, type Scenario } from '../app/demo-actions';

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
const DASHBOARD = process.env.NEXT_PUBLIC_SEISMO_DASHBOARD_URL ?? 'http://localhost:3000';
const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** Floating demo controls: make a provider change with one click, then see Seismo detect it (polls every 3 s). */
export default function DemoPanel() {
  const [open, setOpen] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [detected, setDetected] = useState<Detected[] | null>(null);
  const [since, setSince] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [s, d] = await Promise.all([listScenarios(), detectedChanges()]);
    setScenarios(s.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)));
    setDetected(d);
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
  const reset = async () => {
    setBusy(true);
    await resetProviders();
    setSince({});
    await refresh();
    setBusy(false);
  };

  const active = scenarios.filter((s) => s.enabled).length;
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
          <div className="demo-detect">
            <strong>Seismo detected</strong>
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
