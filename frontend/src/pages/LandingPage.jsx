import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 text-gray-900 font-sans relative overflow-hidden">
      {/* Subtle SVG Background - More Visible */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none select-none" style={{zIndex:0}} aria-hidden="true">
        <defs>
          <radialGradient id="bg1" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg2" cx="80%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg1)" />
        <rect width="100%" height="100%" fill="url(#bg2)" />
      </svg>

      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight">TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-base font-medium hover:text-indigo-600 transition-colors">Log In</Link>
          <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-24 pb-16 px-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 font-medium text-sm mb-6">v2.0 is now live</span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Manage work with <span className="text-indigo-600 bg-indigo-100 px-2 rounded">unmatched clarity.</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10">
          The premier multi-tenant SaaS platform that brings your team's projects, tasks, and collaboration into one seamless, beautiful workspace.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-6">
          <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg w-full sm:w-auto transition-all text-lg">Start for free →</Link>
          <Link to="/login" className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-4 rounded-xl border border-gray-300 w-full sm:w-auto transition-all text-lg">Sign In</Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-500 text-base font-medium">
          <span>✔ No credit card required</span>
          <span className="hidden sm:inline">|</span>
          <span>✔ 14-day free trial</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship faster</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Powerful features designed to help your team stay organized, focused, and productive without the clutter.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 transition-all duration-300 shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-500 flex items-center justify-center mb-10 text-2xl font-bold">📋</div>
              <h3 className="text-xl font-semibold mb-3">Intuitive Kanban Boards</h3>
              <p className="text-gray-700 leading-relaxed">
                Visualize your workflow and move tasks effortlessly from to-do to done with our beautifully designed kanban interface.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-purple-400 transition-all duration-300 shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center mb-10 text-2xl font-bold">🤝</div>
              <h3 className="text-xl font-semibold mb-3">Seamless Collaboration</h3>
              <p className="text-gray-700 leading-relaxed">
                Invite team members, assign tasks, and keep everyone aligned in real-time within your dedicated workspaces.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 transition-all duration-300 shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center mb-10 text-2xl font-bold">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-700 leading-relaxed">
                Built on modern technologies to ensure your team never waits. Instant updates, zero lag, and fluid animations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 text-center text-gray-400 text-sm bg-black">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-semibold text-white">TaskFlow</span>
          </div>
          <p>&copy; {new Date().getFullYear()} TaskFlow Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
