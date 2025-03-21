import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    // This ensures proper module format
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: '[name].[hash].mjs',
        chunkFileNames: '[name].[hash].mjs',
        assetFileNames: '[name].[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})