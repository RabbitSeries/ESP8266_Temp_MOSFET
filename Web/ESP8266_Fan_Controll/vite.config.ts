import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "../../data",
    sourcemap: false,
    minify: "terser",
    emptyOutDir: true
  },
  server: {
    open: true
  }
})
