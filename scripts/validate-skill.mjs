import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const skillRoot = path.join(root, "skills", "acmeui-web");
const errors = [];

const requiredFiles = [
  "SKILL.md",
  "INSTALL.md",
  "VALIDATION.json",
  "manifest.json",
  "agents/openai.yaml",
  "examples/prompts.md",
  "references/api-reference.md",
  "references/project-map.md",
  "references/workflows.md",
  "scripts/check-project.mjs",
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(skillRoot, relativePath))) {
    errors.push(`Skill missing ${relativePath}`);
  }
}

const readText = (relativePath) =>
  fs.readFileSync(path.join(skillRoot, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));

if (fs.existsSync(path.join(skillRoot, "SKILL.md"))) {
  const skill = readText("SKILL.md");
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatter) {
    errors.push("SKILL.md has invalid YAML frontmatter");
  } else {
    const keys = [
      ...frontmatter[1].matchAll(/^([a-z][a-z0-9-]*):/gim),
    ].map((match) => match[1]);
    const unexpected = keys.filter(
      (key) => !["name", "description"].includes(key),
    );

    if (!keys.includes("name") || !keys.includes("description")) {
      errors.push("SKILL.md frontmatter requires name and description");
    }
    if (unexpected.length) {
      errors.push(
        `SKILL.md frontmatter has unsupported keys: ${unexpected.join(", ")}`,
      );
    }
    if (!/^name:\s*acmeui-web\s*$/im.test(frontmatter[1])) {
      errors.push("SKILL.md name must be acmeui-web");
    }
    const description = frontmatter[1].match(/^description:\s*(.+)$/im)?.[1];
    if (!description || description.length > 1024) {
      errors.push("SKILL.md description must contain 1-1024 characters");
    }
  }
}

if (fs.existsSync(path.join(skillRoot, "manifest.json"))) {
  const manifest = readJson("manifest.json");
  if (manifest.name !== "acmeui-web" || manifest.entry !== "SKILL.md") {
    errors.push("manifest.json name or entry does not match the Skill");
  }
  if (manifest.version !== "1.0.0") {
    errors.push(`Expected Skill version 1.0.0, found ${manifest.version}`);
  }

  const listedFiles = new Set(manifest.files ?? []);
  for (const relativePath of requiredFiles) {
    if (!listedFiles.has(relativePath)) {
      errors.push(`manifest.json does not list ${relativePath}`);
    }
  }
}

if (fs.existsSync(path.join(skillRoot, "agents", "openai.yaml"))) {
  const metadata = readText("agents/openai.yaml");
  for (const field of [
    "display_name:",
    "short_description:",
    "default_prompt:",
  ]) {
    if (!metadata.includes(field)) {
      errors.push(`agents/openai.yaml missing ${field}`);
    }
  }
  if (!metadata.includes("$acmeui-web")) {
    errors.push("agents/openai.yaml default_prompt must mention $acmeui-web");
  }
}

const projectCheckPath = path.join(
  skillRoot,
  "scripts",
  "check-project.mjs",
);
if (fs.existsSync(projectCheckPath)) {
  const result = spawnSync(process.execPath, [projectCheckPath, root], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    errors.push(
      `Skill project check failed: ${(result.stderr || result.stdout).trim()}`,
    );
  } else {
    const live = JSON.parse(result.stdout);
    const snapshot = readJson("VALIDATION.json");
    const expected = {
      project: live.project,
      version: live.version,
      nodeRequirement: live.nodeRequirement,
      templates: live.templates,
      missingRequiredFiles: [],
      missingPreviewFiles: [],
      healthy: true,
    };

    for (const [key, value] of Object.entries(expected)) {
      if (JSON.stringify(snapshot[key]) !== JSON.stringify(value)) {
        errors.push(`VALIDATION.json ${key} is stale`);
      }
    }
    if (snapshot.root !== ".") {
      errors.push("VALIDATION.json root must be repository-relative");
    }
    if (snapshot.skillVersion !== "1.0.0") {
      errors.push("VALIDATION.json skillVersion must be 1.0.0");
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("✓ AcmeUI Web Skill structure and metadata");
console.log("✓ Skill manifest and validation snapshot");
console.log("✓ Skill project health check");
