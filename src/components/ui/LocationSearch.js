// src/components/ui/LocationSearch.js
'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function LocationSearch({ value, onChange, className }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // RapidAPI configuration
  const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const RAPIDAPI_HOST = 'wft-geo-db.p.rapidapi.com';

  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities`,
        {
          params: {
            namePrefix: query,
            limit: 5,
            sort: '-population'
          },
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST
          }
        }
      );

      const locations = response.data.data.map(city => ({
        value: `${city.city}, ${city.region}, ${city.country}`,
        label: `${city.city}, ${city.region}, ${city.country}`
      }));
      
      setSuggestions(locations);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    searchLocations(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        className={className}
        placeholder="Start typing to search locations..."
        required
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-pink-500/30 rounded-xl shadow-2xl max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 cursor-pointer hover:bg-pink-500/10 transition duration-200 border-b border-pink-500/10 last:border-b-0"
            >
              <div className="text-white font-medium">{suggestion.label.split(',')[0]}</div>
              <div className="text-pink-300 text-sm">
                {suggestion.label.split(',').slice(1).join(',').trim()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && !isLoading && value.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-pink-500/30 rounded-xl p-4 text-pink-300">
          No locations found. Try a different search term.
        </div>
      )}
    </div>
  );
}