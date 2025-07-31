import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert", "server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert", "server.crt")),
    }
  },
  esbuild: {
    sourcemap: process.env.VITE_DISABLE_SOURCEMAP ? false : true
  }
})
