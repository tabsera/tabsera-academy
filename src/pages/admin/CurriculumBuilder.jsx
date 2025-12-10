/**
 * Curriculum Builder Page
 * Manage course sections, lessons, and content
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, GripVertical, ChevronDown, ChevronRight,
  Edit, Trash2, Video, FileText, HelpCircle, Clock, Eye, EyeOff,
  Play, Pause, CheckCircle, X, Upload, Link2, Loader2, Copy,
  BookOpen, Settings, MoreVertical
} from 'lucide-react';

// Mock curriculum data
const mockCurriculum = {
  courseId: 'CRS001',
  courseTitle: 'IGCSE Mathematics',
  sections: [
    {
      id: 'SEC001',
      title: 'Introduction to Numbers',
      order: 1,
      expanded: true,
      lessons: [
        { id: 'LES001', title: 'Welcome to the Course', type: 'video', duration: '5:30', published: true, free: true },
        { id: 'LES002', title: 'Number Types and Properties', type: 'video', duration: '12:45', published: true, free: false },
        { id: 'LES003', title: 'Practice Quiz: Number Basics', type: 'quiz', duration: '10:00', published: true, free: false },
      ]
    },
    {
      id: 'SEC002',
      title: 'Algebra Fundamentals',
      order: 2,
      expanded: true,
      lessons: [
        { id: 'LES004', title: 'Introduction to Variables', type: 'video', duration: '15:20', published: true, free: false },
        { id: 'LES005', title: 'Solving Linear Equations', type: 'video', duration: '18:00', published: true, free: false },
        { id: 'LES006', title: 'Downloadable: Algebra Worksheets', type: 'resource', duration: null, published: true, free: false },
        { id: 'LES007', title: 'Algebra Practice Quiz', type: 'quiz', duration: '15:00', published: false, free: false },
      ]
    },
    {
      id: 'SEC003',
      title: 'Geometry Basics',
      order: 3,
      expanded: false,
      lessons: [
        { id: 'LES008', title: 'Lines and Angles', type: 'video', duration: '14:30', published: true, free: false },
        { id: 'LES009', title: 'Triangles and Their Properties', type: 'video', duration: '16:45', published: true, free: false },
        { id: 'LES010', title: 'Geometry Quiz', type: 'quiz', duration: '12:00', published: true, free: false },
      ]
    },
  ]
};

const lessonTypes = [
  { value: 'video', label: 'Video Lesson', icon: Video },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'resource', label: 'Resource', icon: FileText },
  { value: 'text', label: 'Text Content', icon: FileText },
];

function CurriculumBuilder() {
  const { id } = useParams();
  const [curriculum, setCurriculum] = useState(mockCurriculum);
  const [isSaving, setIsSaving] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Form states
  const [sectionForm, setSectionForm] = useState({ title: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    duration: '',
    published: true,
    free: false,
    videoUrl: '',
    description: '',
  });

  const toggleSection = (sectionId) => {
    setCurriculum(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, expanded: !s.expanded } : s
      )
    }));
  };

  const getLessonIcon = (type) => {
    const lessonType = lessonTypes.find(t => t.value === type);
    return lessonType ? lessonType.icon : FileText;
  };

  const getTotalDuration = () => {
    let totalMinutes = 0;
    curriculum.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        if (lesson.duration) {
          const [mins, secs] = lesson.duration.split(':').map(Number);
          totalMinutes += mins + (secs / 60);
        }
      });
    });
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getTotalLessons = () => {
    return curriculum.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsSaving(false);
    }
  };

  const openSectionModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({ title: section.title });
    } else {
      setEditingSection(null);
      setSectionForm({ title: '' });
    }
    setShowSectionModal(true);
  };

  const openLessonModal = (sectionId, lesson = null) => {
    setActiveSectionId(sectionId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration || '',
        published: lesson.published,
        free: lesson.free,
        videoUrl: '',
        description: '',
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        type: 'video',
        duration: '',
        published: true,
        free: false,
        videoUrl: '',
        description: '',
      });
    }
    setShowLessonModal(true);
  };

  const handleSaveSection = () => {
    if (!sectionForm.title.trim()) return;

    if (editingSection) {
      setCurriculum(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === editingSection.id ? { ...s, title: sectionForm.title } : s
        )
      }));
    } else {
      const newSection = {
        id: `SEC${Date.now()}`,
        title: sectionForm.title,
        order: curriculum.sections.length + 1,
        expanded: true,
        lessons: [],
      };
      setCurriculum(prev => ({
        ...prev,
        sections: [...prev.sections, newSection]
      }));
    }
    setShowSectionModal(false);
  };

  const handleDeleteSection = (sectionId) => {
    if (confirm('Delete this section and all its lessons?')) {
      setCurriculum(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }));
    }
  };

  const handleSaveLesson = () => {
    if (!lessonForm.title.trim()) return;

    const lessonData = {
      id: editingLesson?.id || `LES${Date.now()}`,
      title: lessonForm.title,
      type: lessonForm.type,
      duration: lessonForm.duration || null,
      published: lessonForm.published,
      free: lessonForm.free,
    };

    if (editingLesson) {
      setCurriculum(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === activeSectionId
            ? { ...s, lessons: s.lessons.map(l => l.id === editingLesson.id ? lessonData : l) }
            : s
        )
      }));
    } else {
      setCurriculum(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === activeSectionId
            ? { ...s, lessons: [...s.lessons, lessonData] }
            : s
        )
      }));
    }
    setShowLessonModal(false);
  };

  const handleDeleteLesson = (sectionId, lessonId) => {
    if (confirm('Delete this lesson?')) {
      setCurriculum(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
            : s
        )
      }));
    }
  };

  const toggleLessonPublished = (sectionId, lessonId) => {
    setCurriculum(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map(l =>
              l.id === lessonId ? { ...l, published: !l.published } : l
            )}
          : s
      )
    }));
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={`/admin/courses/${id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Curriculum Builder</h1>
            <p className="text-gray-500">{curriculum.courseTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/courses/${id}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Settings size={18} />
            Course Settings
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen size={18} className="text-gray-400" />
            <span className="font-medium">{curriculum.sections.length} sections</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video size={18} className="text-gray-400" />
            <span className="font-medium">{getTotalLessons()} lessons</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={18} className="text-gray-400" />
            <span className="font-medium">{getTotalDuration()} total</span>
          </div>
          <button
            onClick={() => openSectionModal()}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Section
          </button>
        </div>
      </div>

      {/* Curriculum Content */}
      <div className="space-y-4">
        {curriculum.sections.map((section, sectionIdx) => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
              <button className="p-1 text-gray-400 cursor-grab hover:text-gray-600">
                <GripVertical size={18} />
              </button>
              <button
                onClick={() => toggleSection(section.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {section.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Section {sectionIdx + 1}: {section.title}
                </h3>
                <p className="text-sm text-gray-500">{section.lessons.length} lessons</p>
              </div>
              <button
                onClick={() => openLessonModal(section.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Add Lesson"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => openSectionModal(section)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Edit Section"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteSection(section.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete Section"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Lessons */}
            {section.expanded && (
              <div className="divide-y divide-gray-50">
                {section.lessons.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-4">No lessons in this section yet</p>
                    <button
                      onClick={() => openLessonModal(section.id)}
                      className="text-blue-600 font-medium hover:text-blue-700"
                    >
                      + Add your first lesson
                    </button>
                  </div>
                ) : (
                  section.lessons.map((lesson, lessonIdx) => {
                    const LessonIcon = getLessonIcon(lesson.type);
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-3 p-4 hover:bg-gray-50 ${
                          !lesson.published ? 'opacity-60' : ''
                        }`}
                      >
                        <button className="p-1 text-gray-400 cursor-grab hover:text-gray-600">
                          <GripVertical size={16} />
                        </button>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          lesson.type === 'video' ? 'bg-blue-100' :
                          lesson.type === 'quiz' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          <LessonIcon size={20} className={
                            lesson.type === 'video' ? 'text-blue-600' :
                            lesson.type === 'quiz' ? 'text-purple-600' :
                            'text-gray-600'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{lessonIdx + 1}.</span>
                            <span className="font-medium text-gray-900 truncate">{lesson.title}</span>
                            {lesson.free && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Free Preview
                              </span>
                            )}
                            {!lesson.published && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                            <span className="capitalize">{lesson.type}</span>
                            {lesson.duration && (
                              <>
                                <span>•</span>
                                <span>{lesson.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleLessonPublished(section.id, lesson.id)}
                            className={`p-2 rounded-lg ${
                              lesson.published
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={lesson.published ? 'Unpublish' : 'Publish'}
                          >
                            {lesson.published ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button
                            onClick={() => openLessonModal(section.id, lesson)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit Lesson"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(section.id, lesson.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Lesson"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ))}

        {curriculum.sections.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Start building your curriculum</p>
            <button
              onClick={() => openSectionModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              <Plus size={18} className="inline mr-2" />
              Add First Section
            </button>
          </div>
        )}
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSectionModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSection ? 'Edit Section' : 'Add Section'}
              </h3>
              <button onClick={() => setShowSectionModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ title: e.target.value })}
                placeholder="e.g., Introduction to Numbers"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowSectionModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                {editingSection ? 'Save Changes' : 'Add Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLessonModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
              </h3>
              <button onClick={() => setShowLessonModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Introduction to Variables"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {lessonTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setLessonForm(f => ({ ...f, type: type.value }))}
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-colors ${
                        lessonForm.type === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon size={20} className={
                        lessonForm.type === type.value ? 'text-blue-600' : 'text-gray-400'
                      } />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {lessonForm.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or direct video URL</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g., 15:30"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonForm.published}
                    onChange={(e) => setLessonForm(f => ({ ...f, published: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Published</span>
                    <p className="text-sm text-gray-500">Make this lesson visible to students</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonForm.free}
                    onChange={(e) => setLessonForm(f => ({ ...f, free: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Free Preview</span>
                    <p className="text-sm text-gray-500">Allow non-enrolled users to preview</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowLessonModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                {editingLesson ? 'Save Changes' : 'Add Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurriculumBuilder;
