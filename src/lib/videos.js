const base = import.meta.env.BASE_URL;
const video = (name) => `${base}videos/${name}.mp4`;

export const videoSources = {
  clear: video("clear"),
  clouds: video("clouds"),
  fog: video("fog"),
  drizzle: video("drizzle"),
  rain: video("rain"),
  snow: video("snow"),
  thunderstorm: video("thunderstorm"),
  default: video("clouds"),
};