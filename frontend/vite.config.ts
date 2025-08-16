// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the root directory to 'public' where index.html is located
  root: 'public',
  build: {
    // The output directory will be 'dist' relative to the directory where vite.config.ts is located (frontend/)
    outDir: '../dist', // Build output goes to frontend/dist
    emptyOutDir: true, // Added to clear the output directory before build
    // If you want the output relative to the 'root' directory (public/), you would set outDir: 'dist'
  },
  // Configure the base URL for serving static assets if needed
  // base: '/',
})
