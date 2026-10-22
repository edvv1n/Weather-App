import { useEffect, useRef, useState } from "react";
import { searchCities, placeLabel, locationKey } from "../lib/weather";
import Icon from "./Icon";
export default function SearchBar({ onSelect, onLocate, locating }) {
  const [query, setQuery] = useState(""),
    [results, setResults] = useState([]),
    [open, setOpen] = useState(false),
    [status, setStatus] = useState(""),
    [active, setActive] = useState(-1);
  const wrapper = useRef(null);
  const interacting = useRef(false);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("Searching…");
      try {
        const places = await searchCities(query.trim(), controller.signal);
        if (controller.signal.aborted) return;
        setResults(places);
        setStatus(places.length ? "" : "No cities found. Try a nearby city.");
      } catch (error) {
        if (!controller.signal.aborted)
          setStatus(error.message || "Search unavailable. Try again.");
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  useEffect(() => {
    const outside = (event) => {
      interacting.current = !!wrapper.current?.contains(event.target);
      if (!interacting.current) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const choose = (place) => {
    onSelect(place);
    setOpen(false);
    setQuery("");
    setResults([]);
    setStatus("");
  };
  return (
    <div
      className="search-wrap"
      ref={wrapper}
      onKeyDownCapture={() => { interacting.current = false; }}
      onBlur={(e) => {
        if (!interacting.current && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length) choose(results[Math.max(active, 0)]);
        }}
      >
        <Icon name="search" size={19} />
        <input
          aria-label="Search for a city"
          placeholder="Search for a city"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && query.length >= 2}
          aria-controls="city-results"
          aria-activedescendant={
            active >= 0 && results[active] ? `city-${active}` : undefined
          }
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setResults([]);
            setStatus("");
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            interacting.current = false;
            if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((v) => Math.min(v + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((v) => Math.max(v - 1, 0));
            }
          }}
        />
        {query && (
          <button
            type="button"
            className="icon-button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
              setStatus("");
            }}
          >
            <Icon name="close" size={16} />
          </button>
        )}
        <button
          type="button"
          className="locate icon-button"
          aria-label="Use my current location"
          title="Use my current location"
          disabled={locating}
          onClick={onLocate}
        >
          <Icon name="pin" size={19} />
        </button>
      </form>
      {open && query.trim().length >= 2 && (
        <div className="suggestions">
          <ul id="city-results" role="listbox" aria-label="Matching cities">
            {results.map((place, i) => (
              <li
                role="option"
                aria-selected={active === i}
                id={`city-${i}`}
                key={locationKey(place)}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(place)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(place);
                  }
                }}
                className={active === i ? "selected" : ""}
              >
                <Icon name="pin" size={16} />
                <span>{placeLabel(place)}</span>
                <Icon name="arrow" size={16} />
              </li>
            ))}
          </ul>
          <p role="status">
            {status ||
              (results.length
                ? "Use ↑ ↓ and Enter to select"
                : "Keep typing to find a city…")}
          </p>
        </div>
      )}
    </div>
  );
}
