import { condition, temperature } from "../lib/weather";
import Icon from "./Icon";
export default function WeatherCard({ data, place, unit, saved, onSave }) {
  const current = data.current,
    daily = data.daily,
    sky = condition(current.weather_code, current.is_day);
  const number = (value) => (Number.isFinite(value) ? Math.round(value) : "—");
  return (
    <section className="current-weather" aria-label="Current weather">
      <div className="eyebrow">
        <span className="live-dot" /> CURRENT CONDITIONS{" "}
        <span className="local-time">
          {current.time.slice(11, 16)} local time
        </span>
      </div>
      <div className="place-row">
        <div>
          <h1>{place.name}</h1>
          <p className="region">
            {[place.admin1, place.country]
              .filter(Boolean)
              .filter((v, i, a) => a.indexOf(v) === i)
              .join(", ") ||
              `${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}°`}
          </p>
        </div>
        <button
          className={`save-button ${saved ? "is-saved" : ""}`}
          onClick={onSave}
          aria-label={saved ? "Remove from saved cities" : "Save city"}
          aria-pressed={saved}
        >
          <Icon name="star" size={20} />
          <span>{saved ? "Saved" : "Save city"}</span>
        </button>
      </div>
      <div className="temperature-row">
        <div className="temperature">
          {temperature(current.temperature_2m, unit)}
          <span>{unit}</span>
        </div>
        <div className="condition">
          <Icon name={sky.icon} size={62} />
          <p>{sky.label}</p>
        </div>
      </div>
      <p className="feels">
        Feels like {temperature(current.apparent_temperature, unit)}{" "}
        <span>·</span> High {temperature(daily.temperature_2m_max[0], unit)}{" "}
        <span>·</span> Low {temperature(daily.temperature_2m_min[0], unit)}
      </p>
      <div className="metrics">
        <div>
          <Icon name="drop" />
          <span>
            Humidity
            <strong>
              {number(current.relative_humidity_2m)}
              <small>%</small>
            </strong>
          </span>
        </div>
        <div>
          <Icon name="wind" />
          <span>
            Wind
            <strong>
              {number(current.wind_speed_10m)} <small>km/h</small>
            </strong>
          </span>
        </div>
        <div>
          <Icon name="rain" />
          <span>
            Rain chance today
            <strong>
              {number(daily.precipitation_probability_max[0])}
              <small>%</small>
            </strong>
          </span>
        </div>
      </div>
    </section>
  );
}
