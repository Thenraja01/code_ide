import { useMutation } from '@tanstack/react-query';
import { createRepository, pushToGithub } from '@/api/github.api';
import { toast } from 'sonner';

export const useCreateRepoMutation = () => {
  return useMutation({
    mutationFn: createRepository,
    onSuccess: () => {
      toast.success('Repository created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create repository');
    },
  });
};

export const usePushToGithubMutation = () => {
  return useMutation({
    mutationFn: pushToGithub,
    onSuccess: () => {
      toast.success('Pushed to GitHub successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to push to GitHub');
    },
  });
};
