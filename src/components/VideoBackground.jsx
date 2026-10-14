import { useEffect, useRef, useState } from "react";
import { videoSources } from "../lib/videos";
import Icon from "./Icon";
export default function VideoBackground({ kind, night }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(
    () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !!navigator.connection?.saveData,
  );
  const [failedSource, setFailedSource] = useState(null);
  const [ready, setReady] = useState(false);
  const source = videoSources[kind] || videoSources.default;
  const failed = failedSource === source;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = (event) => {
      if (event.matches) setPaused(true);
    };
    media.addEventListener("change", reduce);
    return () => media.removeEventListener("change", reduce);
  }, []);
  useEffect(() => {
    const video = ref.current;
    const sync = () => {
      if (!video) return;
      if (paused || document.hidden) video.pause();
      else video.play().catch(() => setPaused(true));
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [paused, source, failed]);
  return (
    <>
      <div className={`scene ${night ? "night" : ""}`} aria-hidden="true">
        {!failed && (
          <video
            ref={ref}
            key={source}
            src={paused ? undefined : source}
            muted
            loop
            playsInline
            preload="none"
            onCanPlay={() => setReady(true)}
            onLoadStart={() => setReady(false)}
            onError={() => setFailedSource(source)}
            className={ready && !paused ? "ready" : ""}
          />
        )}
        <div className="scene-shade" />
      </div>
      <button
        className="background-control"
        onClick={() => {
          setFailedSource(null);
          setPaused(failed ? false : !paused);
        }}
        aria-pressed={!paused && !failed}
      >
        <Icon name={paused || failed ? "play" : "pause"} size={14} />
        {failed
          ? "Retry background"
          : paused
            ? "Play background"
            : "Pause background"}
      </button>
    </>
  );
}
