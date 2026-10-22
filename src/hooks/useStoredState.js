import { useState } from "react";
export default function useStoredState(key, fallback, validate = () => true, initialOverride) {
  const [value, setValue] = useState(() => {
    if (initialOverride !== undefined) return initialOverride;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return data !== null && validate(data) ? data : fallback;
    } catch {
      return fallback;
    }
  });
  function update(next) {
    setValue((previous) => {
      const result = typeof next === "function" ? next(previous) : next;
      try {
        localStorage.setItem(key, JSON.stringify(result));
      } catch {
        /* Storage can be unavailable in private browsing. */
      }
      return result;
    });
  }
  return [value, update];
}
