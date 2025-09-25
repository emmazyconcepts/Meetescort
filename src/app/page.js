// src/app/page.js
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className={`relative bg-black/20 backdrop-blur-md border-b border-pink-500/30 sticky top-0 z-50 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                MeetAnEscort
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-pink-200 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-pink-500/20 hover:scale-105">
                Login
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25">
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-8">
            <span className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full text-sm font-medium border border-pink-500/30 animate-pulse">
              Premium Dating Experience
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your
            <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Perfect Match
            </span>
          </h1>
          
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
            Discover exclusive connections with verified professionals. 
            <span className="block text-pink-300 font-medium">Discreet, secure, and unforgettable experiences await.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-pink-500/30 relative overflow-hidden"
            >
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Link>
            
            <Link 
              href="/discover" 
              className="group border-2 border-pink-500/50 text-pink-300 px-8 py-4 rounded-xl font-semibold hover:bg-pink-500/10 hover:border-pink-400 transition-all duration-300 transform hover:scale-105 hover:text-white"
            >
              <span className="flex items-center justify-center gap-2">
                Explore Profiles
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-4xl font-bold text-white text-center mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Why You'll Love It Here
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '👑',
                title: 'Elite Members',
                description: 'Connect with verified, premium professionals who value discretion and quality connections.',
                gradient: 'from-yellow-500/20 to-pink-500/20'
              },
              {
                icon: '🔒',
                title: 'Total Privacy',
                description: 'End-to-end encryption and anonymous browsing ensure your complete confidentiality.',
                gradient: 'from-blue-500/20 to-purple-500/20'
              },
              {
                icon: '💝',
                title: 'Genuine Connections',
                description: 'Meaningful relationships built on mutual respect and shared interests.',
                gradient: 'from-pink-500/20 to-red-500/20'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-pink-500/20 hover:border-pink-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 ${feature.gradient} transition-all duration-1000 delay-${700 + index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-pink-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-pink-100 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className={`max-w-4xl mx-auto text-center bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-3xl p-12 border border-pink-500/30 backdrop-blur-lg transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for Something Extraordinary?
          </h2>
          <p className="text-pink-200 mb-8 text-lg">
            Join thousands of satisfied members finding their perfect matches every day.
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-pink-500/30 animate-bounce hover:animate-none"
          >
            Create Your Profile Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-pink-500/20 py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-pink-200/70 text-sm">
            © 2024 MeetAnEscort • Premium Dating Platform • Discreet & Secure
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}