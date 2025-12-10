import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Zap, Calculator, Languages, Palette, 
  ArrowRight, Briefcase, FlaskConical, ScrollText 
} from 'lucide-react';

// Map icon strings to components
const iconMap = {
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  'zap': Zap,
  'calculator': Calculator,
  'languages': Languages,
  'palette': Palette,
  'briefcase': Briefcase,
  'flask': FlaskConical,
  'scroll': ScrollText
};

export function TrackCard({ track }) {
  const Icon = iconMap[track.icon] || BookOpen;
  
  return (
    <Link 
      to={`/courses?track=${track.id}`} 
      className="group flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 text-center h-full"
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${track.color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={32} />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {track.title}
      </h3>

      <p className="text-sm text-gray-500 mb-2">
        {track.coursesCount} Courses
      </p>
      
      {track.price && (
        <p className="text-sm font-semibold text-green-600 mb-4">
          ${track.price}/month
        </p>
      )}

      <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        View Track <ArrowRight size={16} className="ml-1" />
      </div>
    </Link>
  );
}

export default TrackCard;
