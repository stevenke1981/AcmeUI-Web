import fs from 'node:fs';
import path from 'node:path';
import { HtmlValidate } from 'html-validate';
import { parse } from 'parse5';

const validator = new HtmlValidate({
  elements: ['html5'],
  rules: Object.fromEntries(['close-order', 'no-implicit-close', 'no-dup-id', 'no-dup-attr',
    'element-permitted-content', 'element-permitted-parent', 'element-required-ancestor', 'element-permitted-occurrences'].map(rule => [rule, 'error'])),
});
function elements(html) {
  const result = [];
  const visit = node => { if (node.tagName) result.push(node); for (const child of node.childNodes ?? []) visit(child); if (node.content) visit(node.content); };
  visit(parse(html)); return result;
}
const attr = (node, name) => node.attrs.find(attribute => attribute.name === name)?.value;

/** Structural HTML + local destinations/assets. External URLs are not fetched. */
export async function validatePreviewHTML(root, file, html) {
  const errors = [];
  const report = await validator.validateString(html, file);
  for (const result of report.results) for (const message of result.messages) {
    errors.push(`${file}:${message.line}:${message.column} ${message.ruleId}: ${message.message}`);
  }
  const source = path.resolve(root, file), nodes = elements(html);
  const ids = nodes => new Set(nodes.map(node => attr(node, 'id')).filter(Boolean));
  const sourceIDs = ids(nodes);
  for (const node of nodes) {
    const value = ['a', 'link'].includes(node.tagName) ? attr(node, 'href') : ['script', 'img', 'source'].includes(node.tagName) ? attr(node, 'src') : undefined;
    if (!value || value === '#' || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue;
    try {
      const url = new URL(value, `https://preview.invalid/${file}`);
      let destination = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      const relative = path.relative(root, destination);
      if (relative.startsWith('..') || path.isAbsolute(relative)) { errors.push(`${file}: local link escapes root: ${value}`); continue; }
      if (fs.existsSync(destination) && fs.statSync(destination).isDirectory()) destination = path.join(destination, 'index.html');
      if (!fs.existsSync(destination)) { errors.push(`${file}: missing local destination: ${value}`); continue; }
      if (url.hash) {
        const fragment = decodeURIComponent(url.hash.slice(1));
        const destinationIDs = destination === source ? sourceIDs : ids(elements(fs.readFileSync(destination, 'utf8')));
        if (!destinationIDs.has(fragment)) errors.push(`${file}: missing fragment: ${value}`);
      }
    } catch { errors.push(`${file}: invalid local destination: ${value}`); }
  }
  return errors;
}
