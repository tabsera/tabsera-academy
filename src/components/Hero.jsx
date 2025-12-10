import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Cambridge IGCSE & Islamic Studies
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Learning That <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                GETS YOU
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Quality education accessible across East Africa. Choose a complete learning 
              track or individual courses. Study online or at a TABSERA Learning Center near you.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                to="/courses" 
                className="inline-flex items-center px-6 py-3.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
              >
                Explore Tracks
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link 
                to="/centers"
                className="inline-flex items-center px-6 py-3.5 rounded-lg bg-white text-gray-700 font-semibold border border-gray-200 hover:bg-gray-50 transition-all hover:-translate-y-0.5"
              >
                <PlayCircle size={18} className="mr-2 text-blue-600" />
                Find a Center
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p>
                Trusted by <span className="font-bold text-gray-900">500+</span> students across East Africa
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Students learning" 
                className="w-full h-auto object-cover" 
              />

              {/* Floating Cards */}
              <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-[180px] hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Track Complete</p>
                    <p className="font-bold text-gray-900">IGCSE Maths</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-center gap-3 hidden md:flex">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                    🇸🇴
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                    🇰🇪
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-900">8 Centers</p>
                  <p className="text-xs text-gray-500">East Africa</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
