import { useEffect, useRef, useState } from "react";
import { videoSources } from "../lib/videos";
import Icon from "./Icon";
export default function VideoBackground({ kind, night }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!navigator.connection?.saveData);
  const [failedSource, setFailedSource] = useState(null);
  const [readySource, setReadySource] = useState(null);
  const [fallbackSource, setFallbackSource] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const source = videoSources[kind] || videoSources.default;
  const usingFallback = fallbackSource === source;
  const playbackSource = usingFallback ? source.replace(/\.mp4$/, ".webm") : source;
  const failed = failedSource === source;
  const ready = readySource === source;
  const requestPlay = (video) => {
    if (!video) return;
    video.play().catch((error) => {
      // A deliberate pause/source change can interrupt a pending play request.
      if (error.name === "NotAllowedError" && ref.current === video) setPaused(true);
    });
  };
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = (event) => { if (event.matches) setPaused(true); };
    media.addEventListener("change", reduce);
    return () => media.removeEventListener("change", reduce);
  }, []);
  useEffect(() => {
    const video = ref.current;
    const sync = () => {
      if (!video) return;
      if (paused || document.hidden || failed) video.pause();
      else requestPlay(video);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [paused, source, playbackSource, failed, attempt]);
  function toggle() {
    const video = ref.current;
    if (failed) {
      setFailedSource(null);
      setReadySource(null);
      setPaused(false);
      video?.load();
      requestPlay(video);
      setAttempt((v) => v + 1);
    } else if (paused) {
      setPaused(false);
      // Start directly in the user gesture for mobile playback policies.
      requestPlay(video);
    } else {
      video?.pause();
      setPaused(true);
    }
  }
  return (
    <>
      <div className={`scene ${night ? "night" : ""}`} aria-hidden="true">
        <video ref={ref} key={playbackSource} src={playbackSource} muted loop playsInline preload="none"
          onCanPlay={() => setReadySource(source)}
          onError={() => {
            if (!usingFallback) { setReadySource(null); setFallbackSource(source); }
            else setFailedSource(source);
          }}
          className={ready && !paused && !failed ? "ready" : ""} />
        <div className="scene-shade" />
      </div>
      <button className="background-control" onClick={toggle} aria-pressed={!paused && !failed}
        aria-describedby={failed ? "background-status" : undefined}>
        <Icon name={paused || failed ? "play" : "pause"} size={14} />
        {failed ? "Retry background" : paused ? "Play background" : "Pause background"}
      </button>
      {failed && <span id="background-status" className="background-status" role="status">
        Video unavailable. Showing a still background.
      </span>}
    </>
  );
}
