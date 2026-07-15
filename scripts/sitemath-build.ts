/** Compila a biblioteca TypeScript e materializa somente o artefato publicado. */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(__dirname, "..", "..", "..");
const dist = join(root, "dist");
const packagePath = join(root, "package.json");

function runNode(modulePath: string, args: string[]): void {
  execFileSync(process.execPath, [modulePath, ...args], { cwd: root, stdio: "inherit" });
}

if (!existsSync(packagePath)) throw new Error("PACKAGE_MISSING:package.json");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
runNode(join(root, "node_modules", "vite", "bin", "vite.js"), ["build", "--config", "vite.library.config.ts"]);
runNode(join(root, "node_modules", "typescript", "bin", "tsc"), ["--project", "tsconfig.library.json"]);

const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { sitemath?: unknown };
if (!pkg.sitemath) throw new Error("SITEMATH_MANIFEST_MISSING:package.json");
const manifestPath = join(dist, "sitemath.manifest.json");
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(pkg.sitemath, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ code: "SITEMATH_BUILD_OK", files: ["dist/sitemath.js", "dist/sitemath.d.ts", "dist/sitemath.manifest.json"] }));
