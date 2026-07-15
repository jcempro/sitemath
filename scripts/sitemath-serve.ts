/** Servidor local mínimo para inspeção manual de exemplos, fixtures e documentação. */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";

const root = resolve(__dirname, "..", "..", "..");
const port = Number(process.env.SITEMATH_PORT ?? 4173);
const types: Record<string, string> = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

createServer((request, response) => {
  const relative = (decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/").replace(/^\/+/, "") || "examples/demo.html");
  const target = resolve(root, relative);
  if (!target.startsWith(root) || !existsSync(target) || statSync(target).isDirectory()) { response.writeHead(404); response.end("Not found"); return; }
  response.writeHead(200, { "Content-Type": `${types[extname(target)] ?? "application/octet-stream"}; charset=utf-8` });
  createReadStream(target).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`SiteMath em http://127.0.0.1:${port}/examples/demo.html`));
