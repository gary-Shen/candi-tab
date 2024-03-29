import { resolve } from 'path';

import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { ViteEjsPlugin } from 'vite-plugin-ejs';

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
    process.env.ANALYZE && visualizer({ open: true, brotliSize: true, filename: './dist/_report.html' }),
  ].filter(Boolean),
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
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
  },
});
