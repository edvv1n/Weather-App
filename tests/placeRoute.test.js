import test from 'node:test';
import assert from 'node:assert/strict';
import { readPlaceRoute, placeURL } from '../src/lib/placeRoute.js';
test('city URLs round trip exact coordinates, labels and unrelated parameters', () => {
  const place = {name:'São Tomé', latitude:0, longitude:6.73, country:'São Tomé & Príncipe', admin1:'Água Grande'};
  const url = new URL(placeURL(place, 'https://example.com/weather?unit=C#forecast'), 'https://example.com');
  assert.deepEqual(readPlaceRoute(url.search), place);
  assert.equal(url.searchParams.get('unit'), 'C');
  assert.equal(url.hash, '#forecast');
});
test('malformed or out of range city routes are rejected', () => {
  for (const search of ['', '?city=Paris', '?city=Paris&lat=&lon=2', '?city=Paris&lat=91&lon=2', '?city=Paris&lat=48&lon=181', '?city=Paris&lat=NaN&lon=2']) assert.equal(readPlaceRoute(search), null);
});
