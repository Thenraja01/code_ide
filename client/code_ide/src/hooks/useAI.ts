import { useMutation } from '@tanstack/react-query';
import api from '@/api/axios';

interface AIRequest {
  code: string;
  action: string;
  fileId?: string;
  sessionId?: string;
}

interface AIResponse {
  status: string;
  error?: string;
}

export const useAI = () => {
  return useMutation({
    mutationFn: async (data: AIRequest) => {
      const response = await api.post<AIResponse>('/ai/analyze', data);
      return response.data;
    },
  });
};
