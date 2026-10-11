// A5.2: the invoice shows the customer name for a v2 (renamed) response ONLY once the alias rule exists.
import { describe, expect, it } from 'vitest';
import { applyAliases } from '@seismo/sdk/runtime';
import { invoiceLines } from '../lib/invoice';

const v1 = { id: 'u_1', name: 'Asha Rao', email: 'asha.rao@example.in', phone: '+919800000001' };
const v2 = { id: 'u_1', display_name: 'Asha Rao', email: 'asha.rao@example.in', phone: '+919800000001' };
const payment = { id: 'pay_1', order_id: 'o_1', amount: 499, currency: 'INR', status: 'captured' };
const rule = { kind: 'alias', endpoint: 'GET /users/{id}', path: '$', target: 'name', source: 'display_name' };

describe('invoice', () => {
  it('v1: shows the name', () => expect(invoiceLines(v1, payment).billedTo).toBe('Billed to Asha Rao'));
  it('v2 without the alias rule: name is blank (the silent breakage)', () => {
    expect(invoiceLines(applyAliases(v2, [], 'GET /users/{id}') as never, payment).billedTo).toBe('Billed to —');
  });
  it('v2 with the alias rule: name is back', () => {
    expect(invoiceLines(applyAliases(v2, [rule], 'GET /users/{id}') as never, payment).billedTo).toBe('Billed to Asha Rao');
  });
  it('v1 with the alias rule: unchanged (old field wins)', () => expect(applyAliases(v1, [rule], 'GET /users/{id}')).toBe(v1));
});
