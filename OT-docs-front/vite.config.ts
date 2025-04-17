import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/', // 根据你的部署环境修改
  plugins: [
    react(),
    tailwindcss(),
  ],
  server:{
    host:"0.0.0.0",
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false
  }
})
