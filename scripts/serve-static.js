/** Local production-like static serving. Unknown routes retain HTTP 404. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const types = {
  ".html": "text/html; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};
export function createStaticServer(directory = "dist") {
  const root = path.resolve(directory);
  return http.createServer((request, response) => {
    let filename;
    try {
      const decoded = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      filename = path.resolve(root, "." + decoded);
      if (filename !== root && !filename.startsWith(root + path.sep))
        throw new Error("Outside static root");
      if (fs.existsSync(filename) && fs.statSync(filename).isDirectory())
        filename = path.join(filename, "index.html");
    } catch {
      response.writeHead(400);
      response.end("Invalid URL");
      return;
    }
    const exists = fs.existsSync(filename) && fs.statSync(filename).isFile();
    const target = exists ? filename : path.join(root, "404.html");
    response.writeHead(exists ? 200 : 404, {
      "Content-Type": types[path.extname(target)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    if (fs.existsSync(target)) fs.createReadStream(target).pipe(response);
    else response.end("Page not found");
  });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 4173);
  createStaticServer().listen(port, "127.0.0.1", () =>
    console.log(
      `Built output at http://127.0.0.1:${port} (native static 404; no SPA fallback)`,
    ),
  );
}
