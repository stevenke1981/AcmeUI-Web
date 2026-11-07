// Generates tokens.css from packages/tokens/src/tokens.json (single source of truth).
// Usage: node scripts/build-tokens.mjs          -> write CSS files
//        node scripts/build-tokens.mjs --check  -> fail if CSS drifted from JSON
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const source = path.join(root, "packages/tokens/src/tokens.json");
const targets = ["packages/tokens/src/tokens.css", "packages/static/src/tokens.css"];
const groupPrefix = { colors: "", radius: "radius-", shadow: "shadow-", font: "font-" };

export function renderTokens(tokens) {
  const lines = [];
  for (const [name, theme] of Object.entries(tokens.themes)) {
    if (!theme.selector) throw new Error(`Theme ${name} missing selector`);
    const decls = [`color-scheme:${theme.colorScheme}`];
    for (const [group, prefix] of Object.entries(groupPrefix)) {
      for (const [key, value] of Object.entries(theme[group] ?? {})) decls.push(`--${tokens.prefix}-${prefix}${key}:${value}`);
    }
    for (const key of Object.keys(theme)) {
      if (!["selector", "colorScheme", ...Object.keys(groupPrefix)].includes(key)) throw new Error(`Unknown token group ${name}.${key}`);
    }
    lines.push(`${theme.selector}{${decls.join(";")}}`);
  }
  return lines.join("\n") + "\n";
}

const css = renderTokens(JSON.parse(fs.readFileSync(source, "utf8")));
const check = process.argv.includes("--check");
const drift = [];
for (const rel of targets) {
  const file = path.join(root, rel);
  if (check) {
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== css) drift.push(rel);
  } else fs.writeFileSync(file, css);
}
if (drift.length) {
  console.error(`Token drift: ${drift.join(", ")} differ from tokens.json. Run node scripts/build-tokens.mjs`);
  process.exit(1);
}
console.log(check ? `✓ ${targets.length} token CSS files match tokens.json` : `Wrote ${targets.join(", ")}`);
