import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// relatív base: a GitHub Pages alútvonalán (/villanyszerelo-vizsga/) is működik
export default defineConfig({
  base: './',
  plugins: [react()],
})
