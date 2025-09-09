import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
  server: {
    port: 3000,
    host: true, // Listen on all network interfaces
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "https://eval-api.pecha.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    port: parseInt(process.env.PORT || "10000"),
    host: true,
    allowedHosts: [
      "eval.pecha.tools",
      "eval-api.pecha.tools",
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      ".onrender.com",
      ".render.com",
    ],
  },
});
