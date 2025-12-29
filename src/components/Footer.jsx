import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import apiClient from '../api/client';

export function Footer() {
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await apiClient.get('/packs');
      setPacks(response.packs || []);
    } catch (err) {
      console.error('Error fetching packs for footer:', err);
    }
  };

  return (
    <footer className="bg-[#1a2332] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="TABSERA Academy"
                className="h-12 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold leading-none">TABSERA</span>
                <span className="text-xs font-medium text-gray-400 tracking-wider">ACADEMY ONLINE</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering learners across East Africa with Cambridge IGCSE programs,
              Islamic Studies, and professional development courses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-blue-600">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-blue-600">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-blue-600">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-blue-600">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-white transition-colors text-sm">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/centers" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Learning Centers
                </Link>
              </li>
              <li>
                <Link to="/partner" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Packs */}
          <div>
            <h3 className="text-lg font-bold mb-6">Learning Packs</h3>
            <ul className="space-y-4">
              {packs.length > 0 ? (
                packs.slice(0, 5).map(pack => (
                  <li key={pack.id}>
                    <Link
                      to={`/packs/${pack.slug || pack.id}`}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {pack.title}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback while loading
                <>
                  <li>
                    <Link to="/courses" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Browse All Packs
                    </Link>
                  </li>
                </>
              )}
              {packs.length > 5 && (
                <li>
                  <Link to="/courses" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                    View All Packs →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin size={18} className="flex-shrink-0 mt-0.5 text-blue-500" />
                <span>Hargeisa, Somalia & Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone size={18} className="flex-shrink-0 text-blue-500" />
                <span>+252 63 XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={18} className="flex-shrink-0 text-blue-500" />
                <span>info@tabsera.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TABSERA Academy. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
