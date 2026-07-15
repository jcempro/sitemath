/** Valida a matriz de targets contra o mesmo artefato distribuível. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

interface SiteMathApi { detectHtml(source: string): { found: number; valid: number }; detectMarkdown(source: string): { found: number; valid: number }; }
const root = resolve(__dirname, "..", "..", "..");
const distRuntime = join(root, "dist", "sitemath.js");
const targets = join(root, "tests", "targets");
const bundle = process.platform === "win32" ? "bundle.bat" : "bundle";
const selected = new Set(process.argv.slice(2));
if ([...selected].some((argument) => !["--web", "--jekyll"].includes(argument))) throw new Error("TARGET_ARGUMENT_INVALID: use --web or --jekyll.");
const runWeb = selected.size === 0 || selected.has("--web");
const runJekyll = selected.size === 0 || selected.has("--jekyll");
const results: string[] = [];

function command(executable: string, args: string[], cwd: string): void {
  if (process.platform === "win32" && executable.endsWith(".bat")) { execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", [executable, ...args].join(" ")], { cwd, stdio: "inherit" }); return; }
  execFileSync(executable, args, { cwd, stdio: "inherit" });
}
function copyRuntime(target: string): void { mkdirSync(dirname(target), { recursive: true }); copyFileSync(distRuntime, target); assert.deepEqual(readFileSync(target), readFileSync(distRuntime), "Fixture deve receber o artefato dist exato."); }
function assertNoSourceLeakage(source: string, name: string): void { assert.doesNotMatch(source, /(?:\.\.\/)*src\/sitemath\.(?:js|ts)/u, `${name} não pode carregar fonte interna.`); }
function testStatic(siteMath: SiteMathApi): void {
  const fixture = join(targets, "static"); const withSitemath = readFileSync(join(fixture, "with-sitemath.html"), "utf8"); const withoutSitemath = readFileSync(join(fixture, "without-sitemath.html"), "utf8");
  assert.equal(siteMath.detectHtml(withSitemath).valid, 1); assert.equal(siteMath.detectHtml(withoutSitemath).found, 0); assert.match(withSitemath, /dist\/sitemath\.js/u); assertNoSourceLeakage(withSitemath, "HTML estático"); results.push("static");
}
function testVite(name: string): void {
  const fixture = join(targets, name); copyRuntime(join(fixture, "public", "sitemath.js")); rmSync(join(fixture, "dist"), { recursive: true, force: true }); command(process.execPath, [join(root, "node_modules", "vite", "bin", "vite.js"), "build", "--config", "vite.config.mjs"], fixture);
  const withSitemath = readFileSync(join(fixture, "dist", "index.html"), "utf8"); const withoutSitemath = readFileSync(join(fixture, "dist", "without.html"), "utf8");
  assert.match(withSitemath, /text\/x-sitemath/u, `${name} deve manter a declaração.`); assert.match(withSitemath, /sitemath\.js/u, `${name} deve incluir o artefato.`); assert.doesNotMatch(withoutSitemath, /text\/x-sitemath|sitemath\.js/u, `${name} não deve incluir runtime na página controle.`); assertNoSourceLeakage(withSitemath, name); results.push(name);
}
function ensureBundle(fixture: string): void { try { command(bundle, ["check"], fixture); } catch { command(bundle, ["install"], fixture); } }
function testJekyll(siteMath: SiteMathApi): void {
  const fixture = join(targets, "jekyll"); const sourceWith = readFileSync(join(fixture, "with-sitemath.md"), "utf8"); const sourceWithout = readFileSync(join(fixture, "without-sitemath.md"), "utf8");
  assert.equal(siteMath.detectMarkdown(sourceWith).valid, 1); assert.equal(siteMath.detectMarkdown(sourceWithout).found, 0); copyRuntime(join(fixture, "assets", "sitemath.js")); ensureBundle(fixture); command(bundle, ["exec", "ruby", "scripts/build.rb"], fixture);
  const withSitemath = readFileSync(join(fixture, "_site", "with-sitemath", "index.html"), "utf8"); const withoutSitemath = readFileSync(join(fixture, "_site", "without-sitemath", "index.html"), "utf8");
  assert.match(withSitemath, /assets\/sitemath\.js/u); assert.match(withSitemath, /text\/x-sitemath/u); assert.doesNotMatch(withSitemath, /language-sitemath/u); assert.doesNotMatch(withoutSitemath, /text\/x-sitemath|assets\/sitemath\.js/u); assertNoSourceLeakage(withSitemath, "Jekyll"); results.push("jekyll");
}

if (!existsSync(distRuntime)) throw new Error("DIST_RUNTIME_MISSING: execute npm run build first.");
const siteMath = require(distRuntime) as SiteMathApi;
if (runWeb) { testStatic(siteMath); ["vite-js", "vite-ts", "vite-react", "vite-preact"].forEach(testVite); }
if (runJekyll) testJekyll(siteMath);
console.log(JSON.stringify({ code: "SITEMATH_TARGETS_OK", targets: results }));
