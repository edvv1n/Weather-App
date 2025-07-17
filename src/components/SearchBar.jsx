import React, { useState, useEffect } from "react";


const SearchBar = ({ fetchWeather }) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
      setCity("");
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("Unable to retrieve your location. Please enter a city manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <form className="flex w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter City Name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-2 border border-gray-300 outline-none flex-1 border-r-0 rounded-l-lg placeholder:text-gray-500"
        />
        <button
          type="submit"
          className="bg-blue-500 border cursor-pointer p-2 border-l-0 hover:bg-blue-600 rounded-r-lg"
        >
          Search
        </button>
      </form>
      <button
        type="button"
        onClick={handleLocationClick}
        className="bg-white text-white p-2 rounded-lg cursor-pointer hover:bg-blue-600 w-full sm:w-auto"
      >
        📍
      </button>
    </div>
  );
};

export default SearchBar;