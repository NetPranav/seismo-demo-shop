// Added by Seismo (setup PR). Routes provider responses through alias rules (data, not code).
// With no rules in aliases.json this is the identity: responses pass through unchanged.
import { applyAliases, applyTransforms, liveAliasRules, type AliasRule } from '@seismo/sdk/runtime';
import file from './aliases.json';

// any rule kind (alias, scale, coerce, map): applyAliases uses the aliases, applyTransforms the rest
const rules = (file as { rules: unknown[] }).rules as AliasRule[];
// + rename rules healed live by Seismo (only when the project turned on auto-heal; empty otherwise, add-only like the rest)
const withLive = (): AliasRule[] => { const live = liveAliasRules(); return live.length ? [...rules, ...live] : rules; };

/** Parsed JSON body of a provider response: alias rules (add-only), then reviewed scale rules if any. */
export const withAliases = <T>(body: T, endpoint: string): T => applyTransforms(applyAliases(body, withLive(), endpoint), rules, endpoint);

/** axios-style response objects: only `data` is passed through the rules. */
export const withAliasesResponse = <R extends { data: unknown }>(res: R, endpoint: string): R => {
  const data = withAliases(res.data, endpoint);
  return data === res.data ? res : { ...res, data };
};
