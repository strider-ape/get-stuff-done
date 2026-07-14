# Get Stuff Done! - Browser Extension Source Code

## Build Instructions

### Prerequisites
- Node.js (v18 or later recommended)
- npm (comes with Node.js)

### Setup
1. Clone the repository or extract the source files
2. Run `npm install` to install dependencies

### Build
Run the following command to build the extension:
```bash
npm run build:extension
```

The built extension will be output to the `dist-extension/` folder.

### Package for Firefox
To create a zip for Firefox add-on submission:
```bash
cd dist-extension
tar -a -c -f ../get-stuff-done-firefox.zip -C . .
```

### Build Environment
- OS: Windows/Linux/macOS (any OS with Node.js support)
- Node.js: v18+
- npm: v9+

### Programs Used
- Vite 7.2.4 - Build tool and dev server
- React 19 - UI framework
- Tailwind CSS 4 - CSS framework
- TypeScript - Type checking (optional)

## License
MIT
