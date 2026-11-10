// @vitest-environment node
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { build, createLogger } from 'vite';
import { assertBuildOutput, buildWarningConfig, classifyBuildWarning, createBuildWarningLogger } from '../build-warnings.mjs';

describe('build warning classification', () => {
  it.each([
    ['css', '[vite:css] Unexpected token'],
    ['asset', '/missing.svg referenced in app.css did not resolve'],
    ['asset', 'Sourcemap points to missing source files'],
    ['configuration', 'This config option is deprecated'],
    ['dependency', 'node_modules/example: Module level directives cause errors'],
    ['bundle', 'Some chunks are larger than 500 kB after minification'],
    ['unknown', 'R010 diagnostic sentinel'],
  ])('classifies %s diagnostics without allowing them', (category, message) => {
    // The CSS asset message is a resource diagnostic rather than CSS syntax.
    expect(classifyBuildWarning(`\u001b[33m${message}\u001b[0m`)).toBe(category);
    const logger = createBuildWarningLogger(createLogger('silent'));
    for (const method of ['warn', 'warnOnce'] as const) {
      expect(() => logger[method](message)).toThrow(`Build warning [${category}]`);
    }
  });
  it('keeps informational output and dev-server diagnostics outside the production gate', () => {
    expect(buildWarningConfig({ command: 'serve' })).toEqual({});
    expect(buildWarningConfig({ command: 'build' }).customLogger).toBeTruthy();
    expect(() => createBuildWarningLogger(createLogger('silent')).info('Warning examples documented')).not.toThrow();
  });
  it.each([
    ['bundle', 'Some chunks are larger than 500 kB after minification'],
    ['asset', "/logo.svg referenced in app.css didn't resolve at build time"],
    ['unknown', 'WARN: R010 diagnostic sentinel'],
    ['unknown', '(!) R010 diagnostic sentinel'],
  ])('rejects captured %s diagnostics without classifying unrelated asset listings', (category, diagnostic) => {
    expect(() => assertBuildOutput(`dist/assets/index.css 9 kB\n\u001b[33m${diagnostic}\u001b[0m\nBuilt in 10ms`)).toThrow(`Build warning [${category}]`);
  });
  it('accepts captured build progress and artifact listings without diagnostics', () => {
    expect(() => assertBuildOutput('transforming 17 modules\ndist/assets/index.css 9 kB\nBuilt in 10ms')).not.toThrow();
  });
});

describe('workspace build warning gate', () => {
  for (const directory of ['apps/gallery', 'examples/react-vite', 'examples/vue-vite']) {
    it(`${directory} rejects bundler diagnostics without relying on a warning keyword`, async () => {
      await expect(build({
        root: path.resolve(directory),
        plugins: [{ name: 'negative-build-fixture', buildStart() { this.warn('R010 diagnostic sentinel'); } }],
        build: { write: false },
      })).rejects.toThrow(/Build warning \[unknown\][\s\S]*R010 diagnostic sentinel/);
    });
  }
});
