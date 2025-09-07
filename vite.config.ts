import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/main'),
      '@/components': path.resolve(__dirname, './src/main/components'),
      '@/services': path.resolve(__dirname, './src/main/services'),
      '@/hooks': path.resolve(__dirname, './src/main/hooks'),
      '@/stores': path.resolve(__dirname, './src/main/stores'),
      '@/styles': path.resolve(__dirname, './src/main/styles'),
      '@/types': path.resolve(__dirname, './src/main/types')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.GROQ_API_KEY': JSON.stringify(process.env.GROQ_API_KEY),
    'process.env.APP_NAME': JSON.stringify(process.env.APP_NAME),
    'process.env.APP_VERSION': JSON.stringify(process.env.APP_VERSION)
  }
})
