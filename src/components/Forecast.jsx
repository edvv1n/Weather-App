import { condition, temperature } from "../lib/weather";
import Icon from "./Icon";
export default function Forecast({ data, unit }) {
  const daily = data.daily,
    hourly = data.hourly;
  const upcoming = hourly.time
    .map((time, i) => ({ time, i }))
    .filter((item) => item.time >= data.current.time)
    .slice(0, 8);
  return (
    <section className="forecast" aria-label="Weather forecast">
      <div className="section-heading">
        <h2>The next few hours</h2>
        <span>Local time</span>
      </div>
      <div className="hours">
        {upcoming.map(({ time, i }) => (
          <div className="hour" key={time}>
            <span>{time.slice(11, 16)}</span>
            <Icon
              name={condition(hourly.weather_code[i], hourly.is_day[i]).icon}
              size={25}
            />
            <strong>{temperature(hourly.temperature_2m[i], unit)}</strong>
            <small>{hourly.precipitation_probability[i] ?? "—"}% rain</small>
          </div>
        ))}
      </div>
      <div className="section-heading daily-heading">
        <h2>Your next five days</h2>
        <span>High / Low</span>
      </div>
      <div className="days">
        {daily.time.map((date, i) => (
          <div className="day" key={date}>
            <span className="day-name">
              {i === 0
                ? "Today"
                : new Intl.DateTimeFormat("en", {
                    weekday: "short",
                    timeZone: "UTC",
                  }).format(new Date(`${date}T12:00:00Z`))}
            </span>
            <Icon name={condition(daily.weather_code[i]).icon} size={23} />
            <span className="day-description">
              {condition(daily.weather_code[i]).label}
            </span>
            <span className="rain-chance">
              {daily.precipitation_probability_max[i] ?? "—"}%
            </span>
            <strong>
              {temperature(daily.temperature_2m_max[i], unit)}{" "}
              <span>{temperature(daily.temperature_2m_min[i], unit)}</span>
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
