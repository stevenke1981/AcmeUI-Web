export function assertNoOverflow(metrics, label) {
  if (metrics.scrollWidth > metrics.viewportWidth + 1) throw new Error(`${label}: page overflow ${metrics.scrollWidth} > ${metrics.viewportWidth}`);
}
export function assertEquivalent(reference, actual, label) {
  const keys = Object.keys(reference);
  if (JSON.stringify(keys) !== JSON.stringify(Object.keys(actual))) throw new Error(`${label}: missing or extra comparison elements`);
  for (const selector of keys) {
    if (reference[selector].length !== actual[selector].length) throw new Error(`${label}: ${selector} count differs`);
    reference[selector].forEach((expected, index) => {
      const found = actual[selector][index];
      for (const [key, value] of Object.entries(expected)) {
        if (typeof value === 'number' ? typeof found[key] !== 'number' || !Number.isFinite(found[key]) || Math.abs(value - found[key]) > 1 : value !== found[key]) {
          throw new Error(`${label}: ${selector}[${index}].${key}: expected ${value}, found ${found[key]}`);
        }
      }
    });
  }
}
