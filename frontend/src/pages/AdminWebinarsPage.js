import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createAdminApi, useAdmin } from '../contexts/AdminContext';

const AdminWebinarsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminLogout } = useAdmin();
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(location.pathname === '/admin/webinars/create');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    description: '',
    teacher: '',
    date: '',
    time: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const adminApi = createAdminApi();

  useEffect(() => {
    fetchWebinars();
  }, []);

  useEffect(() => {
    setShowCreateForm(location.pathname === '/admin/webinars/create');
  }, [location]);

  const fetchWebinars = async () => {
    try {
      const response = await adminApi.get('/webinars');
      setWebinars(response.data.data);
    } catch (error) {
      console.error('Failed to fetch webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return formData.image;
    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('image', selectedFile);
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
      alert('Please select a webinar image');
      return;
    }

    try {
      const imageUrl = await uploadImage();
      const webinarData = { 
        ...formData, 
        image: imageUrl
      };
      await adminApi.post('/admin/webinars', webinarData);

      alert('Webinar created successfully!');
      setFormData({
        title: '', image: '', description: '', teacher: '', date: '', time: ''
      });
      setSelectedFile(null);
      setImagePreview(null);
      navigate('/admin/webinars');
      fetchWebinars();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to create webinar.');
    }
  };

  const handleDelete = async (webinarId) => {
    if (window.confirm('Are you sure you want to delete this webinar?')) {
      try {
        await adminApi.delete(`/admin/webinars/${webinarId}`);
        alert('Webinar deleted successfully!');
        fetchWebinars();
      } catch (error) {
        alert('Failed to delete webinar.');
      }
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0F1A2E]">
      <nav className="border-b border-white/10 bg-[#0F1A2E]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/admin/dashboard" className="text-2xl font-bold text-white">
                GradTo<span className="text-[#E4B61A]">Pro</span> Admin
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link to="/admin/courses" className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Courses</Link>
                <Link to="/admin/webinars" className="bg-white/10 text-white px-3 py-2 rounded-md text-sm font-medium">Webinars</Link>
                <Link to="/" className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" target="_blank">View Site</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white/70 text-sm hidden sm:block">Logged in as <span className="text-white font-medium">{adminUser?.username}</span></div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all font-medium text-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{showCreateForm ? 'Create Webinar' : 'Webinars'}</h1>
            <p className="text-white/60">{showCreateForm ? 'Add a new webinar to the platform' : 'Manage your platform webinars'}</p>
          </div>
          {!showCreateForm ? (
            <Link to="/admin/webinars/create" className="px-6 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold hover:bg-[#F5C72B] transition-all shadow-[0_0_15px_rgba(228,182,26,0.3)] hover:shadow-[0_0_25px_rgba(228,182,26,0.5)] flex items-center gap-2">Create Webinar</Link>
          ) : (
            <Link to="/admin/webinars" className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2">Back to Webinars</Link>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          {showCreateForm ? (
            <form onSubmit={handleCreate} className="p-8 text-white">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Webinar Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" placeholder="e.g. Master React in 2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Webinar Image *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl hover:border-[#E4B61A]/50 transition-colors">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden mb-4">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setSelectedFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80">x</button>
                        </div>
                      ) : (
                        <div className="flex text-sm text-white/60 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white/10 rounded-md font-medium text-[#E4B61A] hover:text-[#F5C72B] px-3 py-2">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Description *</label>
                  <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" placeholder="Describe your webinar..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Teacher Name *</label>
                    <input type="text" required value={formData.teacher} onChange={(e) => setFormData({ ...formData, teacher: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Date *</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Time *</label>
                    <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>
                </div>
                <button type="submit" disabled={uploading} className="w-full py-4 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold hover:bg-[#F5C72B] disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Create Webinar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="text-white">Loading...</div>
              ) : webinars.length === 0 ? (
                <div className="text-white col-span-full text-center py-8">No webinars found.</div>
              ) : (
                webinars.map((webinar) => (
                  <div key={webinar.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                    <img src={webinar.image} alt={webinar.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg">{webinar.title}</h3>
                      <p className="text-white/40 text-sm mb-3">by {webinar.teacher}</p>
                      <div className="text-white/60 text-sm mb-4">
                        {new Date(webinar.date).toLocaleDateString()} at {webinar.time}
                      </div>
                      <button onClick={() => handleDelete(webinar.id)} className="w-full px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminWebinarsPage;
