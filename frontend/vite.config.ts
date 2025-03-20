import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/eng-vis/",
  build: {
    outDir: "dist",
  },
  server: {
    port: 8000,
    host: true, // needed for docker/container environments
  },
});
