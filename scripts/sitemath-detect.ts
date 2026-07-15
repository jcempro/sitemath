/** Executa a detecção exata de SiteMath sobre um arquivo sem avaliar seu código. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface Adapter { detectHtml(source: string): { results: Array<{ valid: boolean }> }; detectMarkdown(source: string): { results: Array<{ valid: boolean }> }; }
const [kind, sourcePath] = process.argv.slice(2);
if (!(["--markdown", "--html"] as string[]).includes(kind) || !sourcePath) throw new Error("USAGE:sitemath-detect --markdown|--html <arquivo>");
const source = readFileSync(resolve(process.cwd(), sourcePath), "utf8");
const siteMath = require(resolve(process.cwd(), "dist", "sitemath.js")) as Adapter;
const result = kind === "--html" ? siteMath.detectHtml(source) : siteMath.detectMarkdown(source);
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.results.some((entry) => !entry.valid) ? 2 : 0;
