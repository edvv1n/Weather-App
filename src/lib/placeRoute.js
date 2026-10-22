export function readPlaceRoute(search) {
  const params = new URLSearchParams(search);
  const name = params.get("city")?.trim();
  const lat = params.get("lat"), lon = params.get("lon");
  if (!name || !lat?.trim() || !lon?.trim()) return null;
  const latitude = Number(lat), longitude = Number(lon);
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
      !Number.isFinite(longitude) || Math.abs(longitude) > 180) return null;
  return { name, latitude, longitude,
    ...(params.get("country") ? { country: params.get("country") } : {}),
    ...(params.get("admin1") ? { admin1: params.get("admin1") } : {}) };
}
export function placeURL(place, href) {
  const url = new URL(href);
  for (const key of ["city", "lat", "lon", "country", "admin1"]) url.searchParams.delete(key);
  url.searchParams.set("city", place.name);
  url.searchParams.set("lat", String(place.latitude));
  url.searchParams.set("lon", String(place.longitude));
  if (place.country) url.searchParams.set("country", place.country);
  if (place.admin1) url.searchParams.set("admin1", place.admin1);
  return url.pathname + url.search + url.hash;
}
