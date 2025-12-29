/**
 * Course Editor Page
 * Create and edit course details
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, BookOpen, Image, DollarSign, Globe,
  X, Plus, Trash2, CheckCircle, AlertCircle, Loader2,
  Clock, ExternalLink, ChevronDown, Tag, Sparkles
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import { apiClient } from '@/api/client';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [packs, setPacks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    learningPackId: '',
    subjectId: '',
    price: 0,
    creditsFactor: 1,
    duration: '',
    level: '',
    lessons: 0,
    image: '',
    externalUrl: '',
    isActive: false,
  });

  // Fetch course data and tracks on mount
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch packs and subjects
      const [packsRes, subjectsRes] = await Promise.all([
        adminApi.getPacks({ limit: 100 }),
        apiClient.get('/subjects'),
      ]);
      setPacks(packsRes.packs || []);
      setSubjects(subjectsRes.subjects || []);

      // Fetch course if editing
      if (!isNew && id) {
        const courseRes = await adminApi.getCourse(id);
        if (courseRes.course) {
          setFormData({
            title: courseRes.course.title || '',
            slug: courseRes.course.slug || '',
            description: courseRes.course.description || '',
            learningPackId: courseRes.course.learningPackId || '',
            subjectId: courseRes.course.subjectId || '',
            price: parseFloat(courseRes.course.price) || 0,
            creditsFactor: courseRes.course.creditsFactor || 1,
            duration: courseRes.course.duration || '',
            level: courseRes.course.level || '',
            lessons: courseRes.course.lessons || 0,
            image: courseRes.course.image || '',
            externalUrl: courseRes.course.externalUrl || '',
            isActive: courseRes.course.isActive || false,
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = async (publish = false) => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert('Title and slug are required');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        isActive: publish ? true : formData.isActive,
        learningPackId: formData.learningPackId || null,
        subjectId: formData.subjectId || null,
      };

      if (isNew) {
        await adminApi.createCourse(data);
      } else {
        await adminApi.updateCourse(id, data);
      }

      setHasChanges(false);
      navigate('/admin/courses');
    } catch (err) {
      alert(err.message || 'Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateImage = async () => {
    if (isNew) {
      alert('Please save the course first before generating an image.');
      return;
    }

    if (!confirm('Generate a new AI image for this course? This will replace the current image.')) {
      return;
    }

    setIsGeneratingImage(true);
    try {
      const result = await adminApi.generateCourseImage(id);
      if (result.imageUrl) {
        handleChange('image', result.imageUrl);
        alert('Image generated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: BookOpen },
    { id: 'media', label: 'Media & Links', icon: Image },
    { id: 'pricing', label: 'Pricing & Details', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Failed to load course</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Link
            to="/admin/courses"
            className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/courses"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Create New Course' : 'Edit Course'}
            </h1>
            <p className="text-gray-500">
              {isNew ? 'Fill in the course details below' : formData.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle size={16} />
              Unsaved changes
            </span>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Draft
          </button>
          {!formData.isActive && (
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Save & Publish
            </button>
          )}
          {formData.isActive && (
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              formData.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {formData.lessons > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>{formData.lessons} lessons</span>
            </div>
          )}
          {formData.externalUrl && (
            <a
              href={formData.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink size={16} />
              <span>View on EdX</span>
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  handleChange('title', e.target.value);
                  if (isNew) {
                    handleChange('slug', generateSlug(e.target.value));
                  }
                }}
                placeholder="e.g., IGCSE Mathematics"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">/courses/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleChange('description', value)}
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Pack
                </label>
                <div className="relative">
                  <select
                    value={formData.learningPackId}
                    onChange={(e) => handleChange('learningPackId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No Pack (Standalone Course)</option>
                    {packs.map(pack => (
                      <option key={pack.id} value={pack.id}>{pack.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={formData.subjectId}
                    onChange={(e) => handleChange('subjectId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (Published and visible to students)
              </label>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Course Image
                </label>
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || isNew}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <ImageUpload
                value={formData.image}
                onChange={(url) => handleChange('image', url)}
                folder="courses"
              />
              {isNew && (
                <p className="text-xs text-amber-600 mt-2">
                  Save the course first to enable AI image generation
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                External Platform URL (EdX, etc.)
              </label>
              <input
                type="text"
                value={formData.externalUrl}
                onChange={(e) => handleChange('externalUrl', e.target.value)}
                placeholder="https://apps.learn.tabsera.com/learning/course/..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Link to the course on an external learning platform
              </p>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuition Credits Factor
                </label>
                <select
                  value={formData.creditsFactor}
                  onChange={(e) => handleChange('creditsFactor', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1x (Standard)</option>
                  <option value={2}>2x (Intensive)</option>
                  <option value={3}>3x (Premium)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Multiplier for tuition credits consumed per tutoring session</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="e.g., 10 weeks"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  placeholder="e.g., O Level, Beginner, Intermediate"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Lessons
                </label>
                <input
                  type="number"
                  value={formData.lessons}
                  onChange={(e) => handleChange('lessons', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseEditor;
