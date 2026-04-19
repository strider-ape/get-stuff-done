# Browser Extension for Get Stuff Done!

This folder contains the browser extension version of GSD! that works in Chrome, Brave, Edge, and Firefox.

## Ready to Use

The extension is built and ready to install in the `dist-extension/` folder.

## To Rebuild (if you make changes)

If you modify the extension and need to rebuild it:
```bash
npm run build:extension
```

The rebuilt extension will be in the `dist-extension/` folder.

## Install in Chrome / Brave / Edge

1. Open browser and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist-extension/` folder

## Install in Firefox

1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `dist-extension/manifest.json`

## Icon Generation (Optional)

To generate proper icon sizes from the SVG:
```bash
# Install rsvg-convert first (Ubuntu/Debian):
sudo apt install librsvg2-bin

# Generate icons:
rsvg-convert -w 16 -h 16 icon.svg > dist-extension/icon-16.png
rsvg-convert -w 32 -h 32 icon.svg > dist-extension/icon-32.png
rsvg-convert -w 48 -h 48 icon.svg > dist-extension/icon-48.png
rsvg-convert -w 128 -h 128 icon.svg > dist-extension/icon-128.png
```

The extension works exactly the same as the web app - all data is stored locally in your browser's localStorage.