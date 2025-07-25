import React, { useState, useEffect, useRef } from "react";

const SearchBar = ({ fetchWeather }) => {
  // State for the current city input value
  const [city, setCity] = useState("");
  // State to store the list of suggested cities
  const [suggestions, setSuggestions] = useState([]);
  // State to control the visibility of the suggestions list
  const [showSuggestions, setShowSuggestions] = useState(false);
  // State to indicate if suggestions are currently being loaded
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // State to handle any errors during API calls
  const [error, setError] = useState(null);

  // Ref to store the debounce timeout ID to prevent rapid API calls
  const debounceTimeoutRef = useRef(null);
  // Ref to the search bar container to detect clicks outside for hiding suggestions
  const searchBarRef = useRef(null);

  // IMPORTANT: Replace with your actual OpenWeatherMap API Key
  const API_KEY = import.meta.env.VITE_API_KEY;;

  /**
   * Fetches city suggestions from the OpenWeatherMap Geocoding API.
   * @param {string} query The user's input for city name.
   */
  const fetchCitySuggestions = async (query) => {
    setLoadingSuggestions(true); // Set loading state to true
    setError(null); // Clear any previous errors

    if (!API_KEY || API_KEY === "YOUR_OPENWEATHERMAP_API_KEY_HERE") { // Replace "YOUR_OPENWEATHERMAP_API_KEY_HERE" with the actual placeholder text you expect
      setError("Please replace 'API_KEY' with your actual OpenWeatherMap API key.");
      setLoadingSuggestions(false);
      setSuggestions([]);
      setShowSuggestions(true); // Show the error message
      return;
    }
    try {
      // Construct the API URL for direct geocoding
      // limit=5 ensures we get up to 5 relevant suggestions
      const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Format suggestions to include city, state (if available), and country
      const formattedSuggestions = data.map(item => {
        let name = item.name;
        if (item.state) {
          name += `, ${item.state}`;
        }
        if (item.country) {
          name += `, ${item.country}`;
        }
        return name;
      });

      setSuggestions(formattedSuggestions); // Update suggestions state
      setShowSuggestions(true); // Show the suggestions list after fetching
    } catch (err) {
      console.error("Error fetching city suggestions:", err);
      setError("Failed to fetch city suggestions. Please try again later.");
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setLoadingSuggestions(false); // Set loading state to false
    }
  };

  /**
   * Handles changes in the input field.
   * Implements debouncing to limit the frequency of suggestion API calls.
   * @param {Object} e The event object from the input change.
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value); // Update the city input state
    setError(null); // Clear error when user types

    // Clear any existing debounce timeout to reset the timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Only fetch suggestions if the input value has more than 1 character
    if (value.trim().length > 1) {
      // Set a new debounce timeout. The fetchCitySuggestions will be called after 500ms
      // if no further input changes occur.
      debounceTimeoutRef.current = setTimeout(() => {
        fetchCitySuggestions(value);
      }, 500); // Debounce for 500ms
    } else {
      // If the input is too short, clear suggestions and hide the list
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * Handles a click on a suggested city.
   * @param {string} selectedCity The city name selected from the suggestions.
   */
  const handleSuggestionClick = (selectedCity) => {
    setCity(selectedCity); // Set the input field to the selected city
    fetchWeather(selectedCity); // Trigger the weather fetch for the selected city
    setSuggestions([]); // Clear the suggestions list
    setShowSuggestions(false); // Hide the suggestions list
  };

  /**
   * Handles the form submission for manual search.
   * @param {Object} e The event object from the form submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (city.trim()) {
      fetchWeather(city); // Fetch weather for the entered city
      setCity(""); // Clear the input field after search
      setSuggestions([]); // Clear suggestions
      setShowSuggestions(false); // Hide suggestions
    }
  };

  /**
   * Displays a custom message box instead of alert().
   * @param {string} message The message to display.
   * @param {string} type The type of message (e.g., 'error', 'info').
   */
  const showMessageBox = (message, type = 'error') => {
    const messageBox = document.createElement('div');
    messageBox.className = `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg shadow-lg z-50 ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`;
    messageBox.innerHTML = message;
    document.body.appendChild(messageBox);
    setTimeout(() => {
      if (document.body.contains(messageBox)) {
        document.body.removeChild(messageBox);
      }
    }, 3000); // Hide after 3 seconds
  };

  /**
   * Handles the click event for the "Current Location" button.
   * Uses Geolocation API to get user's coordinates.
   */
  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather({ latitude, longitude }); // Fetch weather using coordinates
          setCity(""); // Clear input after location search
          setSuggestions([]); // Clear suggestions
          setShowSuggestions(false); // Hide suggestions
        },
        (error) => {
          console.error("Error getting user location:", error);
          showMessageBox("Unable to retrieve your location. Please enter a city manually.");
        }
      );
    } else {
      showMessageBox("Geolocation is not supported by your browser.");
    }
  };

  // Effect hook to handle clicks outside the search bar to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the searchBarRef element, hide suggestions
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function: remove event listener and clear debounce timeout when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    // The main container for the search bar, set to relative for absolute positioning of suggestions
    // Added `gap-2` for consistent spacing between input and button on mobile
    <div className="relative flex flex-col sm:flex-row gap-2 w-full" ref={searchBarRef}>
      {/* Search input form */}
      <form className="flex w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter City Name"
          value={city}
          onChange={handleInputChange}
          // Show suggestions when input is focused if there are any, and the input has content
          onFocus={() => {
            if (suggestions.length > 0 || city.trim().length > 0 || error) setShowSuggestions(true);
          }}
          className="p-2 border border-gray-300 outline-none flex-1 border-r-0 rounded-l-lg placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" // Adjusted font size
        />
        <button
          type="submit"
          className="bg-blue-500 text-white cursor-pointer p-2 border-l-0 hover:bg-blue-600 rounded-r-lg px-4 py-2 transition-colors duration-200 text-sm sm:text-base" // Adjusted font size
        >
          Search
        </button>
      </form>

      {/* Conditional rendering for the suggestions list or error message */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions || error) && (
        // Changed bg-white to bg-black and text-gray-900 to text-white for suggestions list
        // Added `w-full` to ensure it takes full width on smaller screens
        <ul className="absolute top-full left-0 right-0 bg-black text-white border border-gray-700 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto w-full">
          {loadingSuggestions ? (
            // Display loading message if suggestions are being fetched
            <li className="p-2 text-gray-400 text-sm sm:text-base">Loading suggestions...</li> /* Adjusted font size */
          ) : error ? (
            // Display error message if there's an API error
            <li className="p-2 text-red-400 text-sm sm:text-base">{error}</li> /* Adjusted font size */
          ) : (
            // Map and display each suggestion
            suggestions.map((sug, index) => (
              <li
                key={index} // Using index as key for simplicity, consider unique IDs in real apps
                // Changed hover:bg-gray-100 to hover:bg-gray-700 and border-gray-200 to border-gray-600
                className="p-2 cursor-pointer hover:bg-gray-700 border-b border-gray-600 last:border-b-0 text-sm sm:text-base" // Adjusted font size
                onClick={() => handleSuggestionClick(sug)}
              >
                {sug}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Button for fetching weather based on current location */}
      <button
        type="button"
        onClick={handleLocationClick}
        // Added mt-2 for spacing on mobile, set to 0 on sm screens
        className="bg-blue-500 text-white p-2 rounded-lg cursor-pointer hover:bg-blue-600 w-full sm:w-auto px-4 py-2 transition-colors duration-200 flex items-center justify-center mt-2 sm:mt-0 text-sm sm:text-base" // Adjusted font size
      >
        📍
      </button>
    </div>
  );
};

export default SearchBar;