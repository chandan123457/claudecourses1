import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createAdminApi } from '../contexts/AdminContext';

const AdminCoursesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(location.pathname === '/admin/courses/create');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '', // Will store the Cloudinary URL after upload
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
    // Update form visibility when route changes
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

  /**
   * Handle file selection from file picker
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, JPEG, or PNG)');
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Store file
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    console.log('✅ Image selected:', file.name, `${(file.size / 1024).toFixed(2)} KB`);
  };

  /**
   * Remove selected image
   */
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  /**
   * Upload image to backend before creating course
   */
  const uploadImage = async () => {
    if (!selectedFile) {
      throw new Error('No image selected');
    }

    setUploading(true);

    try {
      // Create FormData
      const formDataObj = new FormData();
      formDataObj.append('image', selectedFile);
      formDataObj.append('folder', 'courses');

      console.log('📤 Uploading image to server...');

      // Upload to backend
      const response = await adminApi.post('/admin/upload/image', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.data.url;
      console.log('✅ Image uploaded successfully:', imageUrl);

      return imageUrl;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw new Error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle course creation
   */
  const handleCreate = async (e) => {
    e.preventDefault();

    // Check if image is selected
    if (!selectedFile) {
      alert('Please select a course image');
      return;
    }

    try {
      // Step 1: Upload image first
      console.log('📸 Step 1: Uploading image...');
      const imageUrl = await uploadImage();

      // Step 2: Create course with uploaded image URL
      console.log('📝 Step 2: Creating course...');
      const courseData = {
        ...formData,
        image: imageUrl,
      };

      await adminApi.post('/admin/courses', courseData);

      alert('Course created successfully!');

      // Reset form
      setFormData({
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
      setSelectedFile(null);
      setImagePreview(null);

      navigate('/admin/courses');
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);

      // Show detailed error message
      const errorMsg = error.response?.data?.details
        ? error.response.data.details.map(d => `${d.field}: ${d.message}`).join('\n')
        : error.message || error.response?.data?.message || 'Failed to create course. Please try again.';

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
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
              <p className="text-gray-600">Manage your courses and enrollments</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/admin/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </Link>
              <Link
                to="/admin/courses/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Course Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* IMAGE UPLOAD SECTION - COMPLETELY NEW */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Image *
                  </label>

                  {!imagePreview ? (
                    // File input button
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
                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, JPEG up to 2MB
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    // Image preview
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium">✓ Image selected</span>
                        <label
                          htmlFor="image-upload"
                          className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                        >
                          Change image
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Syllabus
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.syllabus}
                  onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Week 1: Introduction&#10;Week 2: Advanced Topics..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Group Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.telegramLink}
                  onChange={(e) => setFormData({ ...formData, telegramLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://t.me/joinchat/..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Create Course'}
                </button>
                <Link
                  to="/admin/courses"
                  className="bg-gray-500 text-white px-8 py-2 rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">All Courses ({courses.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={course.image}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.teacher}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{course.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(course.startDate).toLocaleDateString()} -{' '}
                        {new Date(course.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesPage;