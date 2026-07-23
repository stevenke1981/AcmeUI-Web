#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? process.cwd());
const required = [
  "package.json",
  "AGENTS.md",
  "packages/core/src/index.ts",
  "packages/react/src/index.tsx",
  "packages/vue/src/index.ts",
  "packages/styles/src/base.css",
  "templates/registry.json",
  "packages/cli/bin/acmeui.mjs",
  "scripts/validate.mjs",
  "scripts/test-cli.mjs",
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
let packageData;
let registry;
try {
  packageData = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
} catch (error) {
  console.error(`Invalid or missing package.json: ${error.message}`);
  process.exit(2);
}
try {
  registry = JSON.parse(fs.readFileSync(path.join(root, "templates/registry.json"), "utf8"));
} catch (error) {
  console.error(`Invalid or missing template registry: ${error.message}`);
  process.exit(2);
}

const templates = Array.isArray(registry.templates) ? registry.templates : [];
const previewMissing = templates.flatMap((item) => {
  const base = path.join(root, "previews", item.slug ?? "");
  return ["index.html", "style.css", "script.js"]
    .filter((name) => !fs.existsSync(path.join(base, name)))
    .map((name) => `${item.slug}/${name}`);
});

console.log(JSON.stringify({
  root,
  project: packageData.name,
  version: packageData.version,
  nodeRequirement: packageData.engines?.node ?? null,
  templates: templates.length,
  missingRequiredFiles: missing,
  missingPreviewFiles: previewMissing,
  healthy: missing.length === 0 && previewMissing.length === 0,
}, null, 2));

if (missing.length || previewMissing.length) process.exit(1);
