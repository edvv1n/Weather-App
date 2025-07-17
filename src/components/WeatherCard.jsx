// import React from 'react';

// const WeatherCard = ({weather}) => {
//   return (
//     <div className='mt-6'>
//         <h2 className='text-2l font-semibold text-center'>
//           {weather.name}, {weather.sys.country}
//           </h2>
//         <div className='flex justify-center items-center mt-4'>
//             <img src= {`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`}  alt={weather.weather[0].description}
//             className='w-16 h-16'/>
//             <p className='text-4xl font-bold'>
//               {Math.round(weather.main.temp)}°C
//             </p>
//         </div>
//         <p className='text-center text-gray-400 capitalize'>
//           {weather.weather[0].description}
//         </p>
//         <div className='grid grid-cols-2 gap-4 mt-6'>
//           <div className='text-center'>
//             <p className='text-gray-400'>Humidity</p>
//             <p className='font-bold'>{weather.main.humidity}%</p>
//           </div>
//           <div className='text-center'>
//           <p className='text-gray-400'>Wind</p>
//             <p className='font-bold'>{weather.wind.speed} m/s</p>
//           </div>
//           <div className='text-center'>
//           <p className='text-gray-400'>Pressure</p>
//             <p className='font-bold'>{weather.main.pressure} hPa</p>
//           </div>
//           <div className='text-center'>
//           <p className='text-gray-400'>Feels Like</p>
//             <p className='font-bold'>{Math.round(weather.main.feels_like)}°C</p>
//           </div>
//         </div>
//     </div>
//   );
// };

// export default WeatherCard;

import React, { useEffect, useState } from 'react';

const WeatherCard = ({ weather }) => {
  // State to control the fade-in animation
  const [isVisible, setIsVisible] = useState(false);

  // Use useEffect to trigger the fade-in animation when the 'weather' prop changes
  useEffect(() => {
    // Reset visibility to false immediately to re-trigger animation on new data
    setIsVisible(false);
    // Use a timeout to allow the component to re-render with isVisible false
    // before setting it to true, ensuring the transition plays.
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // A small delay to ensure the class is removed and re-added

    // Cleanup the timeout if the component unmounts or weather changes again
    return () => clearTimeout(timer);
  }, [weather]); // Re-run this effect whenever the 'weather' object changes

  // If weather data is not available, return null or a loading indicator
  if (!weather) {
    return null; // Or a loading spinner, or a message like "Search for a city"
  }

  return (
    // Apply transition classes: opacity-0 initially, then opacity-100 with duration
    <div className={`mt-6 transition-opacity duration-2000 ease-in ${isVisible ? 'opacity-100' : 'opacity-0'} sm:max-w-dvw`}>
      <h2 className='text-2xl font-semibold text-center'>
        {weather.name}, {weather.sys.country}
      </h2>
      <div className='flex justify-center items-center mt-4'>
        <img
          src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
          alt={weather.weather[0].description}
          className='w-16 h-16'
        />
        <p className='text-4xl font-bold'>
          {Math.round(weather.main.temp)}°C
        </p>
      </div>
      <p className='text-center text-gray-400 capitalize'>
        {weather.weather[0].description}
      </p>
      <div className='grid grid-cols-2 gap-4 mt-6'>
        <div className='text-center'>
          <p className='text-gray-400'>Humidity</p>
          <p className='font-bold'>{weather.main.humidity}%</p>
        </div>
        <div className='text-center'>
          <p className='text-gray-400'>Wind</p>
          <p className='font-bold'>{weather.wind.speed} m/s</p>
        </div>
        <div className='text-center'>
          <p className='text-gray-400'>Pressure</p>
          <p className='font-bold'>{weather.main.pressure} hPa</p>
        </div>
        <div className='text-center'>
          <p className='text-gray-400'>Feels Like</p>
          <p className='font-bold'>{Math.round(weather.main.feels_like)}°C</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;