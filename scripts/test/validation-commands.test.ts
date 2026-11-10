// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import browserConfig from '../browser/playwright.config';

describe('documented CI validation commands', () => {
  const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
  const commands = ['pnpm test', 'pnpm test:cli:installed', 'pnpm typecheck', 'pnpm build', 'pnpm test:browser'];
  it('keeps every required command as a standalone CI step', () => {
    const actual = workflow.split('\n').filter(line => /^      - run:/.test(line)).map(line => line.replace(/^      - run: /, ''));
    for (const command of commands) expect(actual, command).toContain(command);
  });
  for (const file of ['README.md', 'VALIDATION.md', 'test.md']) it(`${file} lists the same five required commands`, () => {
    const content = readFileSync(file, 'utf8');
    for (const command of commands) expect(content, `${file}: ${command}`).toContain(`\n${command}\n`);
  });
  it('places the browser JSON report and failure output inside the uploaded CI artifact directory', () => {
    const reporters = browserConfig.reporter as Array<[string, { outputFile?: string }]>;
    const json = reporters.find(([name]) => name === 'json');
    expect(json?.[1].outputFile).toBeTruthy();
    const configDirectory = path.resolve('scripts/browser');
    const artifactDirectory = path.resolve('output/browser');
    expect(path.resolve(configDirectory, json![1].outputFile!)).toBe(path.join(artifactDirectory, 'report.json'));
    expect(path.resolve(configDirectory, browserConfig.outputDir!)).toBe(path.join(artifactDirectory, 'results'));
    expect(workflow).toContain('path: output/browser/');
  });
});
