# WeatherEd bug fixes — October 22, 2026

## Changes

1. City suggestions stay open during taps inside the search area, including when the mobile keyboard loses focus. Selection still uses click activation so scrolling does not select a city. Keyboard arrows, Enter, Escape, and outside dismissal remain supported. Suggestions have a scrollable height limit and mobile inputs use 16px text to avoid automatic zoom.
2. Location errors have independent state. Retry location repeats geolocation, and denied permission explains how to enable access. Weather errors retain their own retry operation.
3. The background control is now in document flow below the dashboard, so it does not cover forecasts.
4. Pausing retains the media source. Play is requested within the user gesture. Each original MP4 has a WebM fallback; incompatible or failed MP4 playback automatically tries WebM. If both fail, the static background remains and Retry reloads the media. Reduced-motion and data-saving defaults remain respected.
5. City selections create query-string URLs with coordinates and labels. URLs override the local default on startup and work with Back/Forward. Invalid coordinate routes are ignored. The initial city receives a URL without creating an extra history entry.
6. Clear recent offers Undo. If a new city is selected before Undo, the restored history merges with it without duplicates. Undo stays available until dismissed, used, or the page is reloaded.
7. The city collection row reserves space even when empty. Its chips scroll horizontally instead of expanding the dashboard vertically.

## Changed source files

- src/App.jsx
- src/components/SearchBar.jsx
- src/components/VideoBackground.jsx
- src/hooks/useStoredState.js
- src/index.css
- src/lib/placeRoute.js (new)
- public/videos/*.webm (new fallbacks; original MP4 files retained)
- tests/placeRoute.test.js (new)
- tests/browser-regression.cjs (new)

## Validation completed

- npm run build: passed
- npm run lint: passed
- npm test: 6 tests passed
- Chromium with touch enabled at 390, 820 and 1280px widths: city selection, URL startup, Back/Forward, recent history clear/undo, two geolocation attempts, stable dashboard position, no horizontal page overflow, no forecast/control overlap, video play/pause/retry passed.
- Browser interaction tests used controlled weather/geocoding responses. Actual bundled media were served locally. The test Chromium cannot decode the original H.264 streams; it successfully played the WebM fallback.
- All original MP4s were inspected with ffprobe and contain H.264/yuv420p video.

## Remaining environment checks

Safari/WebKit could not run here because required system libraries are absent. Validate on an iPhone with its on-screen keyboard and on Android Chrome. Live Open-Meteo availability, browser permission prompts, and the deployed Vercel media responses were not tested.

## Run or deploy

Use your existing supported Node version (see MACOS-CATALINA.md). From the extracted project folder:

```sh
npm ci
npm run dev
```

For Vercel, use `npm run build` and output directory `dist`. Commit all seven MP4 and all seven WebM files under `public/videos`; both formats must be present in the deployed output. The package omits node_modules, build output, Git history and local environment files. No API key is needed by the current Open-Meteo integration.

Optional browser regression checks require Playwright and its browsers installed in your development environment. Start the app, then run `node tests/browser-regression.cjs`. Set `CHROMIUM_ONLY=1` to run only Chromium; `TEST_URL` defaults to http://127.0.0.1:5173. The browser suite is separate from `npm test`.
