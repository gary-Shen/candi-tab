import { resolve } from 'node:path'
import process from 'node:process'

import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  publicDir: resolve(__dirname, 'public'),

  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },

  server: {
    host: '0.0.0.0',
  },

  plugins: [
    react(),
    svgr(),
    ViteEjsPlugin(),
    process.env.ANALYZE ? visualizer({ open: true, brotliSize: true, filename: './dist/_report.html' }) : undefined,
  ],
  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch',
      '@': resolve(__dirname, 'src/'),
    },
  },
  define: {
    global: 'window',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        options: resolve(__dirname, 'src/options.html'),
        background: resolve(__dirname, 'src/background.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
  },
})
