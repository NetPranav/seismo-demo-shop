// Added by Seismo: re-checks every rule in seismo/aliases.json in this repo's CI (no extra dependencies).
//  - alias rules (renames): G1 old shape untouched, G2 the new shape only gains the old name
//  - value rules (scale / coerce / map, always merged by a human): stress test on generated responses:
//    never throws, only the named field changes, the change is exactly what the rule says, coerce/map are idempotent
import { describe, expect, it } from 'vitest';
import { applyAliases, applyTransforms, type AliasRule } from '@seismo/sdk/runtime';
import file from './aliases.json';

type Rule = { kind?: string; endpoint?: string; path?: string; target?: string; source?: string; field?: string; divideBy?: number; to?: string; map?: Record<string, unknown> };
const rules = (file as { rules: Rule[] }).rules;
const aliases = rules.filter((r) => !r.kind || r.kind === 'alias') as AliasRule[];
const values = rules.filter((r) => r.kind === 'scale' || r.kind === 'coerce' || r.kind === 'map');

let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = <T>(xs: T[]) => xs[Math.floor(rnd() * xs.length)]!;
const sample = (r: Rule): unknown => {
  const keys = Object.keys(r.map ?? {});
  return pick<unknown>([
    Math.round(rnd() * 100000), rnd() * 1000, -7, 0, String(Math.round(rnd() * 100000)), (rnd() * 1000).toFixed(2), '', ' 12', '1e3', 'abc',
    null, true, ...keys, 'other_value',
  ]);
};
const NUMERIC = /^-?(0|[1-9][0-9]{0,14})(\.[0-9]{1,10})?$/;
const expected = (r: Rule, v: unknown) =>
  r.kind === 'scale' ? (typeof v === 'number' && Number.isFinite(v) ? v / r.divideBy! : v)
  : r.kind === 'coerce' ? (r.to === 'number' ? (typeof v === 'string' && NUMERIC.test(v) ? Number(v) : v) : (typeof v === 'number' && Number.isFinite(v) ? String(v) : v))
  : (typeof v === 'string' && Object.prototype.hasOwnProperty.call(r.map ?? {}, v) ? r.map![v] : v);

describe('seismo/aliases.json', () => {
  it('alias rules are valid', () => {
    for (const r of aliases) {
      expect(r.target).toMatch(/^[A-Za-z_][A-Za-z0-9_]{0,63}$/);
      expect(r.source).toMatch(/^[A-Za-z_][A-Za-z0-9_]{0,63}$/);
      expect(r.target).not.toBe(r.source);
    }
  });
  for (const r of aliases) {
    it(`${r.endpoint} ${r.target} <- ${r.source}: G1 + G2`, () => {
      const oldShape = { [r.target]: 'old', [r.source]: 'new', other: 1 };
      expect(applyAliases(oldShape, [r], r.endpoint)).toBe(oldShape);
      const newShape = { [r.source]: 'value', other: 1 };
      expect(applyAliases(newShape, [r], r.endpoint)).toEqual({ ...newShape, [r.target]: 'value' });
    });
  }
  for (const r of values) {
    it(`${r.kind} ${r.endpoint} ${r.field}: stress test on 500 generated responses`, () => {
      const nested = (r.path ?? '$') !== '$';
      for (let i = 0; i < 500; i++) {
        const v = sample(r);
        const record = { [r.field!]: v, keep: 'same', n: i };
        const body = nested ? { data: [record, { ...record, n: -i }] } : record;
        const out = applyTransforms(body, [r], r.endpoint) as Record<string, unknown> & { data?: Record<string, unknown>[] };
        const recs = nested ? out.data! : [out];
        for (const o of recs) {
          expect(o['keep']).toBe('same');                                     // only the named field changes
          expect(o[r.field!]).toEqual(expected(r, v));                         // exactly what the rule says
        }
        if (r.kind !== 'scale') expect(applyTransforms(out, [r], r.endpoint)).toEqual(out);   // idempotent
      }
      expect(() => applyTransforms(null, [r], r.endpoint)).not.toThrow();
    });
  }
});
