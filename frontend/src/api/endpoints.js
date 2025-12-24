import api from './axios';

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
export const submitExamAnswer = (examId, data) => api.post(`/exam/${examId}/answer`, null, { params: data });
export const completeExam = (examId) => api.post(`/exam/${examId}/complete`);

// Data Export
export const exportData = (data) => 
  api.post('/export/data', data, { responseType: 'blob' });

// Sample Data
export const initSampleData = () => api.post('/init/sample-data');