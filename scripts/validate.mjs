import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const exists = file => fs.existsSync(path.join(root, file));
const read = file => {
  if (!exists(file)) { errors.push(`Missing ${file}`); return null; }
  return fs.readFileSync(path.join(root, file), "utf8");
};
const json = file => {
  const text = read(file);
  if (text === null) return null;
  try { return JSON.parse(text); }
  catch { errors.push(`Invalid JSON ${file}`); return null; }
};
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const equal = (left, right) => JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));

for (const file of ["README.md", "spec.md", "plan.md", "todos.md", "packages/tailwind/src/theme.css", "apps/gallery/src/main.tsx"]) {
  if (!exists(file)) errors.push(`Missing ${file}`);
}

// Changing this public contract requires matching framework implementations,
// API documentation and Gallery examples. React's composition helpers are the
// only intentional exception; removing a family from both packages must fail.
const families = ["Button", "Card", "Badge", "Field", "Input", "Textarea", "Select", "Checkbox", "Switch", "Alert", "Progress", "Avatar", "Tabs", "Modal", "DataTable", "Breadcrumb", "Pagination", "Navbar", "Sidebar", "Hero", "FeatureGrid", "PricingTable", "Footer"];
const reactHelpers = ["CardHeader", "CardContent", "CardFooter"];
const reactSource = read("packages/react/src/index.tsx") ?? "";
const vueSource = read("packages/vue/src/index.ts") ?? "";
const exportNames = source => [
  ...[...source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Z][A-Za-z0-9]+)/g)].map(match => match[1]),
  ...[...source.matchAll(/export\s*\{([^}]+)\}/g)].flatMap(match => match[1].split(",")
    .map(specifier => specifier.trim().split(/\s+as\s+/).at(-1))
    .filter(name => /^[A-Z][A-Za-z0-9]*$/.test(name))),
];
const reactNames = exportNames(reactSource);
const vueExports = [...vueSource.matchAll(/export\s*\{\s*default\s+as\s+([A-Z][A-Za-z0-9]+)\s*\}\s*from\s*["']([^"']+)["']/g)];
const vueNames = exportNames(vueSource);
for (const [framework, source] of [["React", reactSource], ["Vue", vueSource]]) {
  if (/\bexport\s*\*/.test(source)) errors.push(`Unsupported ${framework} wildcard export: use explicit component names`);
}
for (const [framework, names, expected] of [["React", reactNames, [...families, ...reactHelpers]], ["Vue", vueNames, families]]) {
  for (const name of expected) if (!names.includes(name)) errors.push(`${framework} missing ${name}`);
  for (const name of new Set(names)) {
    if (!expected.includes(name)) errors.push(`Unexpected ${framework} export ${name}`);
    if (names.filter(value => value === name).length > 1) errors.push(`Duplicate ${framework} export ${name}`);
  }
}
for (const [, name, source] of vueExports) {
  if (source !== `./components/${name}.vue`) { errors.push(`Unexpected Vue source ${name}`); continue; }
  const file = `packages/vue/src/components/${name}.vue`;
  if (!exists(file)) errors.push(`Missing ${file}`);
}

const sharedCSS = read("packages/styles/src/base.css");
const staticCSS = read("packages/static/src/base.css");
if (sharedCSS !== null && staticCSS !== null) {
  if (!sharedCSS.startsWith('@import "@acmeui/tokens/tokens.css";\n')) errors.push("Shared token import must reference @acmeui/tokens/tokens.css");
  if (!staticCSS.startsWith('@import "./tokens.css";\n')) errors.push("Static token import must reference ./tokens.css");
  const body = css => css.replace(/^@import[^\n]*\n/, "");
  if (body(sharedCSS) !== body(staticCSS)) errors.push("Static base.css drift: copy shared component CSS, preserving the local token import");
}

const registry = json("templates/registry.json");
if (!Array.isArray(registry?.templates)) errors.push("Registry templates must be an array");
const templates = Array.isArray(registry?.templates) ? registry.templates : [];
if (templates.length < 40) errors.push(`Expected at least 40 templates, found ${templates.length}`);
const slugs = new Set();
const valid = [];
for (const item of templates) {
  if (!item || typeof item !== "object" || typeof item.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
    errors.push(`Invalid template slug ${item?.slug ?? "(missing)"}`); continue;
  }
  const { slug } = item;
  if (slugs.has(slug)) errors.push(`Duplicate slug ${slug}`);
  slugs.add(slug);
  valid.push(item);
  for (const key of ["name", "category", "description", "palette", "layout"]) {
    if (typeof item[key] !== "string" || !item[key].trim()) errors.push(`Invalid ${key} ${slug}`);
  }
  if (!Array.isArray(item.frameworks) || !equal([...item.frameworks].sort(), ["react", "static", "vue"])) errors.push(`Invalid frameworks ${slug}`);
  if (item.preview !== `previews/${slug}/index.html`) errors.push(`Preview path mismatch ${slug}`);
  const metadata = json(`templates/${slug}/template.json`);
  if (!equal(metadata, item)) errors.push(`Template metadata drift ${slug}`);
  for (const file of ["style.css", "script.js"]) {
    const relative = `previews/${slug}/${file}`;
    if (!exists(relative)) errors.push(`Missing ${relative}`);
  }
  const html = read(`previews/${slug}/index.html`);
  if (html !== null && (!/^<!doctype html>/i.test(html) || !html.includes('name="viewport"'))) errors.push(`Invalid preview HTML ${slug}`);
}
for (const directory of ["templates", "previews"]) {
  if (!exists(directory)) continue;
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    if (entry.isDirectory() && !slugs.has(entry.name)) errors.push(`Unregistered ${directory} directory ${entry.name}`);
  }
}

const catalog = read("docs/TEMPLATE_CATALOG.md") ?? "";
const rows = new Map();
for (const line of catalog.split(/\r?\n/)) {
  const cells = line.split("|").slice(1, -1).map(value => value.trim());
  if (cells.length !== 4 || !/^`[a-z0-9-]+`$/.test(cells[3])) continue;
  const slug = cells[3].slice(1, -1);
  if (rows.has(slug)) errors.push(`Duplicate catalog row ${slug}`);
  rows.set(slug, cells.slice(0, 3));
  if (!slugs.has(slug)) errors.push(`Unregistered catalog row ${slug}`);
}
for (const item of valid) {
  if (!equal(rows.get(item.slug), [item.name, item.category, item.layout])) errors.push(`Catalog drift ${item.slug}`);
}
const gallerySource = read("apps/gallery/src/data.ts") ?? "";
const galleryJSON = gallerySource.match(/^\s*export\s+const\s+templates\s*=\s*(\[[\s\S]*\])\s+as const;\s*$/)?.[1];
try {
  if (!galleryJSON || !equal(JSON.parse(galleryJSON), templates)) errors.push("Gallery template data drift");
} catch { errors.push("Invalid Gallery template data JSON"); }

if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exit(1);
}
console.log(`✓ ${templates.length} templates: schema, metadata, preview files, catalog and Gallery data`);
console.log(`✓ ${families.length} component families in both frameworks (${reactNames.length} React / ${vueNames.length} Vue exports)`);
console.log("✓ Shared/static component CSS match; token import paths verified");
console.log("✓ Registry and framework contract checks passed (structural checks, not browser validation)");
