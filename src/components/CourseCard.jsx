import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, Users } from 'lucide-react';

export function CourseCard({ course }) {
  return (
    <Link 
      to={`/courses/${course.id}`} 
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-blue-700 uppercase tracking-wide">
          {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-bold text-gray-900">{course.rating}</span>
          <span className="text-xs text-gray-500">({course.reviews})</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={14} />
            <span>{course.lessons} Lessons</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <img 
              src={course.instructor.avatar} 
              alt={course.instructor.name} 
              className="w-8 h-8 rounded-full object-cover border border-gray-200" 
            />
            <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
              {course.instructor.name}
            </span>
          </div>
          <div className="text-right">
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through mr-2">
                ${course.originalPrice}
              </span>
            )}
            <span className="text-lg font-bold text-blue-600">
              ${course.price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
