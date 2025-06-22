import { defineConfig, type ConfigEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"
// https://vite.dev/config/
export default defineConfig((env: ConfigEnv) => {
  const config: UserConfig = {
    plugins: [react(), viteSingleFile()],
    build: {
      outDir: env.mode === "deploy" ? "../../demo" : "../../data",
      sourcemap: false,
      minify: "terser",
      emptyOutDir: true
    },
    server: {
      open: true
    }
  }
  return config
})
