import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
fs.mkdirSync(path.join(root, "tmp"), { recursive: true });
const temp = fs.mkdtempSync(path.join(root, "tmp/cli-matrix-"));
const registry = JSON.parse(fs.readFileSync(path.join(root, "templates/registry.json"), "utf8")).templates;
const projects = [];

try {
  for (const item of registry) {
    for (const framework of ["react", "vue", "static"]) {
      const out = path.join(temp, `${item.slug}-${framework}`);
      const run = spawnSync(process.execPath, [path.join(root, "packages/cli/bin/acmeui.mjs"),
        "create", `${item.slug}-${framework}`, "--framework", framework, "--template", item.slug, "--out", out], { encoding: "utf8" });
      if (run.status !== 0) throw new Error(`${item.slug}/${framework} failed:\n${run.stderr}`);
      const expected = framework === "static" ? "index.html" : framework === "react" ? "src/main.tsx" : "src/App.vue";
      if (!fs.existsSync(path.join(out, expected))) throw new Error(`${item.slug}/${framework} missing ${expected}`);
      const meta = JSON.parse(fs.readFileSync(path.join(out, "acmeui.template.json"), "utf8"));
      if (meta.framework !== framework || meta.slug !== item.slug) throw new Error(`${item.slug}/${framework} metadata mismatch`);
      const html = fs.readFileSync(path.join(out, "index.html"), "utf8");
      if (!/^<!doctype html>/i.test(html) || !html.includes('lang="zh-Hant"') || !html.includes('name="viewport"') || !/<title>[^<]+<\/title>/.test(html)) {
        throw new Error(`${item.slug}/${framework} missing semantic HTML shell`);
      }
      if (framework === "react") {
        const pkg = JSON.parse(fs.readFileSync(path.join(out, "package.json"), "utf8"));
        if (!pkg.devDependencies?.["@types/react"] || !pkg.devDependencies?.["@types/react-dom"]) {
          throw new Error(`${item.slug}/react missing type dependencies`);
        }
      }
      if (framework === "static") {
        const syntax = spawnSync(process.execPath, ["--check", path.join(out, "script.js")], { encoding: "utf8" });
        if (syntax.status !== 0) throw new Error(`${item.slug}/static script syntax failed: ${syntax.stderr}`);
      }
      projects.push({ out, framework, slug: item.slug });
    }
  }
  console.log(`✓ CLI generated ${projects.length} projects (${registry.length} templates × 3 frameworks); HTML, metadata and static script syntax checked`);
  if (process.argv.includes("--installed")) {
    const { checkInstalledBuilds } = await import("./test-cli-installed.mjs");
    await checkInstalledBuilds(root, projects);
  }
  if (process.argv.includes("--compile")) {
    const { checkGeneratedBuilds } = await import("./test-cli-builds.mjs");
    await checkGeneratedBuilds(root, temp, projects);
  }
} finally {
  // Only this run's generated fixture directory is removed; source is untouched.
  fs.rmSync(temp, { recursive: true });
}
