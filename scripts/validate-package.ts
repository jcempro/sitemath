/** Valida que o tarball NPM contém somente o contrato de distribuição autorizado. */
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

interface PackedFile { path: string; }
interface PackReport { files: PackedFile[]; }
const root = resolve(__dirname, "..", "..", "..");
const output = process.platform === "win32"
  ? execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm pack --dry-run --json --cache .tmp/npm-cache"], { cwd: root, encoding: "utf8" })
  : execFileSync("npm", ["pack", "--dry-run", "--json", "--cache", ".tmp/npm-cache"], { cwd: root, encoding: "utf8" });
const report = (JSON.parse(output) as PackReport[])[0];
if (!report || !Array.isArray(report.files)) throw new Error("NPM_PACK_REPORT_INVALID");
const allowed = new Set(["README.md", "package.json", "dist/sitemath.js", "dist/sitemath.d.ts", "dist/sitemath.manifest.json"]);
const files = report.files.map((file) => file.path).sort();
const unexpected = files.filter((file) => !allowed.has(file));
const missing = [...allowed].filter((file) => !files.includes(file));
if (unexpected.length || missing.length) throw new Error(`NPM_PAYLOAD_INVALID:unexpected=${unexpected.join(",") || "-"};missing=${missing.join(",") || "-"}`);
console.log(JSON.stringify({ code: "SITEMATH_PACKAGE_OK", files }));
