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
  },
  preview: {
    port: parseInt(process.env.PORT || "10000"),
    host: true,
  },
});
