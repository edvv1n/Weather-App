# WeatherEd

A spacious, responsive weather app built with React and Vite. It retains the original condition-based video backgrounds and adds an eight-hour outlook, five-day forecast, saved cities, recent searches and Celsius/Fahrenheit preferences.

## Run locally

For macOS Catalina 10.15, use Node.js 18.20.8. See `MACOS-CATALINA.md` for installation instructions. Vite is pinned to 6.4.4, and Rollup uses its WebAssembly package to avoid native Rollup binary requirements.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm test
npm run build
npm run preview
```


## What is included

- Current temperature, feels-like temperature, daily high/low, humidity, wind and today's rain probability.
- Next eight available forecast hours and five calendar days, displayed in the selected location's local time.
- Debounced, keyboard-accessible city search. Select a named result to preserve exact coordinates.
- Saved cities (up to ten), recent searches (five), last selected location and temperature unit persisted on this browser. Remove saved cities individually or clear recent searches.
- Default city: Lagos. Geolocation is requested only after clicking the location button; it is displayed as “Current location” with coordinates, without reverse geocoding.
- Condition-based original video URLs with static gradient fallback, pause/play, reduced-motion preference, data-saving preference where supported and hidden-tab pausing.
- Cancellable requests, friendly failure states, a 15-second weather timeout, ten-minute in-memory forecast cache and manual refresh.

## Project structure

- `src/App.jsx`: app composition, location selection and request lifecycle.
- `src/components/`: search, current conditions, forecast, background and local SVG icons.
- `src/lib/weather.js`: Open-Meteo integration, weather-code mapping and formatting.
- `src/lib/videos.js`: all original video URLs and mappings.
- `src/hooks/useStoredState.js`: resilient browser preference storage.
- `src/index.css`: all styles and responsive rules, with no external fonts.
- `tests/weather.test.js`: weather mapping, conversion, zero coordinates and API caching regression tests.
- `AUDIT.md`: findings, changes, verification and remaining recommendations.

## Data and deployment considerations

Weather and geocoding use Open-Meteo. The free hosted API is for noncommercial use, with limits and no uptime guarantee. Commercial deployment requires an appropriate plan. If you add a paid API key, protect it in a server-side endpoint rather than a Vite environment variable. Attribution appears in the app footer.

Sources checked October 14, 2026:

- https://open-meteo.com/en/docs
- https://open-meteo.com/en/docs/geocoding-api
- https://open-meteo.com/en/pricing

Weather values are model-derived conditions and forecasts, not safety alerts. Wind remains in km/h when switching temperature units. Forecast time is the provider's data timestamp, not a claim of continuous live refresh. The page checks for data on location selection or manual update; it does not poll in the background.

Video files remain externally hosted, as in the original project. They are not bundled or downloaded into this archive. Confirm availability and reuse rights before public launch. Several original categories deliberately share the same clip; substitute better-matched clips in `src/lib/videos.js` if desired. Autoplay is best-effort: if blocked, the app shows its gradient and a play control. Pausing removes the video source to avoid continued transfer and resumes from the beginning.

Local settings stay in browser storage; there are no accounts or cross-device sync. City search and selected coordinates are transmitted to Open-Meteo to fetch results. Clearing recent searches does not remove saved cities or the last selected location.

## Local-time theme and glass surfaces

In Auto mode, the searched city’s time controls the palette: day from 06:00 to 17:59 and night from 18:00 to 05:59. This uses fixed local hours, not sunrise/sunset or the visitor’s device clock. The theme updates each minute and when the tab becomes visible or regains focus. Weather timestamps remain local to the selected city. Frosted surfaces use translucent gradients, blur, thin highlights and a more opaque fallback when backdrop blur is unsupported. Original condition-based videos remain, with a cooler, darker treatment at night.

The theme button beside °C/°F cycles Auto → Day → Night → Auto. Day and Night override the local-time schedule; Auto restores it. The choice persists in this browser and the button remains visible on mobile.
