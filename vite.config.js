import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/family-tree-maker/ on GitHub Pages.
  // Must match the repo name. Use '/' for local Docker/nginx and dev.
  base: process.env.GITHUB_PAGES ? '/family-tree-maker/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
