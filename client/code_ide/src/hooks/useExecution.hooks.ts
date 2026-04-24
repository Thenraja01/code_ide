import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Add interceptor for auth token if needed (assuming stored in localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useRunCodeMutation = () => {
  return useMutation({
    mutationFn: async ({ language, code }: { language: string; code: string }) => {
      const { data } = await api.post('/execute/run', { language, code });
      return data;
    },
  });
};

export const useCommandMutation = () => {
  return useMutation({
    mutationFn: async ({ projectId, command }: { projectId: string; command: string }) => {
      const { data } = await api.post('/execute/command', { projectId, command });
      return data;
    },
  });
};

export const useStartPreviewMutation = () => {
  return useMutation({
    mutationFn: async ({ projectId, framework }: { projectId: string; framework: string }) => {
      const { data } = await api.post('/execute/preview/start', { projectId, framework });
      return data;
    },
  });
};

export const useStopPreviewMutation = () => {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await api.post('/execute/preview/stop', { projectId });
      return data;
    },
  });
};
