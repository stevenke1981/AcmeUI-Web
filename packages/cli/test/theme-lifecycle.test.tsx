import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import ts from 'typescript';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { cleanup, render } from '@testing-library/react';
import * as Vue from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { compileScript, parse } from 'vue/compiler-sfc';

const root = path.resolve(import.meta.dirname, '../../..');
let temp: string | undefined;
let wrapper: VueWrapper | undefined;
afterEach(() => { cleanup(); wrapper?.unmount(); wrapper = undefined; document.body.innerHTML = ''; delete document.documentElement.dataset.theme; if (temp) fs.rmSync(temp, { recursive: true }); });
function evaluate(source: string, modules: Record<string, unknown>, tsx = false) {
  const exports: Record<string, any> = {};
  const code = ts.transpileModule(source, { fileName: tsx ? 'App.tsx' : 'App.ts', compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('exports', 'require', code)(exports, (id: string) => {
    if (!(id in modules)) throw new Error(`Unexpected generated import ${id}`);
    return modules[id];
  });
  return exports;
}
for (const framework of ['react', 'vue']) describe(`generated ${framework} theme lifecycle`, () => {
  it('scopes its listener, toggles once, cleans up on unmount and remounts safely', () => {
    fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
    temp = fs.mkdtempSync(path.join(root, 'tmp/theme-lifecycle-'));
    const out = path.join(temp, 'app');
    const result = spawnSync(process.execPath, [path.join(root, 'packages/cli/bin/acmeui.mjs'), 'create', 'demo', '--framework', framework, '--out', out], { encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
    const theme = evaluate(fs.readFileSync(path.join(out, 'src/theme.ts'), 'utf8'), {});
    const outside = document.createElement('button'); outside.className = 'theme-toggle'; document.body.append(outside);
    let app: any;
    if (framework === 'react') app = evaluate(fs.readFileSync(path.join(out, 'src/App.tsx'), 'utf8'), { react: React, 'react/jsx-runtime': jsxRuntime, './theme': theme }, true).App;
    else {
      const { descriptor } = parse(fs.readFileSync(path.join(out, 'src/App.vue'), 'utf8'));
      app = evaluate(compileScript(descriptor, { id: 'test', inlineTemplate: true }).content, { vue: Vue, './theme': theme }).default;
    }
    for (let attempt = 0; attempt < 2; attempt++) {
      document.documentElement.dataset.theme = 'light';
      const view = framework === 'react' ? render(React.createElement(app)) : (wrapper = mount(app, { attachTo: document.body }));
      const button = document.querySelector<HTMLElement>('.theme-toggle:not(body > .theme-toggle)')!;
      expect(button).toBeTruthy(); outside.click(); expect(document.documentElement.dataset.theme).toBe('light');
      button.click(); expect(document.documentElement.dataset.theme).toBe('dark');
      button.click(); expect(document.documentElement.dataset.theme).toBe('light');
      view.unmount(); wrapper = undefined;
      button.click(); expect(document.documentElement.dataset.theme).toBe('light');
    }
  });
});
it('generated helper tolerates missing buttons and idempotent cleanup', () => {
  // The same helper source is exercised above through real React/Vue lifecycle hooks.
  fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
  temp = fs.mkdtempSync(path.join(root, 'tmp/theme-empty-'));
  spawnSync(process.execPath, [path.join(root, 'packages/cli/bin/acmeui.mjs'), 'create', 'demo'], { cwd: temp });
  const theme = evaluate(fs.readFileSync(path.join(temp, 'demo/src/theme.ts'), 'utf8'), {});
  const stop = theme.setupThemeToggle(document.createElement('div'));
  expect(() => { stop(); stop(); }).not.toThrow();
});
