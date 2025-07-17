import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import axios from "axios";
import WeatherCard from "./components/WeatherCard";

// Object containing the video URLs for each weather condition
// These keys match the 'main' weather condition string from the OpenWeatherMap API
const videoSources = {
  // Group 2xx: Thunderstorm
  thunderstorm: "https://cdn.pixabay.com/video/2015/08/11/305-135918495_large.mp4",
  
  // Group 3xx: Drizzle
  drizzle: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  
  // Group 5xx: Rain
  rain: "https://cdn.pixabay.com/video/2019/10/24/28236-368501609_large.mp4",
  
  // Group 6xx: Snow
  snow: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  
  // Group 7xx: Atmosphere (Mist, Smoke, Haze, Dust, Fog, Sand, Ash, Squall, Tornado)
  mist: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  smoke: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  haze: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  dust: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  fog: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  sand: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  ash: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
  squall: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4", // Using thunderstorm video for squall
  tornado: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4", // Using thunderstorm video for tornado
  
  // Group 800: Clear
  clear: "https://static.videezy.com/system/resources/previews/000/044/533/original/sky-timelapse-2.mp4",
  
  // Group 80x: Clouds
  clouds: "https://cdn.pixabay.com/video/2019/02/11/21285-316701418_large.mp4",
  
  // A default video for any unmatched weather condition
  default: "https://cdn.pixabay.com/video/2025/04/10/271161_large.mp4",
};

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentVideo, setCurrentVideo] = useState(videoSources.default);

  const API_KEY = import.meta.env.VITE_API_KEY;
  const API_URL = import.meta.env.VITE_API_URL;

  // A helper function to determine the video URL based on weather condition
  const getVideoByWeather = (mainWeather) => {
    const weatherCondition = mainWeather.toLowerCase();
    // Check if the weather condition exists in our videoSources object, otherwise use 'default'
    return videoSources[weatherCondition] || videoSources.default;
  };

  const fetchWeather = async (query) => {
    setLoading(true);
    setError("");
    try {
      let url = "";
      if (typeof query === "string") {
        url = `${API_URL}?q=${query}&units=metric&appid=${API_KEY}`;
      } else if (query && query.latitude && query.longitude) {
        url = `${API_URL}?lat=${query.latitude}&lon=${query.longitude}&units=metric&appid=${API_KEY}`;
      } else {
        throw new Error("Invalid query provided.");
      }

      const response = await axios.get(url);
      console.log(response.data);
      setWeather(response.data);

      // Get the weather condition from the API response
      const mainWeather = response.data.weather[0].main;
      // Set the new video URL based on the weather condition
      setCurrentVideo(getVideoByWeather(mainWeather));

    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("City not found. Check city and try again.");
      } else {
        setError("An error occurred. Please try again later.");
      }
      setWeather(null);
      // Revert to the default video on error
      setCurrentVideo(videoSources.default);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLoading(false);
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 relative overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"
        autoPlay
        loop
        muted
        key={currentVideo}
      >
        <source src={currentVideo} type="video/mp4" />
        Your browser does not support the video background
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10"></div>
      <div className="bg-black/70 text-white rounded-lg shadow-lg p-8 max-w-md w-full z-20">
        <h1 className="text-3xl font-bold text-center mb-6">WeatherEd ☀</h1>
        <SearchBar fetchWeather={fetchWeather} />
        {loading && <p className="text-center mt-4">Loading...</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {weather && <WeatherCard weather={weather} />}
      </div>
    </div>
  );
}

export default App;