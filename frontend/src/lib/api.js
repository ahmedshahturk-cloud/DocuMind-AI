import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 min for large file uploads
});

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const deleteDocument = async (docId) => {
  const response = await api.delete(`/document/${docId}`);
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/chat/history/${sessionId}`);
  return response.data;
};

export const sendChatMessage = async (query, sessionId = 'default') => {
  const response = await api.post('/chat', {
    query,
    session_id: sessionId,
  });
  return response.data;
};

export const clearChatHistory = async (sessionId) => {
  const response = await api.delete(`/chat/clear/${sessionId}`);
  return response.data;
};

export default api;
