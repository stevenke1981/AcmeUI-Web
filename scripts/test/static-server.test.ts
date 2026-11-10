// @vitest-environment node
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';

const script = path.resolve('scripts/serve-static.mjs');
let root: string, port: number, child: ChildProcess;
beforeEach(async () => {
  fs.mkdirSync('tmp', { recursive: true });
  root = fs.mkdtempSync(path.resolve('tmp/static-server-'));
  fs.mkdirSync(path.join(root, 'previews/nested'), { recursive: true });
  fs.mkdirSync(path.join(root, 'previews-backup'));
  fs.writeFileSync(path.join(root, 'previews/index.html'), '<h1>Preview index</h1>');
  fs.writeFileSync(path.join(root, 'previews/nested/index.html'), '<h1>Nested</h1>');
  fs.writeFileSync(path.join(root, 'previews/with space.html'), '<h1>Encoded</h1>');
  fs.writeFileSync(path.join(root, 'previews/style.css'), 'body{margin:0}');
  fs.writeFileSync(path.join(root, 'previews/script.js'), 'console.log("preview")');
  fs.writeFileSync(path.join(root, 'previews-backup/secret.txt'), 'fixture outside served root');
  fs.writeFileSync(path.join(root, 'private.txt'), 'private fixture');
  fs.symlinkSync('../previews-backup/secret.txt', path.join(root, 'previews/escape.txt'));
  fs.symlinkSync('../previews-backup', path.join(root, 'previews/escape-dir'));
  fs.symlinkSync('nested', path.join(root, 'previews/internal'));
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
  port = (reservation.address() as net.AddressInfo).port;
  await new Promise<void>((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
  child = spawn(process.execPath, [script], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server did not start')), 5000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview server exited ${code}`)); });
    child.stdout!.on('data', data => { if (String(data).includes(`http://localhost:${port}`)) { clearTimeout(timer); resolve(); } });
  });
});
afterEach(async () => {
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit'); child.kill(); await exited;
  }
  if (root) fs.rmSync(root, { recursive: true });
});
async function request(target: string) {
  return new Promise<{ status: number; type?: string; body: string }>((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path: target }, response => {
      let body = ''; response.setEncoding('utf8');
      response.on('data', data => { body += data; });
      response.on('end', () => resolve({ status: response.statusCode!, type: response.headers['content-type'], body }));
      response.on('error', reject);
    });
    req.setTimeout(1500, () => req.destroy(new Error('Preview request timed out')));
    req.on('error', reject);
  });
}

it.each([
  ['/', 'text/html;charset=utf-8', '<h1>Preview index</h1>'],
  ['/nested/', 'text/html;charset=utf-8', '<h1>Nested</h1>'],
  ['/with%20space.html?cache=1', 'text/html;charset=utf-8', '<h1>Encoded</h1>'],
  ['/style.css', 'text/css;charset=utf-8', 'body{margin:0}'],
  ['/script.js', 'text/javascript;charset=utf-8', 'console.log("preview")'],
  ['/internal/', 'text/html;charset=utf-8', '<h1>Nested</h1>'],
])('serves in-root resource %s', async (target, type, body) => {
  expect(await request(target)).toEqual({ status: 200, type, body });
});
it.each(['/..%2fpreviews-backup/secret.txt', '/%2e%2e%2fprivate.txt', '/escape.txt', '/escape-dir/secret.txt'])('denies out-of-root resource %s', async target => {
  const response = await request(target);
  expect(response.status).toBe(403);
  expect(response.body).not.toContain('fixture');
  expect((await request('/')).status).toBe(200);
});
it.each(['/%zz', '/%E0%A4', '/%00', 'http://['])('rejects malformed request %s and stays available', async target => {
  expect((await request(target)).status).toBe(400);
  expect((await request('/')).status).toBe(200);
  expect(child.exitCode).toBeNull();
});
it('returns 404 for missing files and remains available', async () => {
  expect((await request('/missing.html')).status).toBe(404);
  expect((await request('/')).status).toBe(200);
});
