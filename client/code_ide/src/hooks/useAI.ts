import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const AI_API_URL = 'http://localhost:8000'; // Default FastAPI port

interface AIRequest {
  code: string;
  action: string;
}

interface AIResponse {
  response?: string;
  error?: string;
}

export const useAI = () => {
  return useMutation({
    mutationFn: async (data: AIRequest) => {
      const response = await axios.post<AIResponse>(`${AI_API_URL}/ai/code`, data);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data.response;
    },
  });
};
