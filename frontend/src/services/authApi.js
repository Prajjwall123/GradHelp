import api from './api';

const authApi = {
  // Authentication endpoints
  login: (credentials) => api.post('/auth/login', credentials, { withCredentials: true }),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  
  // MFA endpoints - these are mounted under /api/auth in the backend
  setupMfa: () => api.get('/auth/mfa/setup'),
  verifyMfa: (data) => api.post('/auth/mfa/verify', data),
  verifyMfaLogin: (data) => api.post('/auth/mfa/verify-login', data),
  disableMfa: () => api.post('/auth/mfa/disable'),
  getMfaStatus: () => api.get('/auth/mfa/status'),
  generateBackupCodes: () => api.post('/auth/mfa/backup-codes/generate'),
};

export default authApi;
