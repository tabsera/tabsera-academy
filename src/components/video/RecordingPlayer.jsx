/**
 * RecordingPlayer Component
 * Vimeo video player for session recordings
 */

import React from 'react';
import { Clock, User, BookOpen, Calendar, Play, Loader } from 'lucide-react';

/**
 * Format duration from seconds to human readable
 */
function formatDuration(seconds) {
  if (!seconds) return '--:--';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function RecordingPlayer({ recording, showDetails = true }) {
  if (!recording) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No recording available</p>
      </div>
    );
  }

  const { status, vimeoEmbedUrl, duration, tutor, student, course, topic, scheduledAt } = recording;

  // Show loading state for processing recordings
  if (status === 'processing' || status === 'pending') {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="aspect-video flex flex-col items-center justify-center bg-gray-800">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <h3 className="text-white text-lg font-medium">Processing Recording</h3>
          <p className="text-gray-400 text-sm mt-2">
            Your recording is being processed. This may take a few minutes.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (status === 'failed') {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="aspect-video flex flex-col items-center justify-center bg-red-900/20">
          <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white text-lg font-medium">Recording Failed</h3>
          <p className="text-gray-400 text-sm mt-2">
            There was an issue processing this recording.
          </p>
        </div>
      </div>
    );
  }

  // No embed URL yet
  if (!vimeoEmbedUrl) {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="aspect-video flex flex-col items-center justify-center bg-gray-800">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-white text-lg font-medium">Recording Not Available</h3>
          <p className="text-gray-400 text-sm mt-2">
            The recording is not yet available for playback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video player */}
      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
        <div className="aspect-video">
          <iframe
            src={vimeoEmbedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
            allowFullScreen
            title="Session Recording"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Recording details */}
      {showDetails && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {topic || 'Tutoring Session'}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Duration */}
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="text-sm font-medium">{formatDuration(duration)}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Session Date</p>
                <p className="text-sm font-medium">{formatDate(scheduledAt)}</p>
              </div>
            </div>

            {/* Tutor */}
            {tutor && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Tutor</p>
                  <p className="text-sm font-medium">{tutor.name}</p>
                </div>
              </div>
            )}

            {/* Course */}
            {course && (
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Course</p>
                  <p className="text-sm font-medium">{course.title}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact recording card for lists
 */
export function RecordingCard({ recording, onClick }) {
  const { status, duration, topic, scheduledAt, tutor, thumbnail } = recording;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-900 relative">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
            {formatDuration(duration)}
          </div>
        )}

        {/* Status badge */}
        {status !== 'completed' && (
          <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded ${
            status === 'processing' ? 'bg-yellow-500 text-white' :
            status === 'failed' ? 'bg-red-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {status}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">
          {topic || 'Tutoring Session'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {tutor?.name} - {formatDate(scheduledAt)}
        </p>
      </div>
    </div>
  );
}

export default RecordingPlayer;
