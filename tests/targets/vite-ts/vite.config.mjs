import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { input: { withSitemath: "index.html", withoutSitemath: "without.html" } }
  }
});
