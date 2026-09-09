import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // silence the deprecation warnings from Carbon's internal SCSS
        quietDeps: true,
      },
    },
  },
});
