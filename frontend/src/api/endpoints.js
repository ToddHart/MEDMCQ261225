import api, { publicApi } from './axios';

// Tenant Configuration (PUBLIC - no auth required)
export const getTenantConfig = (domain) => 
  publicApi.get('/tenant/config', { params: { domain } });

// Authentication
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');

// Questions
export const getQuestions = (params) => api.get('/questions', { params });
export const getAdaptiveQuestions = (params) => api.get('/questions/adaptive', { params });
export const submitAnswer = (data) => api.post('/questions/answer', data);
export const importQuestions = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/questions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const reportQuestion = (data) => api.post('/questions/report', data);
export const finishSession = () => api.post('/session/finish');

// AI Generation
export const generateAIQuestions = (data) => api.post('/ai/generate', data);
export const getAIUsage = () => api.get('/ai/usage');

// Analytics
export const getAnalytics = () => api.get('/analytics');
export const getStudySessions = (params) => api.get('/analytics/sessions', { params });

// Exam Mode
export const startExam = (data) => api.post('/exam/start', null, { params: data });
export const getExamQuestions = (examId) => api.get(`/exam/${examId}/questions`);
export const submitExamAnswer = (examId, data) => api.post(`/exam/${examId}/answer`, null, { params: data });
export const completeExam = (examId) => api.post(`/exam/${examId}/complete`);

// Data Export
export const exportData = (data) => 
  api.post('/export/data', data, { responseType: 'blob' });

// Sample Data
export const initSampleData = () => api.post('/init/sample-data');

// UNE Priority System
export const getUnlockStatus = () => api.get('/unlock-status');
export const getQuestionBankStats = () => api.get('/question-bank-stats');
export const initUNEQuestions = () => api.post('/init/une-questions');

// Admin Tenant Management
export const getAdminTenants = () => api.get('/admin/tenants');
export const createAdminTenant = (data) => api.post('/admin/tenants', data);
export const updateAdminTenant = (tenantId, data) => api.put(`/admin/tenants/${tenantId}`, data);
export const deleteAdminTenant = (tenantId) => api.delete(`/admin/tenants/${tenantId}`);
export const getMultiTenantDashboard = () => api.get('/admin/dashboard/multi-tenant');
export const runMigration = () => api.post('/admin/run-migration');
