// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));
let fixture: string;
const write = (file: string, content: string) => {
  const out = path.join(fixture, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
};
const edit = (file: string, change: (text: string) => string) => write(file, change(fs.readFileSync(path.join(fixture, file), "utf8")));
const registry = (change: (data: any) => void) => edit("templates/registry.json", text => {
  const data = JSON.parse(text); change(data); return JSON.stringify(data);
});
const validate = () => spawnSync(process.execPath, [path.join(root, "scripts/validate.mjs")], { cwd: fixture, encoding: "utf8" });
function rejects(message: string) {
  const result = validate();
  expect(result.status, result.stdout + result.stderr).toBe(1);
  expect(result.stderr).toContain(message);
}

beforeEach(() => {
  fs.mkdirSync(path.join(root, "tmp"), { recursive: true });
  fixture = fs.mkdtempSync(path.join(root, "tmp/validation-"));
  for (const rel of ["README.md", "spec.md", "plan.md", "todos.md", "packages/react/src/index.tsx",
    "packages/vue/src", "packages/tailwind/src/theme.css", "packages/styles/src/base.css", "packages/static/src/base.css",
    "templates", "previews", "docs/TEMPLATE_CATALOG.md", "apps/gallery/src/main.tsx", "apps/gallery/src/data.ts"]) {
    fs.mkdirSync(path.dirname(path.join(fixture, rel)), { recursive: true });
    fs.cpSync(path.join(root, rel), path.join(fixture, rel), { recursive: true });
  }
});
afterEach(() => { fs.rmSync(fixture, { recursive: true }); });

describe("repository validation rejects drift", () => {
  it("accepts the current repository contract", () => {
    const result = validate();
    expect(result.status, result.stderr).toBe(0);
  });
  it("detects a missing Vue family", () => {
    edit("packages/vue/src/index.ts", text => text.replace(/^.*default as Tabs.*\n/m, ""));
    rejects("Vue missing Tabs");
  });
  it("detects a family removed from both frameworks", () => {
    edit("packages/vue/src/index.ts", text => text.replace(/^.*default as Tabs.*\n/m, ""));
    edit("packages/react/src/index.tsx", text => text.replace("export function Tabs", "function Tabs"));
    rejects("React missing Tabs");
  });
  it("detects an undocumented React-only family", () => {
    edit("packages/react/src/index.tsx", text => text + "\nexport function Surprise() {}\n");
    rejects("Unexpected React export Surprise");
  });
  it("detects a React-only re-export alias", () => {
    edit("packages/react/src/index.tsx", text => text + "\nexport { Input as Surprise };\n");
    rejects("Unexpected React export Surprise");
  });
  it("detects an undocumented Vue-only family", () => {
    edit("packages/vue/src/index.ts", text => text + "\nexport const Surprise = {};\n");
    rejects("Unexpected Vue export Surprise");
  });
  it("detects a duplicate Vue export", () => {
    edit("packages/vue/src/index.ts", text => text + '\nexport { default as Tabs } from "./components/Tabs.vue";\n');
    rejects("Duplicate Vue export Tabs");
  });
  it("detects a missing Vue source file", () => {
    const file = path.join(fixture, "packages/vue/src/components/Tabs.vue");
    fs.renameSync(file, `${file}.hold`);
    rejects("Missing packages/vue/src/components/Tabs.vue");
  });
  it("detects static CSS drift", () => {
    edit("packages/static/src/base.css", text => text + "\n.acme-button{display:none}\n");
    rejects("Static base.css drift");
  });
  it("rejects the wrong static token import", () => {
    edit("packages/static/src/base.css", text => text.replace('./tokens.css', './wrong.css'));
    rejects("Static token import");
  });
  it("rejects unsafe registry slugs before resolving preview paths", () => {
    registry(data => { data.templates[0].slug = "../escape"; });
    rejects("Invalid template slug");
  });
  it("requires all three frameworks", () => {
    registry(data => { data.templates[0].frameworks = ["react", "vue"]; });
    rejects("Invalid frameworks saas-launch");
  });
  it("requires registry description metadata", () => {
    registry(data => { data.templates[0].description = ""; });
    rejects("Invalid description saas-launch");
  });
  it("detects a preview path mismatch", () => {
    registry(data => { data.templates[0].preview = "previews/ai-product/index.html"; });
    rejects("Preview path mismatch saas-launch");
  });
  it("detects per-template metadata drift", () => {
    edit("templates/saas-launch/template.json", text => text.replace('"palette": "indigo"', '"palette": "rose"'));
    rejects("Template metadata drift saas-launch");
  });
  it("reports missing preview files without an uncaught read error", () => {
    const file = path.join(fixture, "previews/saas-launch/index.html");
    fs.renameSync(file, `${file}.hold`);
    rejects("Missing previews/saas-launch/index.html");
  });
  it("rejects preview nesting through the HTML parser", () => {
    edit("previews/saas-launch/index.html", text => text.replace("</main>", "<ul><div>Invalid child</div></ul></main>"));
    rejects("element-permitted-content");
  });
  it("detects catalog content drift", () => {
    edit("docs/TEMPLATE_CATALOG.md", text => text.replace("SaaS Launch", "Different title"));
    rejects("Catalog drift saas-launch");
  });
  it("detects Gallery data drift", () => {
    edit("apps/gallery/src/data.ts", text => text.replace("SaaS Launch", "Different title"));
    rejects("Gallery template data drift");
  });
  it("reports malformed JSON and rejects non-object metadata", () => {
    write("templates/saas-launch/template.json", "{");
    rejects("Invalid JSON templates/saas-launch/template.json");
    write("templates/saas-launch/template.json", "null");
    rejects("Template metadata drift saas-launch");
  });
  it("reports malformed registry JSON", () => {
    write("templates/registry.json", "{");
    rejects("Invalid JSON templates/registry.json");
  });
});
