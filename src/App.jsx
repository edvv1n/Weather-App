import { useEffect, useRef, useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import Forecast from "./components/Forecast";
import VideoBackground from "./components/VideoBackground";
import Icon from "./components/Icon";
import useStoredState from "./hooks/useStoredState";
import useLocalTheme from "./hooks/useLocalTheme";
import { condition, getForecast, locationKey, placeLabel } from "./lib/weather";
const validPlace = (p) =>
  p &&
  typeof p.name === "string" &&
  Number.isFinite(p.latitude) &&
  Number.isFinite(p.longitude);
const validPlaces = (value) => Array.isArray(value) && value.every(validPlace);
const initialPlace = {
  name: "Lagos",
  country: "Nigeria",
  latitude: 6.4541,
  longitude: 3.3947,
};
export default function App() {
  const [unit, setUnit] = useStoredState("weathered-unit", "C", (v) =>
    ["C", "F"].includes(v),
  );
  const [saved, setSaved] = useStoredState("weathered-saved", [], validPlaces);
  const [recent, setRecent] = useStoredState(
    "weathered-recent",
    [],
    validPlaces,
  );
  const [place, setPlace] = useStoredState(
    "weathered-place",
    initialPlace,
    validPlace,
  );
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [locating, setLocating] = useState(false),
    [retry, setRetry] = useState(0);
  const { night, time, mode, cycleMode } = useLocalTheme(result?.data?.timezone);
  const locationRequest = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        controller.abort(
          new DOMException(
            "Weather request timed out. Please retry.",
            "TimeoutError",
          ),
        ),
      15000,
    );
    setLoading(true);
    setError("");
    getForecast(place, controller.signal, retry > 0)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ data, place });
      })
      .catch((err) => {
        if (err.name !== "AbortError")
          setError(
            err.name === "TimeoutError"
              ? "Weather request timed out. Please retry."
              : err.message || "Unable to load weather. Check your connection.",
          );
      })
      .finally(() => {
        if (
          !controller.signal.aborted ||
          controller.signal.reason?.name === "TimeoutError"
        )
          setLoading(false);
      });
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [place, retry]);
  function select(next) {
    locationRequest.current += 1;
    setLocating(false);
    setPlace(next);
    setRecent((previous) =>
      [
        next,
        ...previous.filter((p) => locationKey(p) !== locationKey(next)),
      ].slice(0, 5),
    );
  }
  function locate() {
    if (!navigator.geolocation) {
      setError(
        "Your browser does not support location. Search for a city instead.",
      );
      return;
    }
    const request = ++locationRequest.current;
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request !== locationRequest.current) return;
        select({
          name: "Current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        if (request !== locationRequest.current) return;
        setLocating(false);
        setError(
          "Location unavailable. Allow location access or search for a city.",
        );
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }
  const data = result?.data,
    shownPlace = result?.place;
  const isSaved =
    shownPlace && saved.some((p) => locationKey(p) === locationKey(shownPlace));
  const sky = data
    ? condition(data.current.weather_code, data.current.is_day)
    : { video: "clouds" };
  return (
    <>
      <VideoBackground kind={sky.video} night={night} />
      <div className="app-shell">
        <header>
          <a className="brand" href="./">
            <span className="brand-icon">
              <Icon name="sun" size={25} />
            </span>
            WeatherEd<span className="brand-dot">.</span>
          </a>
          <div
            className="header-note local-theme"
            title={
              mode === "auto"
                ? "Theme follows the displayed city’s local time: day 06:00–17:59; night 18:00–05:59"
                : "Manual theme selected"
            }
          >
            <Icon name={night ? "moon" : "sun"} size={15} />
            <span>
              {night ? "Night" : "Day"} · {mode === "auto" ? "Auto" : "Manual"}{" "}
              <span aria-hidden="true">·</span> {time ? `${time} in ${shownPlace?.name || "selected location"}` : "Waiting for city time"}
            </span>
          </div>
          <div className="header-controls">
            <button
              className="theme-control"
              onClick={cycleMode}
              aria-label={`Theme: ${mode}. Switch to ${{ auto: "day", day: "night", night: "auto" }[mode]}`}
              title="Cycle theme: Auto → Day → Night"
            >
              <Icon
                name={
                  mode === "auto" ? "clock" : mode === "day" ? "sun" : "moon"
                }
                size={17}
              />
              <span>{mode[0].toUpperCase() + mode.slice(1)}</span>
            </button>
            <div className="units" aria-label="Temperature unit">
              {["C", "F"].map((value) => (
                <button
                  key={value}
                  aria-pressed={unit === value}
                  onClick={() => setUnit(value)}
                >
                  °{value}
                </button>
              ))}
            </div>
          </div>
        </header>
        <main>
          <div className="toolbar">
            <div>
              <p className="eyebrow">LOOK UP. PLAN AHEAD.</p>
              <p className="intro">Your day, in the clear.</p>
            </div>
            <SearchBar
              onSelect={select}
              onLocate={locate}
              locating={locating}
            />
          </div>
          {(saved.length > 0 || recent.length > 0) && (
            <nav className="city-collections" aria-label="Your cities">
              {saved.length > 0 && (
                <div>
                  <span>
                    <Icon name="star" size={13} /> Saved
                  </span>
                  {saved.map((p) => (
                    <div className="city-chip" key={locationKey(p)}>
                      <button title={placeLabel(p)} onClick={() => select(p)}>
                        {p.name}
                      </button>
                      <button
                        aria-label={`Remove ${p.name} from saved cities`}
                        onClick={() =>
                          setSaved((list) =>
                            list.filter(
                              (item) => locationKey(item) !== locationKey(p),
                            ),
                          )
                        }
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {recent.length > 0 && (
                <div>
                  <span>Recent</span>
                  {recent
                    .filter(
                      (p) =>
                        !saved.some((s) => locationKey(s) === locationKey(p)),
                    )
                    .map((p) => (
                      <button
                        className="recent-city"
                        key={locationKey(p)}
                        title={placeLabel(p)}
                        onClick={() => select(p)}
                      >
                        {p.name}
                      </button>
                    ))}
                  <button
                    className="clear-history"
                    onClick={() => setRecent([])}
                  >
                    Clear
                  </button>
                </div>
              )}
            </nav>
          )}
          <div className="status-area" aria-live="polite">
            {locating
              ? "Finding your location…"
              : loading
                ? `Getting the latest for ${place.name}…`
                : ""}
          </div>
          {error && (
            <div className="error" role="alert">
              <span>
                {error}
                {result && " Previous weather remains below."}
              </span>
              <button onClick={() => setRetry((v) => v + 1)}>Retry</button>
            </div>
          )}
          {data ? (
            <div
              className={`weather-layout ${loading ? "updating" : ""}`}
              aria-busy={loading}
            >
              <WeatherCard
                data={data}
                place={shownPlace}
                unit={unit}
                saved={isSaved}
                onSave={() =>
                  setSaved((list) =>
                    isSaved
                      ? list.filter(
                          (p) => locationKey(p) !== locationKey(shownPlace),
                        )
                      : [...list, shownPlace].slice(-10),
                  )
                }
              />
              <Forecast data={data} unit={unit} />
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="cloud" size={80} />
              <h1>
                {loading
                  ? "A moment for the weather."
                  : "A fresh outlook awaits."}
              </h1>
              <p>
                {loading
                  ? "Gathering current conditions and your forecast."
                  : "Search for a city, or retry when you’re connected."}
              </p>
            </div>
          )}
          {data && (
            <div className="weather-meta">
              <span>
                Forecast data · {data.current.time.replace("T", " at ")} ·{" "}
                {data.timezone.replaceAll("_", " ")}
              </span>
              <button onClick={() => setRetry((v) => v + 1)} disabled={loading}>
                <Icon name="refresh" size={13} /> Check for updates
              </button>
            </div>
          )}
        </main>
        <footer>
          <span>Whatever the weather, make it your day.</span>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Weather data by Open-Meteo ↗
          </a>
        </footer>
      </div>
    </>
  );
}
