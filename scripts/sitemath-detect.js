"use strict";

const fs = require("fs");
const path = require("path");
const SiteMath = require("../src/sitemath.js");

const [kind, sourcePath] = process.argv.slice(2);
if (![["--markdown", "markdown"], ["--html", "html"]].some(([flag]) => flag === kind) || !sourcePath) {
  throw new Error("USAGE:node scripts/sitemath-detect.js --markdown|--html <arquivo>");
}
const source = fs.readFileSync(path.resolve(process.cwd(), sourcePath), "utf8");
const result = kind === "--html" ? SiteMath.detectHtml(source) : SiteMath.detectMarkdown(source);
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.results.some((entry) => !entry.valid) ? 2 : 0;
