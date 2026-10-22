const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_URL || 'http://127.0.0.1:5173';
const paris = {name:'Paris', latitude:48.85, longitude:2.35, country:'France'};
const dates = Array.from({length:5}, (_,i)=>`2026-10-${22+i}`);
const weather = {timezone:'Europe/Paris', current:{time:'2026-10-22T12:00',temperature_2m:24,apparent_temperature:25,is_day:1,weather_code:3,relative_humidity_2m:60,wind_speed_10m:10}, hourly:{time:['2026-10-22T13:00'],temperature_2m:[25],weather_code:[3],precipitation_probability:[20],is_day:[1]},daily:{time:dates,temperature_2m_max:dates.map(()=>26),temperature_2m_min:dates.map(()=>18),weather_code:dates.map(()=>3),precipitation_probability_max:dates.map(()=>20)}};
async function setup(page) {
 await page.route('https://geocoding-api.open-meteo.com/**', r=>r.fulfill({json:{results:[paris]}}));
 await page.route('https://api.open-meteo.com/**', r=>r.fulfill({json:weather}));
 await page.addInitScript(()=>{
  window.locationCalls=0;
  Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(success,error){window.locationCalls++; error({code:1});}}});
 });
}
(async()=>{
 for (const engine of (process.env.CHROMIUM_ONLY ? [chromium] : [chromium, webkit])) {
  const browser=await engine.launch({headless:true, ...(engine === chromium && process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {})});
  try {
   for (const width of [390,820,1280]) {
    const context=await browser.newContext({viewport:{width,height:720},hasTouch:true,reducedMotion:'reduce'});
    const page=await context.newPage(); await setup(page);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base); await page.getByRole('heading',{name:'Lagos',exact:true}).waitFor();
    const initialY=await page.locator('.weather-layout').evaluate(e=>e.getBoundingClientRect().y);
    await page.getByRole('combobox').fill('Paris');
    await page.getByRole('option').waitFor();
    await page.getByRole('option').tap();
    await page.getByRole('heading',{name:'Paris',exact:true}).waitFor();
    assert.match(page.url(), /city=Paris/);
    assert.equal(await page.locator('.weather-layout').evaluate(e=>e.getBoundingClientRect().y),initialY);
    await page.getByRole('button',{name:'Clear recent',exact:true}).click();
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('weathered-recent'))),[]);
    await page.getByRole('button',{name:'Undo',exact:true}).click();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('weathered-recent')).length),1);
    await page.getByRole('button',{name:'Use my current location'}).click();
    await page.getByRole('button',{name:'Retry location'}).click();
    assert.equal(await page.evaluate(()=>window.locationCalls),2);
    await page.goBack();await page.getByRole('heading',{name:'Lagos',exact:true}).waitFor();
    await page.goForward();await page.getByRole('heading',{name:'Paris',exact:true}).waitFor();
    const fresh=await context.newPage();await setup(fresh);await fresh.goto(page.url());
    await fresh.getByRole('heading',{name:'Paris',exact:true}).waitFor();await fresh.close();await page.bringToFront();
    const overlap=await page.evaluate(()=>{
     const a=document.querySelector('.background-control').getBoundingClientRect(),b=document.querySelector('.forecast').getBoundingClientRect();
     return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    });assert.equal(overlap,false);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.getByRole('button',{name:'Play background',exact:true}).click();
    await page.waitForFunction(()=>{const v=document.querySelector('video');return v.currentTime>0&&!v.paused;},{},{timeout:15000}).catch(async error => {console.log(await page.locator('video').evaluate(v=>({src:v.currentSrc, error:v.error?.message,code:v.error?.code,ready:v.readyState,paused:v.paused})));throw error;});
    await page.getByRole('button',{name:'Pause background',exact:true}).click();
    assert.equal(await page.locator('video').evaluate(v=>v.paused),true);
    assert.ok(await page.locator('video').getAttribute('src'));
    await page.getByRole('button',{name:'Play background',exact:true}).click();
    await page.waitForFunction(()=>!document.querySelector('video').paused);
    await page.locator('video').dispatchEvent('error');
    if (!await page.getByRole('button',{name:'Retry background',exact:true}).count()) await page.locator('video').dispatchEvent('error');
    await page.getByRole('button',{name:'Retry background',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('video').currentTime>0&&!document.querySelector('video').paused);
    assert.deepEqual(errors,[]);
    console.log(`${engine.name()} ${width}px: touch search, routes, undo, location retry, layout, video play/pause/retry passed`);
    await context.close();
   }
  } finally {await browser.close();}
 }
})().catch(e=>{console.error(e);process.exit(1)});
