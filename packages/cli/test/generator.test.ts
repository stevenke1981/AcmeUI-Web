// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const cli = path.join(root, "packages/cli/bin/acmeui.mjs");
let temp: string;
beforeEach(() => {
  fs.mkdirSync(path.join(root, "tmp"), { recursive: true });
  temp = fs.mkdtempSync(path.join(root, "tmp/cli-unit-"));
});
afterEach(() => { fs.rmSync(temp, { recursive: true }); });
const run = (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { cwd: temp, encoding: "utf8" });

describe("CLI generated project contract", () => {
  it.each(["react", "vue", "static"])("creates a semantic %s document with template metadata", framework => {
    const result = run("create", "demo", "--framework", framework);
    expect(result.status, result.stderr).toBe(0);
    const out = path.join(temp, "demo");
    const html = fs.readFileSync(path.join(out, "index.html"), "utf8");
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('lang="zh-Hant"');
    expect(html).toContain('name="viewport"');
    expect(html).toContain("<title>SaaS Launch");
    expect(JSON.parse(fs.readFileSync(path.join(out, "acmeui.template.json"), "utf8")))
      .toMatchObject({ slug: "saas-launch", framework });
    if (framework === "react") {
      const pkg = JSON.parse(fs.readFileSync(path.join(out, "package.json"), "utf8"));
      expect(pkg.devDependencies).toHaveProperty("@types/react");
      expect(pkg.devDependencies).toHaveProperty("@types/react-dom");
    }
  });

  it.each([
    ["--framework", "angular"], ["--template", "missing-template"],
    ["--framework"], ["--template"], ["--out"],
  ])("rejects invalid arguments %j without creating a project", (...args) => {
    expect(run("create", "demo", ...args).status).not.toBe(0);
    expect(fs.readdirSync(temp)).toEqual([]);
  });

  it("rejects path-like project names without writing output", () => {
    expect(run("create", "../escape", "--out", path.join(temp, "target")).status).not.toBe(0);
    expect(fs.readdirSync(temp)).toEqual([]);
  });

  it("preserves an existing nonempty target byte for byte", () => {
    const out = path.join(temp, "occupied");
    fs.mkdirSync(out);
    fs.writeFileSync(path.join(out, "keep.txt"), "existing content\n");
    expect(run("create", "demo", "--out", out).status).not.toBe(0);
    expect(fs.readdirSync(temp)).toEqual(["occupied"]);
    expect(fs.readdirSync(out)).toEqual(["keep.txt"]);
    expect(fs.readFileSync(path.join(out, "keep.txt"), "utf8")).toBe("existing content\n");
  });
});
