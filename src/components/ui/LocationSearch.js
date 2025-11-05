// src/components/ui/LocationSearch.js
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LocationSearch({
  value,
  onChange,
  className,
  name,
  placeholder,
  onSearch,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  // Common locations
  const commonLocations = [
    "Lagos, Nigeria",
    "Abuja, Nigeria",
    "Port Harcourt, Nigeria",
    "Benin City, Nigeria",
    "Accra, Ghana",
    "Nairobi, Kenya",
    "Johannesburg, South Africa",
    "Cape Town, South Africa",
    "Cairo, Egypt",
    "New York, USA",
    "Los Angeles, USA",
    "London, UK",
    "Paris, France",
    "Tokyo, Japan",
  ];

  const makeCleanUrl = (location) => {
    if (!location) return "";

    return location
      .toLowerCase()
      .split(",")
      .map((part) => part.trim().replace(/\s+/g, ""))
      .filter((part) => part)
      .join("/");
  };

  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      // Show common locations when query is short
      const filtered = commonLocations
        .filter((loc) => loc.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered.map((loc) => ({ value: loc, label: loc })));
      return;
    }

    setIsLoading(true);

    try {
      // Try RapidAPI GeoDB first
      if (process.env.NEXT_PUBLIC_RAPIDAPI_KEY) {
        const response = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(
            query
          )}&limit=10&sort=-population`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const apiSuggestions = data.data.map((city) => ({
            value: `${city.city}, ${city.region}, ${city.country}`,
            label: `${city.city}, ${city.region}, ${city.country}`,
          }));
          setSuggestions(apiSuggestions);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log("API failed, using fallback suggestions");
    }

    // Fallback: Filter common locations
    const filtered = commonLocations
      .filter((loc) => loc.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);

    setSuggestions(filtered.map((loc) => ({ value: loc, label: loc })));
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Only search if input is not empty
    if (newValue.trim()) {
      searchLocations(newValue);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);

    const cleanUrl = makeCleanUrl(suggestion.value);

    if (onSearch) {
      onSearch(suggestion.value, cleanUrl);
    } else {
      router.push(`/discover/${cleanUrl}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && value) {
      e.preventDefault();

      const cleanUrl = makeCleanUrl(value);

      if (onSearch) {
        onSearch(value, cleanUrl);
      } else {
        router.push(`/discover/${cleanUrl}`);
      }

      setShowSuggestions(false);
    }
  };

  // Show common locations when input is focused and empty
  const handleFocus = () => {
    setShowSuggestions(true);
    if (!value && suggestions.length === 0) {
      setSuggestions(
        commonLocations.slice(0, 8).map((loc) => ({ value: loc, label: loc }))
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        className={className}
        placeholder={placeholder}
        required
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-md border border-pink-500/30 rounded-xl shadow-2xl max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 cursor-pointer hover:bg-pink-500/20 transition duration-200 border-b border-pink-500/10 last:border-b-0"
            >
              <div className="text-white font-medium">
                {suggestion.label.split(",")[0]}
              </div>
              <div className="text-pink-300 text-sm">
                {suggestion.label.split(",").slice(1).join(",").trim()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions &&
        !isLoading &&
        value.length >= 2 &&
        suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-md border border-pink-500/30 rounded-xl p-4 text-pink-300">
            No locations found. Try a different search term.
          </div>
        )}
    </div>
  );
}
