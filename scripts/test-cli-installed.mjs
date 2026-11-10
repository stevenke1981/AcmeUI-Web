import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

/** Install each distinct generated manifest in isolation, then build every output.
 * No workspace dependencies are linked. Identical manifests reuse that isolated
 * install; every template still runs its own unmodified package build script. */
export async function checkInstalledBuilds(root, projects) {
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const env = { ...process.env, npm_config_cache: path.join(root, '.cache/npm'), COREPACK_HOME: process.env.COREPACK_HOME ?? path.join(root, '.cache/corepack') };
  const run = (args, cwd) => new Promise((resolve, reject) => {
    const child = spawn(pnpm, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(output) : reject(new Error(`${cwd}: pnpm ${args.join(' ')} exited ${code}\n${output}`)));
  });
  for (const framework of ['react', 'vue', 'static']) {
    const targets = projects.filter(project => project.framework === framework);
    const manifest = out => { const { name, ...rest } = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8')); return JSON.stringify(rest); };
    if (targets.some(({ out }) => manifest(out) !== manifest(targets[0].out))) throw new Error(`${framework}: generated manifests differ; extend installation groups before reusing dependencies`);
    const installed = targets[0].out;
    console.log(`Installing isolated ${framework} manifest…`);
    await run(['install', '--ignore-workspace', '--ignore-scripts', '--store-dir', path.join(root, '.cache/pnpm-store'), '--config.manage-package-manager-versions=false'], installed);
    for (const { out } of targets.slice(1)) {
      if (framework !== 'static') fs.symlinkSync(path.join(installed, 'node_modules'), path.join(out, 'node_modules'), 'dir');
    }
    let next = 0, done = 0;
    // allSettled keeps fixtures alive until every in-flight build has finished.
    const results = await Promise.allSettled(Array.from({ length: 3 }, async () => {
      while (next < targets.length) {
        const { out, slug } = targets[next++];
        const output = await run(['run', 'build'], out);
        if (/\bwarn(?:ing)?\b/i.test(output)) throw new Error(`${slug}/${framework} build warning:\n${output}`);
        if (framework !== 'static' && !fs.existsSync(path.join(out, 'dist/index.html'))) throw new Error(`${slug}/${framework}: missing built document`);
        if (++done % 12 === 0) console.log(`✓ Installed ${framework} package-script builds ${done}/${targets.length}`);
      }
    }));
    const failed = results.find(result => result.status === 'rejected');
    if (failed) throw failed.reason;
    console.log(`✓ ${targets.length} ${framework} build scripts passed (isolated manifest install, no workspace toolchain)`);
  }
}
