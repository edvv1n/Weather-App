import { test } from "node:test";
import assert from "node:assert/strict";
import {
  condition,
  temperature,
  locationKey,
  placeLabel,
  getForecast,
} from "../src/lib/weather.js";
test("converts temperatures without changing the original data", () => {
  assert.equal(temperature(0, "F"), "32°");
  assert.equal(temperature(-40, "F"), "-40°");
  assert.equal(temperature(28.7, "C"), "29°");
  assert.equal(temperature(null, "C"), "—");
});
test("maps weather codes to preserved video categories", () => {
  for (const [code, video] of [
    [0, "clear"],
    [3, "clouds"],
    [45, "fog"],
    [53, "drizzle"],
    [65, "rain"],
    [75, "snow"],
    [95, "thunderstorm"],
    [999, "default"],
  ])
    assert.equal(condition(code).video, video);
  assert.equal(condition(0, false).icon, "moon");
});
test("accepts zero coordinates and disambiguates city labels", () => {
  assert.equal(locationKey({ latitude: 0, longitude: 0 }), "0.000,0.000");
  assert.equal(
    placeLabel({ name: "Lagos", admin1: "Lagos", country: "Nigeria" }),
    "Lagos, Nigeria",
  );
});
test("forecast retains coordinates, requests five days and reuses fresh data", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    const params = new URL(url).searchParams;
    assert.equal(params.get("latitude"), "0");
    assert.equal(params.get("longitude"), "0");
    assert.equal(params.get("forecast_days"), "5");
    return {
      ok: true,
      json: async () => ({
        current: { temperature_2m: 20 },
        hourly: {},
        daily: {},
      }),
    };
  };
  try {
    const place = { latitude: 0, longitude: 0 };
    const first = await getForecast(place);
    assert.equal(await getForecast(place), first);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
