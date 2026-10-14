export function condition(code, day = true) {
  if (code === 0)
    return {
      label: day ? "Clear sky" : "Clear night",
      icon: day ? "sun" : "moon",
      video: "clear",
    };
  if (code <= 2)
    return { label: "Partly cloudy", icon: "cloud", video: "clouds" };
  if (code === 3) return { label: "Overcast", icon: "cloud", video: "clouds" };
  if ([45, 48].includes(code))
    return { label: "Foggy", icon: "fog", video: "fog" };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "Drizzle", icon: "rain", video: "drizzle" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snow", icon: "snow", video: "snow" };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorms", icon: "storm", video: "thunderstorm" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Rain", icon: "rain", video: "rain" };
  return { label: "Weather unavailable", icon: "cloud", video: "default" };
}
export const temperature = (value, unit) =>
  Number.isFinite(value)
    ? `${Math.round(unit === "F" ? (value * 9) / 5 + 32 : value)}°`
    : "—";
export const locationKey = (place) =>
  `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
export const placeLabel = (place) =>
  [place.name, place.admin1, place.country]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(", ");
export async function getJSON(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "Too many requests. Please try again shortly."
        : "Weather service unavailable. Please try again.",
    );
  return response.json();
}
export async function searchCities(query, signal) {
  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "en",
    format: "json",
  });
  const data = await getJSON(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    signal,
  );
  return (data.results || []).map(
    ({ name, latitude, longitude, country, admin1 }) => ({
      name,
      latitude,
      longitude,
      country,
      admin1,
    }),
  );
}
const cache = new Map();
export async function getForecast(place, signal, force = false) {
  const key = locationKey(place),
    cached = cache.get(key);
  if (!force && cached && Date.now() - cached.fetchedAt < 600000) return cached;
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: "auto",
    forecast_days: "5",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    wind_speed_unit: "kmh",
  });
  const data = await getJSON(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );
  if (!data.current || !data.hourly || !data.daily)
    throw new Error("Weather data is incomplete. Please try again.");
  const result = { ...data, fetchedAt: Date.now() };
  cache.set(key, result);
  if (cache.size > 20) cache.delete(cache.keys().next().value);
  return result;
}
