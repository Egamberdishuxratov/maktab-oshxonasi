import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pid } from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  cacheDir: resolve(tmpdir(), 'ssschol-vite-cache', String(pid)),
  plugins: [
    react(),
    tailwindcss(),
  ],
})