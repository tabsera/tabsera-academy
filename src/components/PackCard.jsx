import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Zap, Calculator, Languages, Palette,
  ArrowRight, Briefcase, FlaskConical, ScrollText, Code, Cpu, Database
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
  'scroll': ScrollText,
  'code': Code,
  'cpu': Cpu,
  'database': Database
};

// Default color classes for packs without a color
const defaultColors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
  'bg-indigo-100 text-indigo-600',
];

// Get icon based on pack title keywords
function getIconForPack(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('igcse') || lowerTitle.includes('cambridge')) return GraduationCap;
  if (lowerTitle.includes('web') || lowerTitle.includes('programming') || lowerTitle.includes('code')) return Code;
  if (lowerTitle.includes('data') || lowerTitle.includes('analytics')) return Database;
  if (lowerTitle.includes('mobile') || lowerTitle.includes('app')) return Cpu;
  if (lowerTitle.includes('business')) return Briefcase;
  if (lowerTitle.includes('science') || lowerTitle.includes('chemistry') || lowerTitle.includes('physics')) return FlaskConical;
  if (lowerTitle.includes('math') || lowerTitle.includes('calcul')) return Calculator;
  if (lowerTitle.includes('language') || lowerTitle.includes('english') || lowerTitle.includes('arabic')) return Languages;
  if (lowerTitle.includes('art') || lowerTitle.includes('design')) return Palette;
  if (lowerTitle.includes('islamic') || lowerTitle.includes('quran')) return ScrollText;
  return BookOpen;
}

export function PackCard({ pack }) {
  // Get icon - either from icon property or based on title
  const Icon = pack.icon ? (iconMap[pack.icon] || BookOpen) : getIconForPack(pack.title);

  // Get color - either from color property or based on index
  const colorClass = pack.color || defaultColors[Math.abs(pack.title.charCodeAt(0)) % defaultColors.length];

  // Use slug for URL if available, fallback to id
  const packIdentifier = pack.slug || pack.id;

  // Handle price display
  const price = parseFloat(pack.price) || 0;
  const originalPrice = parseFloat(pack.originalPrice) || 0;
  const savings = parseFloat(pack.savings) || 0;
  const hasDiscount = savings > 0;

  return (
    <Link
      to={`/packs/${packIdentifier}`}
      className="group flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 text-center h-full"
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={32} />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
        {pack.title}
      </h3>

      <p className="text-sm text-gray-500 mb-2">
        {pack.coursesCount || 0} Courses
        {pack.tuitionPacksCount > 0 && ` + ${pack.tuitionPacksCount} Tuition Pack${pack.tuitionPacksCount > 1 ? 's' : ''}`}
      </p>

      {price > 0 && (
        <div className="mb-4">
          {hasDiscount && (
            <p className="text-xs text-gray-400 line-through">
              ${originalPrice.toFixed(2)}
            </p>
          )}
          <p className="text-sm font-semibold text-green-600">
            ${price.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-green-500 font-medium">
              Save ${savings.toFixed(2)}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        View Pack <ArrowRight size={16} className="ml-1" />
      </div>
    </Link>
  );
}

export default PackCard;
