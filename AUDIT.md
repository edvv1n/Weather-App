# WeatherEd code audit and redesign

Reviewed October 14, 2026. Source: supplied Weather-App-main.zip.

## Findings and fixes

| Original finding                                              | Impact                                            | Change                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Weather, search and details packed into one narrow dark panel | Dense layout on desktop and mobile                | Open current-condition layout with spacious typography, a restrained forecast surface and responsive stacking |
| Geocoding results reduced to a formatted string               | Exact selected coordinates lost                   | Preserve city objects and request forecasts by latitude/longitude                                             |
| Truthiness checks on latitude and longitude                   | Valid zero coordinates rejected                   | Numeric validation; zero-coordinate regression coverage                                                       |
| Overlapping weather and suggestion requests                   | Older response could overwrite latest selection   | Abort superseded requests and check abort state before rendering                                              |
| Geolocation callback could arrive after manual selection      | Unexpected location switch                        | Ignore obsolete geolocation callbacks                                                                         |
| No network timeout for weather                                | Loading could continue indefinitely               | 15-second timeout and retry; existing successful data remains visibly labeled                                 |
| API key and endpoint required without setup guidance          | Difficult first-run setup                         | Default to documented no-key Open-Meteo noncommercial API                                                     |
| HTTP weather icons                                            | Insecure resource URL                             | Local SVG icons with no remote icon requests                                                                  |
| Mouse-only suggestions, weak labels                           | Keyboard and assistive-technology barriers        | Combobox, active descendant, arrow/Enter/Escape handling, button labels and status announcements              |
| Direct DOM message box and innerHTML                          | Unnecessary escape from React rendering           | Declarative React status and error UI                                                                         |
| No video controls, mobile playsInline or fallback             | Poor accessibility and unreliable mobile playback | Inline muted video, pause/play, static fallback and reduced-motion handling                                   |
| axios, Tailwind and Font Awesome for a small interface        | Avoidable dependency overhead                     | Native fetch, one CSS stylesheet and inline SVG icons                                                         |
| Template documentation and favicon                            | Unfinished project presentation                   | WeatherEd favicon, metadata, setup/deployment guide and this audit                                            |

## Requested additions implemented

Saved cities and recent searches, persistent Celsius/Fahrenheit selection, next-eight-hour forecast and five-day outlook. The original weather-reactive background system and URLs remain. OpenWeather condition strings are replaced by an explicit Open-Meteo WMO-code mapping. The interface defaults to Lagos and remembers the user's selected city.

## Intentional limits

- Video payloads are not optimized by this code refactor; external MP4 size still dominates bandwidth when video is enabled. Static fallback means the app remains usable without the video.
- Several original condition categories share one video. Mapping is preserved, but that does not ensure each scene visually matches snow, drizzle or fog.
- Native weather alerts, air quality, radar and account sync are not included.
- The free API setup is for noncommercial usage. Commercial use needs an appropriate provider arrangement and, if keyed, a server-side proxy.
- Browser preferences persist locally; forecast cache is in memory only. Offline weather caching is not implemented.
- No continuous polling: refresh is explicit, and returning to a previously viewed city can reuse a result for ten minutes.

## Useful next features, in priority order

1. Offline last-known forecast with a clear stale-data timestamp, plus an installable PWA.
2. Day/night-specific, compressed video variants hosted under your control, with verified reuse rights.
3. Optional air-quality and UV details behind an expandable section to preserve the clean layout.
4. A “best time to head out” summary using forecast rain probability and temperature, clearly described as a forecast.
5. Optional severe-weather alerts from an authoritative regional provider, where coverage exists.

See `VALIDATION.md` for executed checks and limitations.

## macOS Catalina repack

Vite is now pinned to 6.4.4 for Node 18.20.8 compatibility. Rollup uses the WebAssembly distribution, direct dependency versions are pinned, and Safari CSS fallbacks are included. See `MACOS-CATALINA.md` and the new section in `VALIDATION.md`.
