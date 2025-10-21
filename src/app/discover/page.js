// src/app/discover/page.js
"use client";
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LocationSearch from "@/components/ui/LocationSearch";
import ProfileCard from "@/components/ProfileCard";

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [filters, setFilters] = useState({
    gender: "",
    ageRange: "",
    services: [],
    sortBy: "recent",
  });

  // Get location from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get("location");
    if (locationParam) {
      setSearchLocation(decodeURIComponent(locationParam));
    }
  }, []);

  // Load profiles and ads
  useEffect(() => {
    loadProfilesAndAds();
  }, [searchLocation]);

  const loadProfilesAndAds = async () => {
    setLoading(true);
    try {
      // Load active ads first
      const adsQuery = query(
        collection(db, "ads"),
        where("status", "==", "active")
      );
      const adsSnapshot = await getDocs(adsQuery);
      const adsData = adsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAd: true,
      }));
      setAds(adsData);

      // Load profiles with location filtering
      const usersQuery = query(
        collection(db, "users"),
        where("profileActive", "==", true),
        where("verified", "==", true)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAd: false,
      }));

      // Filter profiles by location with fallback logic
      const filteredProfiles = filterProfilesByLocation(
        usersData,
        searchLocation
      );
      setProfiles(filteredProfiles);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfilesByLocation = (profiles, location) => {
    if (!location) return profiles;

    const searchTerms = location
      .toLowerCase()
      .split(",")
      .map((term) => term.trim());

    return profiles.filter((profile) => {
      if (!profile.location) return false;

      const profileLocation = profile.location.toLowerCase();

      // Exact match check
      if (profileLocation.includes(location.toLowerCase())) {
        return true;
      }

      // Progressive fallback matching
      for (let i = searchTerms.length; i > 0; i--) {
        const partialSearch = searchTerms.slice(0, i).join(", ");
        if (profileLocation.includes(partialSearch)) {
          return true;
        }
      }

      return false;
    });
  };

  // Combine ads and profiles, prioritize ads
  const combinedResults = useMemo(() => {
    const profilesWithAds = profiles.map((profile) => {
      const profileAd = ads.find((ad) => ad.userId === profile.id);
      return profileAd
        ? { ...profile, isAd: true, adData: profileAd }
        : profile;
    });

    // Sort: ads first, then by selected sort option
    return profilesWithAds.sort((a, b) => {
      // Ads always come first
      if (a.isAd && !b.isAd) return -1;
      if (!a.isAd && b.isAd) return 1;

      // Then apply other sorting
      switch (filters.sortBy) {
        case "recent":
          return (
            new Date(b.lastUpdated?.toDate?.() || b.lastUpdated) -
            new Date(a.lastUpdated?.toDate?.() || a.lastUpdated)
          );
        case "price-low":
          return (a.incallPrice || 0) - (b.incallPrice || 0);
        case "price-high":
          return (b.incallPrice || 0) - (a.incallPrice || 0);
        default:
          return 0;
      }
    });
  }, [profiles, ads, filters.sortBy]);

  // Get location hierarchy for fallback message
  const getLocationHierarchy = (location) => {
    if (!location) return [];
    const parts = location.split(",").map((part) => part.trim());
    const hierarchy = [];

    for (let i = parts.length; i > 0; i--) {
      hierarchy.push(parts.slice(0, i).join(", "));
    }

    return hierarchy;
  };

  const locationHierarchy = getLocationHierarchy(searchLocation);
  const hasExactMatches = combinedResults.some((profile) =>
    profile.location?.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {searchLocation
              ? `Independent escorts in ${searchLocation}`
              : "Find Independent escorts near you"}
          </h1>
          <p className="text-pink-200">
            Find verified professionals in your area
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-black/30 rounded-2xl p-6 mb-8 border border-pink-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const location = formData.get("location");
              if (location) {
                setSearchLocation(location);
                // Update URL without page reload
                window.history.pushState(
                  {},
                  "",
                  `/discover?location=${encodeURIComponent(location)}`
                );
              }
            }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <LocationSearch
                  name="location"
                  value={searchLocation}
                  onChange={setSearchLocation}
                  className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400"
                  placeholder="🔍 Search city, state, or country..."
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition duration-300 whitespace-nowrap"
              >
                Search Location
              </button>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-black/30 rounded-2xl p-6 mb-8 border border-pink-500/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.gender}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, gender: e.target.value }))
              }
              className="px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white"
            >
              <option value="">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
            </select>

            <select
              value={filters.ageRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, ageRange: e.target.value }))
              }
              className="px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white"
            >
              <option value="">All Ages</option>
              <option value="18-25">18-25</option>
              <option value="26-30">26-30</option>
              <option value="31-35">31-35</option>
              <option value="36-40">36-40</option>
              <option value="41+">41+</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button
              onClick={() =>
                setFilters({
                  gender: "",
                  ageRange: "",
                  services: [],
                  sortBy: "recent",
                })
              }
              className="px-4 py-3 bg-pink-500/20 border border-pink-500/30 rounded-xl text-pink-300 hover:bg-pink-500/30 transition duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-pink-200">Searching for profiles...</p>
          </div>
        ) : (
          <>
            {/* Location Fallback Message */}
            {searchLocation &&
              !hasExactMatches &&
              locationHierarchy.length > 1 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <p className="text-yellow-200">
                    No exact matches found for <strong>{searchLocation}</strong>
                    . Showing results for{" "}
                    <strong>{locationHierarchy[1]}</strong> and surrounding
                    areas.
                  </p>
                </div>
              )}

            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-pink-200">
                Found {combinedResults.length}{" "}
                {combinedResults.length === 1 ? "profile" : "profiles"}
                {searchLocation && ` in ${searchLocation}`}
              </p>
              <p className="text-pink-300 text-sm">
                {combinedResults.filter((p) => p.isAd).length} promoted profiles
              </p>
            </div>

            {/* Profiles Grid */}
            {combinedResults.length === 0 ? (
              <div className="text-center py-16 bg-black/20 rounded-2xl border border-pink-500/20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No profiles found
                </h3>
                <p className="text-pink-200 mb-4">
                  Try searching for a different location or broader area.
                </p>
                <button
                  onClick={() => {
                    setSearchLocation("");
                    window.history.pushState({}, "", "/discover");
                  }}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition duration-300"
                >
                  Show All Profiles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {combinedResults.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
