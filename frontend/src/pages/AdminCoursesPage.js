import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createAdminApi, useAdmin } from '../contexts/AdminContext';

const AdminCoursesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminLogout } = useAdmin();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(location.pathname === '/admin/courses/create');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    description: '',
    syllabus: '',
    teacher: '',
    price: '',
    startDate: '',
    endDate: '',
    telegramLink: '',
  });

  // Image upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const adminApi = createAdminApi();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setShowCreateForm(location.pathname === '/admin/courses/create');
  }, [location.pathname]);

  const fetchCourses = async () => {
    try {
      const response = await adminApi.get('/admin/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, JPEG, or PNG)');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size must be less than 2MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  const uploadImage = async () => {
    if (!selectedFile) throw new Error('No image selected');
    setUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('image', selectedFile);
      formDataObj.append('folder', 'courses');

      const response = await adminApi.post('/admin/upload/image', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data.data.url;
    } catch (error) {
      throw new Error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a course image');
      return;
    }

    try {
      const imageUrl = await uploadImage();
      const courseData = { 
        ...formData, 
        image: imageUrl,
        start_date: formData.startDate,
        end_date: formData.endDate,
        telegram_link: formData.telegramLink 
      };
      await adminApi.post('/admin/courses', courseData);

      alert('Course created successfully!');
      setFormData({
        title: '', image: '', description: '', syllabus: '',
        teacher: '', price: '', startDate: '', endDate: '', telegramLink: '',
      });
      setSelectedFile(null);
      setImagePreview(null);
      navigate('/admin/courses');
      fetchCourses();
    } catch (error) {
      const errorMsg = error.response?.data?.details
        ? error.response.data.details.map(d => `${d.field}: ${d.message}`).join('\n')
        : error.message || 'Failed to create course.';
      alert('Failed to create course:\n\n' + errorMsg);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await adminApi.delete(`/admin/courses/${courseId}`);
        alert('Course deleted successfully!');
        fetchCourses();
      } catch (error) {
        alert('Failed to delete course.');
      }
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1A2E]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4B61A] mx-auto mb-4"></div>
          <p className="text-white/60 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1220] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F1A2E] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4B61A] flex items-center justify-center">
              <span className="text-[#0F1A2E] font-black text-lg">G</span>
            </div>
            <span className="text-xl font-black text-white">
              Grad<span className="text-[#E4B61A]">ToPro</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/courses"
            className="flex items-center gap-3 px-4 py-3 bg-[#E4B61A]/10 text-[#E4B61A] rounded-xl font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Courses</span>
          </Link>

          <Link
            to="/admin/webinars"
            className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Webinars</span>
          </Link>

          <div className="pt-4 border-t border-white/5 mt-4">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>View Website</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#E4B61A] rounded-full flex items-center justify-center">
              <span className="text-[#0F1A2E] font-black">
                {adminUser?.username?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">{adminUser?.username || 'Admin'}</p>
              <p className="text-white/40 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-[#0F1A2E]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Course Management</h1>
              <p className="text-white/40 text-sm">Create and manage training programs</p>
            </div>
            <div className="flex items-center gap-3">
              {!showCreateForm && (
                <Link
                  to="/admin/courses/create"
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#E4B61A] text-[#0F1A2E] rounded-xl hover:bg-[#E4B61A]/90 transition-all font-bold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Course
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Create Course Form */}
          {showCreateForm && (
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden mb-8">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E4B61A]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#E4B61A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Create New Course</h2>
                    <p className="text-white/40 text-sm">Fill in the course details below</p>
                  </div>
                </div>
                <Link
                  to="/admin/courses"
                  className="text-white/40 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Course Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all"
                        placeholder="Enter course title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Teacher Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.teacher}
                          onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all"
                          placeholder="Instructor name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Start Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">End Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Telegram Link (Optional)</label>
                      <input
                        type="url"
                        value={formData.telegramLink}
                        onChange={(e) => setFormData({ ...formData, telegramLink: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all"
                        placeholder="https://t.me/joinchat/..."
                      />
                    </div>
                  </div>

                  {/* Right Column - Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Course Image *</label>
                    {!imagePreview ? (
                      <div className="relative">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-[#E4B61A]/50 hover:bg-[#E4B61A]/5 transition-all"
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-white font-medium mb-1">Click to upload image</p>
                            <p className="text-white/40 text-sm">PNG, JPG, JPEG up to 2MB</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative h-64">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-2xl border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">✓ Image selected</span>
                          <label
                            htmlFor="image-upload"
                            className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-white/20 transition-all"
                          >
                            Change
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Width Fields */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all resize-none"
                    placeholder="Describe your course..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Course Syllabus *</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E4B61A]/50 focus:border-[#E4B61A] transition-all resize-none"
                    placeholder="Week 1: Introduction&#10;Week 2: Advanced Topics..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="flex items-center gap-2 px-8 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl hover:bg-[#E4B61A]/90 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0F1A2E]"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Create Course</span>
                      </>
                    )}
                  </button>
                  <Link
                    to="/admin/courses"
                    className="px-8 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* Courses Grid */}
          <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">All Courses</h2>
                  <p className="text-white/40 text-sm">{courses.length} courses available</p>
                </div>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No courses yet</h3>
                <p className="text-white/40 mb-6">Create your first course to get started</p>
                <Link
                  to="/admin/courses/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold hover:bg-[#E4B61A]/90 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Course
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group"
                  >
                    <div className="relative h-48">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E] via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          course.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-[#E4B61A] text-[#0F1A2E] rounded-lg text-sm font-bold">
                          ₹{course.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                      <p className="text-white/40 text-sm mb-3">by {course.teacher}</p>
                      <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {course.startDate ? new Date(course.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'} - {course.endDate ? new Date(course.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCoursesPage;