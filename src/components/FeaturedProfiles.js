// src/components/FeaturedProfiles.js
'use client';
import { useState, useEffect } from 'react';
import {
    collection, query, where, orderBy, limit, getDocs,
    getDoc,
    doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function FeaturedProfiles() {
    const [featuredProfiles, setFeaturedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        loadFeaturedProfiles();
    }, []);

    const loadFeaturedProfiles = async () => {
        try {
            // First, get active ads to find promoted profiles
            const adsQuery = query(
                collection(db, 'ads'),
                where('status', '==', 'active'),
                orderBy('lastPaymentDate', 'desc'),
                limit(20)
            );

            const adsSnapshot = await getDocs(adsQuery);
            const adUserIds = adsSnapshot.docs.map(doc => doc.data().userId);

            if (adUserIds.length === 0) {
                // If no ads, get recently active profiles
                const usersQuery = query(
                    collection(db, 'users'),
                    where('profileActive', '==', true),
                    where('verified', '==', true),
                    orderBy('lastUpdated', 'desc'),
                    limit(12)
                );

                const usersSnapshot = await getDocs(usersQuery);
                const usersData = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    isAd: false
                }));

                setFeaturedProfiles(usersData);
            } else {
                // Get profiles that have active ads
                const promotedProfiles = [];

                for (const userId of adUserIds.slice(0, 12)) {
                    const userDoc = await getDoc(doc(db, 'users', userId));
                    if (userDoc.exists() && userDoc.data().profileActive) {
                        promotedProfiles.push({
                            id: userDoc.id,
                            ...userDoc.data(),
                            isAd: true
                        });
                    }
                }

                setFeaturedProfiles(promotedProfiles);
            }
        } catch (error) {
            console.error('Error loading featured profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayedProfiles = showAll ? featuredProfiles : featuredProfiles.slice(0, 8);

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-br from-gray-900 to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Featured Profiles</h2>
                        <p className="text-pink-200">Discover our most exclusive members</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-800 rounded-2xl h-64 mb-3"></div>
                                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                                <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (featuredProfiles.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full text-sm font-medium border border-pink-500/30 mb-4">
                        ⭐ Exclusive Members
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Featured <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Profiles</span>
                    </h2>
                    <p className="text-xl text-pink-200 max-w-2xl mx-auto">
                        Discover our most sought-after professionals. Verified, active, and ready to connect.
                    </p>
                </div>

                {/* Profiles Grid */}
                <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8 transition-all duration-500 ${showAll ? 'max-h-full' : 'max-h-[800px] overflow-hidden'
                    }`}>
                    {displayedProfiles.map((profile, index) => (
                        <FeaturedProfileCard key={profile.id} profile={profile} index={index} />
                    ))}
                </div>

                {/* View More/Less Button */}
                {featuredProfiles.length > 8 && (
                    <div className="text-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="group bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 px-8 py-3 rounded-xl font-semibold hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-400 transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {showAll ? 'Show Less' : `View All ${featuredProfiles.length} Profiles`}
                                <svg className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                    </div>
                )}

                {/* Stats Bar */}
                {/* <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-bold text-pink-400">{featuredProfiles.length}+</div>
                        <div className="text-pink-200">Active Profiles</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-purple-400">
                            {featuredProfiles.filter(p => p.isAd).length}
                        </div>
                        <div className="text-purple-200">Promoted</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-green-400">
                            {featuredProfiles.filter(p => p.verified).length}
                        </div>
                        <div className="text-green-200">Verified</div>
                    </div>
                </div> */}
            </div>
        </section>
    );
}

// Featured Profile Card Component
function FeaturedProfileCard({ profile, index }) {
    const mainPhoto = profile.photos?.[0]?.url;
    const delay = index * 0.1;

    return (
        <Link href={`/profile/${profile.id}`}>
            <div
                className="group relative bg-black/30 rounded-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 overflow-hidden cursor-pointer"
                style={{
                    animationDelay: `${delay}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                }}
            >
                {/* Promoted Badge */}
                {profile.isAd && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                            🔥 PROMOTED
                        </span>
                    </div>
                )}

                {/* Verified Badge */}
                {profile.verified && (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="bg-green-500 text-white p-1 rounded-full shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </div>
                )}

                {/* Profile Image */}
                <div className="relative h-48 overflow-hidden">
                    {mainPhoto ? (
                        <img
                            src={mainPhoto}
                            alt={profile.displayName}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                            <span className="text-4xl text-pink-300">👤</span>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                </div>

                {/* Profile Info */}
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-sm truncate flex-1">{profile.displayName}</h3>
                        <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs ml-2 whitespace-nowrap">
                            {profile.age}
                        </span>
                    </div>

                    <p className="text-pink-200 text-xs mb-3 truncate" title={profile.location}>
                        📍 {profile.location}
                    </p>

                    <div className="flex justify-between items-center">
                        <span className="text-green-400 font-semibold text-sm">
                            {profile.incallPrice ? `$${profile.incallPrice}` : 'Contact'}
                        </span>
                        <div className="flex items-center space-x-1">
                            {profile.incallPrice && (
                                <span className="bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded text-xs">In</span>
                            )}
                            {profile.outcallPrice && (
                                <span className="bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded text-xs">Out</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/10 transition duration-500" />
            </div>
        </Link>
    );
}