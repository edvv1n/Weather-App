import { useEffect, useMemo, useState } from "react";
import useStoredState from "./useStoredState";

// Auto follows the displayed city timezone; manual choices override it.
export default function useLocalTheme(timeZone) {
  const [now, setNow] = useState(() => new Date());
  const [mode, setMode] = useStoredState("weathered-theme", "auto", (value) =>
    ["auto", "day", "night"].includes(value),
  );
  const formatter = useMemo(() => {
    if (!timeZone) return null;
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      });
    } catch { return null; }
  }, [timeZone]);
  const hour = formatter
    ? Number(formatter.formatToParts(now).find(part => part.type === "hour").value)
    : null;
  const night = mode === "night" || (mode === "auto" && hour !== null && (hour < 6 || hour >= 18));

  useEffect(() => {
    const update = () => setNow(new Date());
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    let timer;
    const tick = () => {
      clearTimeout(timer);
      update();
      timer = setTimeout(tick, 60000 - (Date.now() % 60000));
    };
    timer = setTimeout(tick, 60000 - (Date.now() % 60000));
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = night ? "night" : "day";
  }, [night]);

  return {
    night,
    mode,
    cycleMode: () =>
      setMode((value) => ({ auto: "day", day: "night", night: "auto" })[value]),
    time: formatter ? formatter.format(now) : null,
  };
}
