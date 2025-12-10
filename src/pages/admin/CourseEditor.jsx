/**
 * Course Editor Page
 * Create and edit course details
 */

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, BookOpen, Settings, Image, Video,
  Upload, X, Plus, Trash2, GripVertical, CheckCircle,
  AlertCircle, Loader2, Globe, Lock, Star, Clock, Users,
  DollarSign, Tag, ChevronDown
} from 'lucide-react';

// Mock course data for editing
const mockCourse = {
  id: 'CRS001',
  title: 'IGCSE Mathematics',
  slug: 'igcse-mathematics',
  description: 'Comprehensive Cambridge IGCSE Mathematics course covering all core and extended curriculum topics. Prepare for your exams with our structured lessons, practice problems, and exam techniques.',
  shortDescription: 'Master IGCSE Mathematics with comprehensive lessons and practice',
  trackId: 'TRK001',
  category: 'Mathematics',
  status: 'published',
  thumbnail: '',
  previewVideo: '',
  price: 15,
  originalPrice: 25,
  duration: '24h 30m',
  difficulty: 'intermediate',
  language: 'english',
  instructor: 'Dr. Ahmed Hassan',
  instructorBio: 'PhD in Mathematics Education with 15 years teaching experience',
  featured: true,
  requirements: [
    'Basic arithmetic skills',
    'Access to a calculator',
    'Notebook for practice problems',
  ],
  objectives: [
    'Master all IGCSE Mathematics core topics',
    'Solve extended curriculum problems confidently',
    'Apply exam techniques for maximum marks',
    'Build strong foundation for further studies',
  ],
  tags: ['IGCSE', 'Mathematics', 'Cambridge', 'Exam Prep'],
  seoTitle: 'IGCSE Mathematics Course | Cambridge Curriculum',
  seoDescription: 'Complete IGCSE Mathematics course with video lessons, practice problems, and exam preparation. Cambridge curriculum aligned.',
};

const tracks = [
  { id: 'TRK001', name: 'Cambridge IGCSE Full Program' },
  { id: 'TRK002', name: 'Islamic Studies Program' },
  { id: 'TRK003', name: 'ESL Intensive' },
  { id: 'TRK004', name: 'Business & Entrepreneurship' },
];

const categories = ['Mathematics', 'Sciences', 'Languages', 'Islamic Studies', 'Business', 'Technology'];
const difficulties = ['beginner', 'intermediate', 'advanced'];
const languages = ['english', 'arabic', 'somali', 'swahili'];

function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [activeTab, setActiveTab] = useState('basic'); // basic, media, pricing, seo
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState(isNew ? {
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    trackId: '',
    category: '',
    status: 'draft',
    thumbnail: '',
    previewVideo: '',
    price: 0,
    originalPrice: 0,
    difficulty: 'beginner',
    language: 'english',
    instructor: '',
    instructorBio: '',
    featured: false,
    requirements: [''],
    objectives: [''],
    tags: [],
    seoTitle: '',
    seoDescription: '',
  } : mockCourse);

  const [tagInput, setTagInput] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    setHasChanges(true);
  };

  const handleArrayAdd = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
      setHasChanges(true);
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
    setHasChanges(true);
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (publish) {
        handleChange('status', 'published');
      }
      setHasChanges(false);
      // navigate('/admin/courses');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: BookOpen },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'seo', label: 'SEO', icon: Globe },
  ];

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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Eye size={18} />
            Preview
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Draft
          </button>
          {formData.status !== 'published' && (
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Publish
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
              formData.status === 'published' ? 'bg-green-100 text-green-700' :
              formData.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
            </span>
          </div>
          {!isNew && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} />
                <span>342 students</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star size={16} className="text-yellow-400" />
                <span>4.8 (89 reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>45 lessons</span>
              </div>
            </>
          )}
          <Link
            to={`/admin/courses/${id}/curriculum`}
            className="ml-auto text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            Edit Curriculum →
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sticky top-24">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      handleChange('title', e.target.value);
                      if (isNew) handleChange('slug', generateSlug(e.target.value));
                    }}
                    placeholder="e.g., IGCSE Mathematics"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">tabsera.com/courses/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleChange('slug', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    placeholder="Brief description for cards and previews"
                    maxLength={150}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/150 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    placeholder="Detailed course description..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Learning Track</label>
                    <select
                      value={formData.trackId}
                      onChange={(e) => handleChange('trackId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a track</option>
                      {tracks.map(track => (
                        <option key={track.id} value={track.id}>{track.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleChange('difficulty', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      {difficulties.map(d => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => handleChange('instructor', e.target.value)}
                    placeholder="e.g., Dr. Ahmed Hassan"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <div className="space-y-2">
                    {formData.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => handleArrayChange('requirements', idx, e.target.value)}
                          placeholder="Enter a requirement"
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleArrayRemove('requirements', idx)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleArrayAdd('requirements')}
                      className="flex items-center gap-2 text-sm text-blue-600 font-medium"
                    >
                      <Plus size={16} />
                      Add Requirement
                    </button>
                  </div>
                </div>

                {/* Learning Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
                  <div className="space-y-2">
                    {formData.objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => handleArrayChange('objectives', idx, e.target.value)}
                          placeholder="What students will learn"
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleArrayRemove('objectives', idx)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleArrayAdd('objectives')}
                      className="flex items-center gap-2 text-sm text-blue-600 font-medium"
                    >
                      <Plus size={16} />
                      Add Objective
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleChange('featured', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Featured Course</span>
                    <p className="text-sm text-gray-500">Display prominently on homepage</p>
                  </div>
                </label>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Course Media</h2>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    {formData.thumbnail ? (
                      <div className="relative inline-block">
                        <img src={formData.thumbnail} alt="Thumbnail" className="max-h-48 rounded-lg" />
                        <button
                          onClick={() => handleChange('thumbnail', '')}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Image size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">Drag and drop an image, or click to browse</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                          <Upload size={18} className="inline mr-2" />
                          Upload Image
                        </button>
                        <p className="text-xs text-gray-400 mt-2">Recommended: 1280x720px, JPG or PNG</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Preview Video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview Video (Optional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    {formData.previewVideo ? (
                      <div className="relative inline-block">
                        <video src={formData.previewVideo} controls className="max-h-48 rounded-lg" />
                        <button
                          onClick={() => handleChange('previewVideo', '')}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Video size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">Upload a preview video for the course</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                          <Upload size={18} className="inline mr-2" />
                          Upload Video
                        </button>
                        <p className="text-xs text-gray-400 mt-2">Max 100MB, MP4 format recommended</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Pricing Settings</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (for discounts)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {formData.originalPrice > formData.price && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-700">
                      <strong>Discount:</strong> {Math.round((1 - formData.price / formData.originalPrice) * 100)}% off 
                      (saves ${(formData.originalPrice - formData.price).toFixed(2)}/month)
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> This price is included in the track subscription. Students enrolled in 
                    the track get access to this course as part of their subscription.
                  </p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">SEO Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => handleChange('seoTitle', e.target.value)}
                    placeholder="Title for search engines"
                    maxLength={60}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seoTitle.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => handleChange('seoDescription', e.target.value)}
                    placeholder="Description for search engines"
                    rows={3}
                    maxLength={160}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seoDescription.length}/160 characters</p>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Preview</label>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {formData.seoTitle || formData.title || 'Course Title'}
                    </p>
                    <p className="text-green-700 text-sm">tabsera.com/courses/{formData.slug || 'course-slug'}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {formData.seoDescription || formData.shortDescription || 'Course description will appear here...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseEditor;
