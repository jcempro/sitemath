/** Configuração de bundle UMD com baseline Web Platform resolvida em cada build. */
import browserslistToEsbuild from "browserslist-to-esbuild";

const baselineQuery = "baseline widely available with downstream";

export default {
  build: {
    emptyOutDir: false,
    outDir: "dist",
    target: browserslistToEsbuild(baselineQuery),
    lib: { entry: "src/sitemath.ts", formats: ["umd"], name: "SiteMath", fileName: () => "sitemath.js" },
    rollupOptions: { output: { exports: "named" } }
  }
};
