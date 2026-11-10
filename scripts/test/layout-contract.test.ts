import { expect, it } from 'vitest';
import { assertEquivalent, assertNoOverflow } from '../browser/layout-contract.mjs';
it('layout comparison rejects missing elements, geometry and style drift', () => {
  const reference = { button: [{ width: 100, color: 'blue' }] };
  expect(() => assertEquivalent(reference, { button: [{ width: 100.5, color: 'blue' }] }, 'same')).not.toThrow();
  for (const bad of [{ button: [{ color: 'blue' }] }, { button: [{ width: NaN, color: 'blue' }] }, {}, { button: [] }, { button: [{ width: 102, color: 'blue' }] }, { button: [{ width: 100, color: 'red' }] }]) expect(() => assertEquivalent(reference, bad, 'bad')).toThrow();
});
it('overflow guard permits only subpixel rounding', () => {
  expect(() => assertNoOverflow({ viewportWidth: 360, scrollWidth: 361 }, 'same')).not.toThrow();
  expect(() => assertNoOverflow({ viewportWidth: 360, scrollWidth: 362 }, 'bad')).toThrow(/overflow/);
});
