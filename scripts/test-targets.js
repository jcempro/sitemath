"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const distRuntime = path.join(root, "dist", "sitemath.js");
const targets = path.join(root, "tests", "targets");
const bundle = process.platform === "win32" ? "bundle.bat" : "bundle";
const selected = new Set(process.argv.slice(2));

if ([...selected].some((argument) => !["--web", "--jekyll"].includes(argument))) {
  throw new Error("TARGET_ARGUMENT_INVALID: use --web or --jekyll.");
}

const runWeb = selected.size === 0 || selected.has("--web");
const runJekyll = selected.size === 0 || selected.has("--jekyll");
const results = [];

function command(executable, args, cwd) {
  if (process.platform === "win32" && executable.endsWith(".bat")) {
    childProcess.execFileSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", [executable, ...args].join(" ")], { cwd, stdio: "inherit" });
    return;
  }
  childProcess.execFileSync(executable, args, { cwd, stdio: "inherit" });
}

function copyRuntime(target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(distRuntime, target);
  assert.deepEqual(fs.readFileSync(target), fs.readFileSync(distRuntime), "Fixture deve receber o artefato dist exato.");
}

function assertNoSourceLeakage(source, name) {
  assert.doesNotMatch(source, /(?:\.\.\/)*src\/sitemath\.js/u, `${name} não pode carregar src/sitemath.js.`);
}

function testStatic(SiteMath) {
  const fixture = path.join(targets, "static");
  const withSitemath = fs.readFileSync(path.join(fixture, "with-sitemath.html"), "utf8");
  const withoutSitemath = fs.readFileSync(path.join(fixture, "without-sitemath.html"), "utf8");
  assert.equal(SiteMath.detectHtml(withSitemath).valid, 1);
  assert.equal(SiteMath.detectHtml(withoutSitemath).found, 0);
  assert.match(withSitemath, /dist\/sitemath\.js/u);
  assertNoSourceLeakage(withSitemath, "HTML estático");
  results.push("static");
}

function testVite(name) {
  const fixture = path.join(targets, name);
  copyRuntime(path.join(fixture, "public", "sitemath.js"));
  fs.rmSync(path.join(fixture, "dist"), { recursive: true, force: true });
  command(process.execPath, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "build", "--config", "vite.config.mjs"], fixture);
  const withSitemath = fs.readFileSync(path.join(fixture, "dist", "index.html"), "utf8");
  const withoutSitemath = fs.readFileSync(path.join(fixture, "dist", "without.html"), "utf8");
  assert.match(withSitemath, /text\/x-sitemath/u, `${name} deve manter a declaração.`);
  assert.match(withSitemath, /sitemath\.js/u, `${name} deve incluir o artefato.`);
  assert.doesNotMatch(withoutSitemath, /text\/x-sitemath|sitemath\.js/u, `${name} não deve incluir runtime na página controle.`);
  assertNoSourceLeakage(withSitemath, name);
  results.push(name);
}

function ensureBundle(fixture) {
  try {
    command(bundle, ["check"], fixture);
  } catch {
    command(bundle, ["install"], fixture);
  }
}

function testJekyll(SiteMath) {
  const fixture = path.join(targets, "jekyll");
  const sourceWith = fs.readFileSync(path.join(fixture, "with-sitemath.md"), "utf8");
  const sourceWithout = fs.readFileSync(path.join(fixture, "without-sitemath.md"), "utf8");
  assert.equal(SiteMath.detectMarkdown(sourceWith).valid, 1);
  assert.equal(SiteMath.detectMarkdown(sourceWithout).found, 0);
  copyRuntime(path.join(fixture, "assets", "sitemath.js"));
  ensureBundle(fixture);
  command(bundle, ["exec", "ruby", "scripts/build.rb"], fixture);
  const withSitemath = fs.readFileSync(path.join(fixture, "_site", "with-sitemath", "index.html"), "utf8");
  const withoutSitemath = fs.readFileSync(path.join(fixture, "_site", "without-sitemath", "index.html"), "utf8");
  assert.match(withSitemath, /assets\/sitemath\.js/u);
  assert.match(withSitemath, /text\/x-sitemath/u);
  assert.doesNotMatch(withSitemath, /language-sitemath/u);
  assert.doesNotMatch(withoutSitemath, /text\/x-sitemath|assets\/sitemath\.js/u);
  assertNoSourceLeakage(withSitemath, "Jekyll");
  results.push("jekyll");
}

if (!fs.existsSync(distRuntime)) command(process.execPath, [path.join(root, "scripts", "sitemath-build.js")], root);
const SiteMath = require(distRuntime);

if (runWeb) {
  testStatic(SiteMath);
  ["vite-js", "vite-ts", "vite-react", "vite-preact"].forEach(testVite);
}
if (runJekyll) testJekyll(SiteMath);

console.log(JSON.stringify({ code: "SITEMATH_TARGETS_OK", targets: results }));
