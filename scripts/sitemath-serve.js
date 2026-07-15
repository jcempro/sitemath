"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.SITEMATH_PORT || 4173);
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

http.createServer((request, response) => {
  const relative = decodeURIComponent((request.url || "/").split("?")[0]).replace(/^\/+/, "") || "examples/demo.html";
  const target = path.resolve(root, relative);
  if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) { response.writeHead(404); response.end("Not found"); return; }
  response.writeHead(200, { "Content-Type": `${types[path.extname(target)] || "application/octet-stream"}; charset=utf-8"` });
  fs.createReadStream(target).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`SiteMath em http://127.0.0.1:${port}/examples/demo.html`));
