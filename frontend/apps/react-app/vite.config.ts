import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['@accord/common', '@accord/websocket-client'],
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/common/, /websocket-client/, /node_modules/],
    },
  },
  plugins: [react()],
  server: {
    https: false,
  },
});
