import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The API runs on :3000 in development; same-origin cookies work through the proxy.
    proxy: { "/api": "http://localhost:3000" },
  },
});
