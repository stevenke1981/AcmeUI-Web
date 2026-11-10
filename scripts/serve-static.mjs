import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("previews"), realRoot = await fs.realpath(root);
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html;charset=utf-8", ".css": "text/css;charset=utf-8", ".js": "text/javascript;charset=utf-8", ".json": "application/json" };
function within(base, file) {
  const relative = path.relative(base, file);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

http.createServer(async (req, res) => {
  const reply = (status, body = "") => { res.writeHead(status); res.end(body); };
  let rel;
  try {
    rel = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (rel.includes("\0")) throw new Error("NUL in path");
  } catch { reply(400, "Bad request"); return; }
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.resolve(root, "." + rel);
  if (!within(root, file)) { reply(403); return; }
  try {
    // Check the resolved destination as well: an in-root symlink may escape.
    const realFile = await fs.realpath(file);
    if (!within(realRoot, realFile)) { reply(403); return; }
    const data = await fs.readFile(realFile);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch { reply(404, "Not found"); }
}).listen(port, () => console.log(`http://localhost:${port}`));
