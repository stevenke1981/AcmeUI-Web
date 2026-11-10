// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { validatePreviewHTML } from '../validate-html.mjs';
let root: string;
beforeEach(() => { fs.mkdirSync('tmp', { recursive: true }); root = fs.mkdtempSync(path.resolve('tmp/html-parser-')); });
afterEach(() => fs.rmSync(root, { recursive: true }));
const shell = (body: string) => `<!doctype html><html lang="en"><head><title>Test</title></head><body>${body}</body></html>`;
async function validate(body: string) {
  const html = shell(body); fs.writeFileSync(path.join(root, 'index.html'), html);
  return validatePreviewHTML(root, 'index.html', html);
}
it('accepts encoded fragments, local assets and external links without fetching them', async () => {
  fs.writeFileSync(path.join(root, 'style.css'), '');
  fs.writeFileSync(path.join(root, 'other.html'), shell('<h1 id="target">Other</h1>'));
  expect(await validate('<h1 id="章節">Heading</h1><a href="#%E7%AB%A0%E7%AF%80">Jump</a><a href="other.html?x=1#target">Other</a><link rel="stylesheet" href="style.css"><a href="https://example.invalid">External</a>')).toEqual([]);
});
it.each([
  ['<p><div>Invalid nesting</div></p>', 'no-implicit-close'],
  ['<ul><div>Invalid child</div></ul>', 'element-permitted-content'],
  ['<div><span>Wrong close</div></span>', 'close-order'],
  ['<h1 id="same">One</h1><h2 id="same">Two</h2>', 'no-dup-id'],
  ['<div id="a" id="b"></div>', 'no-dup-attr'],
  ['<a href="#missing">Jump</a>', 'missing fragment'],
  ['<a href="missing.html">Page</a>', 'missing local destination'],
  ['<script src="missing.js"></script>', 'missing local destination'],
  ['<img src="missing.png" alt="Test">', 'missing local destination'],
  ['<a href="%zz">Bad URL</a>', 'invalid local destination'],
])('rejects %s', async (body, diagnostic) => {
  expect((await validate(body)).join('\n')).toContain(diagnostic);
});
it('rejects a missing fragment in another local HTML file', async () => {
  fs.writeFileSync(path.join(root, 'other.html'), shell('<h1 id="target">Other</h1>'));
  expect((await validate('<a href="other.html#absent">Jump</a>')).join('\n')).toContain('missing fragment');
});
