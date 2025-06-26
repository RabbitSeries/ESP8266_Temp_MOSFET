import { defineConfig, type ConfigEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"
// https://vite.dev/config/
export default defineConfig((env: ConfigEnv) => {
  const config: UserConfig = {
    plugins: [react(), viteSingleFile()],
    build: {
      outDir: env.mode === "deploy" ? "../../docs" : "../../data",
      sourcemap: false,
      minify: "terser",
      emptyOutDir: true
    },
    server: {
      open: true,
      port: 5174,
      proxy: {
        '/proxy': {
          target: 'http://192.168.1.32',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/proxy/, '')
        }
      }
    }
  }
  return config
})
