# Manual theme control update

Node 18 lint and production build passed. Chromium checks passed for manual Day/Night selection, persistence after reload, return to Auto, and a visible unclipped button with no horizontal overflow at 320px.

---

# Local-time theme and glass update

- Node 18.20.8: lint and Vite 6 production build passed.
- Chromium clock simulation: device timezone Asia/Tokyo while viewing Lagos data; correct day at 17:59, night at 18:00, night at 05:59 and day at 06:00.
- Focus resynchronization after a device-clock change verified.
- Desktop day/night screenshots and mobile night layout visually inspected.
- No horizontal overflow at 390px or 320px; no uncaught browser errors.
- Weather fixtures and reduced-motion mode used for these checks. Actual external videos and native Catalina remain outside this test environment.

---

# Catalina repack validation

Executed October 14, 2026 using Node 18.20.8 and npm 10.8.2 on Linux.

- Clean `npm ci`: passed, no engine warnings.
- `npm run lint`: passed.
- `npm test`: all four regression tests passed.
- `npm run build`: passed with Vite 6.4.4 and WebAssembly Rollup 4.64.6.
- Local Vite development server under Node 18: HTTP 200 and WeatherEd HTML verified.
- macOS Intel esbuild optional package is present in the cross-platform lockfile.
- Bundle: 65.15 kB gzip JavaScript and 3.03 kB gzip CSS, excluding videos.
- Native macOS Catalina and Safari were not available for direct verification.

Changes are limited to dependency/toolchain compatibility, browser CSS fallbacks and documentation. Prior interface verification is recorded below; it was performed before this repack.

---

# Previous redesign validation

Executed October 14, 2026.

- `npm run lint`: passed.
- `npm test`: four regression tests passed (temperature conversion, WMO/video mapping, zero coordinates and labels, forecast parameters and cache).
- `npm run build`: passed, Vite 7.0.4; output JS 204.88 kB / 65.15 kB gzip and CSS 9.88 kB / 3.02 kB gzip. Video transfer is not included in these sizes.
- Live HTTP requests: Open-Meteo forecast and geocoding endpoints returned valid JSON with expected data. The full app query was used for the forecast request.
- Chromium browser checks: desktop render at 1440 × 1000, save city, persistence after reload, Fahrenheit persistence, keyboard city selection, recent-search display, and no horizontal page overflow at 390px and 320px widths.
- Browser failure check: a simulated forecast-service failure kept the previous city's weather and showed an error notice.
- Browser reduced-motion check: after reload with reduced motion enabled, the video did not start and the play control appeared.
- Desktop and mobile screenshots inspected. Fixed the hourly strip's grid minimum-width overflow found during inspection.
- No uncaught page errors during the completed browser checks.

Browser checks intercepted API requests with a captured live forecast fixture and controlled search results; these confirm UI behavior, not live forecasts for each test city. Video requests were deliberately aborted to test fallback. Actual external-video availability, autoplay and transitions on real iOS/Android devices remain deployment checks. No claim is made that video files have been recompressed or that all third-party URLs will remain available.

The source archive excludes node_modules and build output. Run `npm ci` before building. The browser QA harness and temporary screenshots are not bundled; the focused Node regression tests are included.
