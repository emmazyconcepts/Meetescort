// src/app/dashboard/provider/page.js
'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ProviderDashboard() {
  const { userData } = useAuth();

  // Check if provider needs to complete profile (upload photos)
  const needsPhotoUpload = !userData?.photos || userData.photos.length < 3;

  if (needsPhotoUpload) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📸</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Complete Your Profile
            </h1>
            <p className="text-yellow-200 mb-6">
              Please upload 3-5 photos to activate your profile and start receiving clients.
            </p>
            <Link 
              href="/dashboard/provider/upload-photos"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition duration-200 font-semibold"
            >
              Upload Photos Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Stats and Actions */}
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-black/20 rounded-2xl p-6 border border-pink-500/20">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {userData?.displayName || 'Provider'}! 💼
        </h1>
        <p className="text-pink-200">
          Your profile is active and visible to clients.
        </p>
      </div>
  
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/20 rounded-xl p-4 border border-pink-500/20">
          <div className="text-xl font-bold text-pink-400 mb-1">$0</div>
          <div className="text-pink-200 text-sm">Earnings</div>
        </div>
        <div className="bg-black/20 rounded-xl p-4 border border-pink-500/20">
          <div className="text-xl font-bold text-pink-400 mb-1">0</div>
          <div className="text-pink-200 text-sm">Profile Views</div>
        </div>
      </div>
  
      {/* Quick Actions */}
      <div className="space-y-4">
        <Link href="/dashboard/provider/ads" className="block bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/30 hover:border-pink-500/50 transition duration-200">
          <h3 className="text-lg font-semibold text-white mb-2">📢 Manage Ads</h3>
          <p className="text-pink-200 text-sm">Create and edit your advertisements</p>
        </Link>
        
        <Link href="/dashboard/provider/profile" className="block bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition duration-200">
          <h3 className="text-lg font-semibold text-white mb-2">👤 Edit Profile</h3>
          <p className="text-purple-200 text-sm">Update your profile information</p>
        </Link>
      </div>
    </div>
  
    {/* Photo Gallery Preview */}
    <div className="bg-black/20 rounded-2xl p-6 border border-pink-500/20">
      <h2 className="text-xl font-bold text-white mb-4">Your Photos</h2>
      {userData?.photos && userData.photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {userData.photos.slice(0, 4).map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo.url}
                alt={`Profile photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              {index === 3 && userData.photos.length > 4 && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">+{userData.photos.length - 4} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-pink-200">No photos uploaded yet</p>
        </div>
      )}
      <Link 
        href="/dashboard/provider/upload-photos"
        className="block mt-4 text-center text-pink-400 hover:text-pink-300 text-sm"
      >
        Manage Photos
      </Link>
    </div>
  </div>
  );
}