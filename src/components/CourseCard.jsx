import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, Users, GraduationCap } from 'lucide-react';
import SafeHTML from './SafeHTML';

export function CourseCard({ course }) {
  // Handle both mock data format and API format
  const price = parseFloat(course.price) || 0;
  const lessons = course.lessons || 0;
  const category = course.category || course.level || 'Course';
  const image = course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
          }}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-blue-700 uppercase tracking-wide">
          {category}
        </div>
        {course.learningPack && (
          <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white">
            {course.learningPack.title}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating - show if available */}
        {course.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-bold text-gray-900">{course.rating}</span>
            {course.reviews && (
              <span className="text-xs text-gray-500">({course.reviews})</span>
            )}
          </div>
        )}

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        {course.description && (
          <SafeHTML
            html={course.description}
            className="text-sm text-gray-500 mb-3"
            truncate
          />
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{course.duration}</span>
            </div>
          )}
          {lessons > 0 && (
            <div className="flex items-center gap-1">
              <BookOpen size={14} />
              <span>{lessons} Lessons</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          {/* Instructor or Track info */}
          <div className="flex items-center gap-2">
            {course.instructor ? (
              <>
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
                  {course.instructor.name}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <GraduationCap size={18} />
                <span className="text-xs font-medium">Tabsera Academy</span>
              </div>
            )}
          </div>
          <div className="text-right">
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through mr-2">
                ${parseFloat(course.originalPrice).toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-blue-600">
              ${price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
