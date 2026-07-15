/** Prepara e envia o único gatilho de release autorizado para a automação remota. */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(__dirname, "..", "..", "..");
const [requested] = process.argv.slice(2);
const version = String(requested ?? "").trim();
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version)) throw new Error("USAGE:release:publish <versao-semver>");
const run = (command: string, args: string[]): string => execFileSync(command, args, { cwd: root, encoding: "utf8" }).trim();
if (run("git", ["branch", "--show-current"]) !== "dev") throw new Error("BRANCH_RELEASE_INVALIDA:dev obrigatoria");
if (run("git", ["status", "--porcelain"])) throw new Error("WORKTREE_NAO_LIMPO");
if (existsSync(join(root, "release"))) throw new Error("GATILHO_RELEASE_EXISTENTE");

const packagePath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { version?: string };
if (pkg.version !== version) {
  pkg.version = version;
  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  run("git", ["add", "--", "package.json"]);
  run("git", ["commit", "-m", `chore: prepara release v${version}`]);
  run("git", ["push", "origin", "dev"]);
}
run(process.execPath, [join(root, ".agents", "core", "runtime", "scripts", "repo-tools.js"), "agent:release:trigger", version]);
run("git", ["add", "--", "release"]);
run("git", ["commit", "-m", `chore: aciona release v${version}`]);
run("git", ["push", "origin", "dev"]);
console.log(JSON.stringify({ code: "SITEMATH_RELEASE_TRIGGERED", version }));
