// src/components/ProfileCard.js
"use client";
import Link from "next/link";
import { useState } from "react";

export default function ProfileCard({ profile }) {
  const mainPhoto = profile.photos?.[0]?.url || "/default-avatar.jpg";
  const age = profile.age || "Not specified";
  const location = profile.location || "Location not specified";
  const incallPrice = profile.incallPrice
    ? `$${profile.incallPrice}`
    : "Contact for pricing";
  const bio = profile.bio ? `$${profile.bio}` : "Bio";

  const [isExpanded, setIsExpanded] = useState(false);

  if (!bio) {
    return (
      <p className="text-pink-300/70 text-sm italic">No bio provided yet.</p>
    );
  }

  const displayText = isExpanded ? bio : bio.slice(0, 120);
  const needsTruncation = bio.length > 120;

  return (
    <Link href={`/profile/${profile.id}`} className="group">
      <div className="bg-black/30 rounded-2xl overflow-hidden border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-pink-500/20">
        {/* Ad Badge */}
        {profile.isAd && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              🔥 PROMOTED
            </span>
          </div>
        )}

        {/* Profile Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={mainPhoto}
            alt={profile.displayName}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
        </div>

        {/* Profile Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-lg truncate">
              {profile.displayName}
            </h3>
            <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs whitespace-nowrap ml-2">
              {age}
            </span>
          </div>

          <div className="mb-3">
            <p className="text-pink-200 text-sm leading-relaxed break-words">
              {displayText}
              {needsTruncation && !isExpanded && "..."}
            </p>
            {needsTruncation && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-pink-400 hover:text-pink-300 text-xs font-medium mt-1 transition duration-200"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>

          <p className="text-pink-200 text-sm mb-3 truncate" title={location}>
            📍 {location}
          </p>

          <div className="flex justify-between items-center mb-3">
            <span className="text-green-400 font-semibold">{incallPrice}</span>
            {profile.verified && (
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                ✅ Verified
              </span>
            )}
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.incallPrice && (
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                Incall
              </span>
            )}
            {profile.outcallPrice && (
              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                Outcall
              </span>
            )}
          </div>

          {/* View Profile Button */}
          <button className="w-full bg-pink-500/20 text-pink-300 py-2 rounded-lg hover:bg-pink-500/30 transition duration-300 text-sm font-medium">
            View Profile
          </button>
        </div>
      </div>
    </Link>
  );
}
