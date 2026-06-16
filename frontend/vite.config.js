import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8081"
    }
  },
  build: {
    outDir: "react-dist",
    rollupOptions: {
      input: {
        react: resolve(projectRoot, "react.html")
      }
    }
  }
});
