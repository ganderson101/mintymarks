import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // auto-injects the manifest <link> and the service-worker registration
      injectRegister: "auto",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "MintyMarks",
        short_name: "MintyMarks",
        description: "Adaptive learning quizzes.",
        theme_color: "#4f46e5",
        background_color: "#ffffff",
        display: "standalone", // full-screen, app-like (no browser chrome)
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // Simplest service worker: precache the built static assets only.
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      // Service worker is DISABLED in dev. A dev SW caches the app shell and is
      // the classic cause of blank pages that survive reloads. The PWA is built
      // and active only for the production bundle (NAS/nginx). Test PWA behaviour
      // with `npm run build && npm run preview`, never `npm run dev`.
      devOptions: { enabled: false },
    }),
  ],
  server: {
    host: true, // listen on all network interfaces (LAN), not just localhost
    port: 5173,
    proxy: {
      // Any request to /api/* is forwarded to the FastAPI backend.
      // This runs on the same origin as the frontend, so no CORS needed.
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
