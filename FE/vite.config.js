import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        comtam: path.resolve(__dirname, 'comtam.html'),
        samhouse: path.resolve(__dirname, 'samhouse.html'),
        monquanchat: path.resolve(__dirname, 'monquanchat.html'),
        hoatearoom: path.resolve(__dirname, 'hoatearoom.html'),
        monari: path.resolve(__dirname, 'monari.html'),
      },
    },
  },
});
