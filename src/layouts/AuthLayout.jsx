/**
 * Auth Layout
 * Layout wrapper for authentication pages (login, register, forgot password)
 */

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Globe } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="TABSERA Academy" 
              className="h-12 w-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap size={24} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none">TABSERA</span>
              <span className="text-xs font-medium text-blue-200 tracking-wider">ACADEMY ONLINE</span>
            </div>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Education That<br />
                <span className="text-cyan-400">Transforms Lives</span>
              </h1>
              <p className="text-blue-200 text-lg max-w-md">
                Join thousands of students across East Africa accessing world-class 
                Cambridge IGCSE education and Islamic studies.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold">Cambridge IGCSE Programs</p>
                  <p className="text-sm text-blue-200">Internationally recognized qualifications</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold">Expert Instructors</p>
                  <p className="text-sm text-blue-200">Learn from qualified teachers</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Globe size={24} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold">Learn Anywhere</p>
                  <p className="text-sm text-blue-200">Access courses online or at learning centers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-blue-200">Active Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-blue-200">Learning Centers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-blue-200">Countries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="TABSERA Academy" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold text-gray-900 leading-none">TABSERA</span>
                <span className="text-xs font-medium text-gray-500 tracking-wider">ACADEMY ONLINE</span>
              </div>
            </Link>
          </div>

          {/* Auth Form Content (Login, Register, etc.) */}
          <Outlet />

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2026 TABSERA Academy. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
