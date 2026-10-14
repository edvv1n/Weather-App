# Run WeatherEd on macOS Catalina 10.15

This is the web app source package, configured for development on an Intel Mac running Catalina. It is not a native `.app` or `.dmg` application. The weather features and original video URLs are preserved.

## 1. Install Node.js 18.20.8

If you already have nvm, open Terminal in the extracted `Weather-App-main` folder:

```sh
nvm install
nvm use
node -v
```

The included `.nvmrc` selects `v18.20.8`. Otherwise, use the official Node.js 18.20.8 macOS installer, then reopen Terminal:

https://nodejs.org/dist/v18.20.8/node-v18.20.8.pkg

Official release details and download links:
https://nodejs.org/en/blog/release/v18.20.8

Check that `node -v` prints `v18.20.8`. The installer includes npm; do not upgrade npm to the latest major version on Node 18. npm 9 or 10 works; validation uses npm 10.8.2.

## 2. Install and start

Extract into a fresh folder rather than copying a different computer's `node_modules` directory. In Terminal, enter that extracted project folder and run:

```sh
npm ci
npm run dev
```

Open the localhost address printed by Vite, normally http://127.0.0.1:5173. Stop the server with Control+C. Do not open `index.html` by double-clicking it.

No API key is required for the included noncommercial Open-Meteo setup. Internet access is needed for weather, search and background videos.

## 3. Build or validate

```sh
npm run lint
npm test
npm run build
npm run preview
```

Build output goes into `dist`. The compiled app can be hosted as a static website. For a modern hosted build environment, select Node 22.12 or later rather than Node 18.

## Compatibility changes

- Vite 7 replaced with pinned Vite 6.4.4, which supports Node 18.
- Node 18.20.8 selected in `.nvmrc` and `.node-version`.
- All direct dependency versions pinned; `package-lock.json` regenerated.
- Rollup resolved to `@rollup/wasm-node` 4.64.6 to avoid native Rollup macOS binary requirements.
- JavaScript build target includes Safari 14; `100vh` fallback and Safari-prefixed backdrop blur added.
- Local dev/preview servers bind to 127.0.0.1 by default.
- React is retained; the build-tool Node requirement was the compatibility issue.

Use Safari 14 or later, or a compatible Chrome/Firefox installation. Catalina's older Safari 13 is not a supported target. Actual external-video autoplay and browser behavior still depend on the browser and video host.

Node 18 reached end of life on April 30, 2025. This is a legacy local-development compatibility setup, not a maintained runtime for a public production server. The deployed app is static and does not need a Node server.

## Validation scope

Clean installation, lint, tests and production build are checked using Node 18.20.8 on Linux. This environment cannot execute macOS Catalina, so a native Mac test remains necessary. See `VALIDATION.md` for detailed results.
