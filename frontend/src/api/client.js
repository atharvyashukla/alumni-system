import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://alumni-system-mxhj.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('alumni_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, clear it
      console.warn('Session expired or unauthorized. Clearing stored token.');
      // Keep token if on login page
    }
    return Promise.reject(error);
  }
);

// --- API Service Methods ---

export const authApi = {
  getGoogleLoginUrl: () => `${API_BASE_URL}/auth/google`,
  getLinkedInLoginUrl: () => `${API_BASE_URL}/auth/linkedin`,
  devLogin: (data) => api.post('/auth/dev-login', data),
  getCurrentUser: () => api.get('/users/me'),
};

export const collegeApi = {
  getAll: (search) => api.get('/colleges', { params: { search } }),
  create: (data) => api.post('/colleges', data),
  attachUser: (collegeId) => api.post('/users/me/college', { collegeId }),
};

export const profileApi = {
  setRole: (role) => api.post('/users/me/role', { role }),
  createStudentProfile: (data) => api.post('/students/me', data),
  createAlumniProfile: (data) => api.post('/alumni/me', data),
};

export const directoryApi = {
  getAlumni: (params) => api.get('/alumni', { params }),
};

export const eventApi = {
  getEvents: () => api.get('/events'),
  createEvent: (data) => api.post('/events', data),
};

export const jobApi = {
  getJobs: (params) => api.get('/jobs', { params }),
  createJob: (data) => api.post('/jobs', data),
};

export const mentorshipApi = {
  suggest: (data) => api.post('/mentorship/suggest', data),
  getRequests: (params) => api.get('/mentorship-requests', { params }),
  createRequest: (data) => api.post('/mentorship-requests', data),
  updateStatus: (id, status) => api.patch(`/mentorship-requests/${id}`, { status }),
};

export const donationApi = {
  getSummary: (collegeId) => api.get('/donations/summary', { params: { collegeId } }),
  createDonation: (data) => api.post('/donations', data),
};

export const adminApi = {
  getUsers: (collegeId, params) => api.get('/admin/users', { params: { collegeId, ...params } }),
  verifyAlumni: (id, isVerified) => api.patch(`/alumni/${id}/verify`, { isVerified }),
};

export default api;
