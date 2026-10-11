// Added by the Seismo setup: re-checks guarantees G1 and G2 for every rule in seismo/aliases.json in THIS repo's CI.
import { describe, expect, it } from 'vitest';
import { applyAliases, type AliasRule } from '@seismo/sdk/runtime';
import file from './aliases.json';

const rules = (file as { rules: AliasRule[] }).rules;

describe('seismo/aliases.json', () => {
  it('is valid', () => {
    for (const r of rules.filter((x) => (x as { kind?: string }).kind !== 'scale')) {
      expect(r.target).toMatch(/^[A-Za-z_][A-Za-z0-9_]{0,63}$/);
      expect(r.source).toMatch(/^[A-Za-z_][A-Za-z0-9_]{0,63}$/);
      expect(r.target).not.toBe(r.source);
    }
  });
  for (const r of rules.filter((x) => (x as { kind?: string }).kind !== 'scale')) {
    it(`${r.endpoint} ${r.target} <- ${r.source}: old shape untouched (G1), new shape only gains ${r.target} (G2)`, () => {
      const oldShape = { [r.target]: 'old', [r.source]: 'new', other: 1 };
      expect(applyAliases(oldShape, [r], r.endpoint)).toBe(oldShape);
      const newShape = { [r.source]: 'value', other: 1 };
      expect(applyAliases(newShape, [r], r.endpoint)).toEqual({ ...newShape, [r.target]: 'value' });
    });
  }
});
