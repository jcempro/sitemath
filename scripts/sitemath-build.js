"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "src", "sitemath.js");
const dist = path.join(root, "dist");
const target = path.join(dist, "sitemath.js");

if (!fs.existsSync(source)) throw new Error("SOURCE_MISSING:src/sitemath.js");
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(source, target);

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
fs.writeFileSync(path.join(dist, "sitemath.manifest.json"), `${JSON.stringify(pkg.sitemath, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ code: "SITEMATH_BUILD_OK", files: ["dist/sitemath.js", "dist/sitemath.manifest.json"] }));
