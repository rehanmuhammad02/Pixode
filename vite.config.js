import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "/build/", publicDir: false,
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5173, strictPort: true, origin: "http://127.0.0.1:5173" },
  build: { outDir: "public/build", emptyOutDir: true, manifest: true, sourcemap: false,
    rollupOptions: { input: "resources/js/studio/main.jsx" } },
});