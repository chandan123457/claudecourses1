import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');

    if (token && user) {
      setAdminUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Admin login
  const adminLogin = async (username, password) => {
    try {
      const response = await api.post('/admin/login', {
        username,
        password,
      });

      const { token, user } = response.data.data;

      // Store in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));

      setAdminUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Admin logout
  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
  };

  // Get admin token for API calls
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  const value = {
    adminUser,
    loading,
    adminLogin,
    adminLogout,
    getAdminToken,
  };

  return (
    <AdminContext.Provider value={value}>
      {!loading && children}
    </AdminContext.Provider>
  );
};

// Create admin API instance with token
export const createAdminApi = () => {
  const adminApi = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api" });

  // Add admin token to requests
  adminApi.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers['x-admin-key'] = 'gradtopro_admin_2024';
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return adminApi;
};