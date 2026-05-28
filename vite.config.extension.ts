import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copy } from 'vite-plugin-copy'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copy({
      targets: [
        { src: 'extension/manifest.json', dest: 'dist-extension' },
        { src: 'icon.svg', dest: 'dist-extension' },
        { src: 'icon16.png', dest: 'dist-extension' },
        { src: 'icon48.png', dest: 'dist-extension' },
        { src: 'icon128.png', dest: 'dist-extension' },
        { src: 'src/extension-overrides.css', dest: 'dist-extension' },
      ]
    })
  ],
  publicDir: false,
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Disable PWA manifest generation
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'manifest.json') return 'manifest.json';
          if (assetInfo.name === 'sw.js') return 'sw.js';
          if (assetInfo.name === 'extension-overrides.css') return 'extension-overrides.css';
          return assetInfo.name as string;
        },
      },
    },
  },
})