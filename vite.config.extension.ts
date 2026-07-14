import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist-extension')
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
      const files = [
        ['extension/manifest.json', 'manifest.json'],
        ['icon.svg', 'icon.svg'],
        ['icon16.png', 'icon16.png'],
        ['icon48.png', 'icon48.png'],
        ['icon128.png', 'icon128.png'],
        ['src/extension-overrides.css', 'extension-overrides.css'],
      ]
      for (const [src, dest] of files) {
        copyFileSync(resolve(__dirname, src), resolve(outDir, dest))
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyExtensionFiles(),
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