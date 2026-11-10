import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { createBuildWarningLogger } from "./build-warnings.mjs";

/** Uses installed example toolchains; does not prove independent dependency installation. */
export async function checkGeneratedBuilds(root, temp, projects) {
  for (const framework of ["react", "vue"]) {
    const targets = projects.filter(project => project.framework === framework);
    const example = path.join(root, "examples", `${framework}-vite`);
    const require = createRequire(path.join(example, "package.json"));
    for (const { out } of targets) {
      fs.symlinkSync(path.join(example, "node_modules"), path.join(out, "node_modules"), "dir");
    }

    // The generator emits the same compiler settings for every template. Check
    // all sources in one program per framework to avoid 96 compiler startups.
    const configs = targets.map(({ out }) => JSON.parse(fs.readFileSync(path.join(out, "tsconfig.json"), "utf8")));
    if (configs.some(config => JSON.stringify(config) !== JSON.stringify(configs[0]))) {
      throw new Error(`${framework} compiler settings differ between templates`);
    }
    const configPath = path.join(temp, `${framework}.tsconfig.json`);
    fs.writeFileSync(configPath, JSON.stringify({
      ...configs[0], include: targets.map(({ out }) => path.join(out, "src/**/*")),
    }));
    const compiler = require.resolve(framework === "react" ? "typescript/bin/tsc" : "vue-tsc/bin/vue-tsc.js");
    const result = spawnSync(process.execPath, [compiler, "--noEmit", "-p", configPath], { encoding: "utf8" });
    if (result.status !== 0) throw new Error(`${framework} generated typecheck failed:\n${result.stdout}\n${result.stderr}`);

    const { build, createLogger } = await import(pathToFileURL(require.resolve("vite")).href);
    let count = 0;
    for (const { out, slug } of targets) {
      try {
        await build({ root: out, logLevel: "warn", build: { write: false },
          customLogger: createBuildWarningLogger(createLogger("silent")),
        });
      } catch (error) {
        throw new Error(`${slug}/${framework} build failed: ${error.message}`, { cause: error });
      }
      count++;
      if (count % 12 === 0) console.log(`✓ Generated ${framework} bundles ${count}/${targets.length}`);
    }
    console.log(`✓ ${targets.length} generated ${framework} projects typechecked and bundled (workspace toolchain)`);
  }
}
