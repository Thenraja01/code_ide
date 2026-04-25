import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRepository, pushToGithub, cloneFromGithub } from '@/api/github.api';
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

export const useCloneFromGithubMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cloneFromGithub,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Repository "${data?.title || 'project'}" cloned successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to clone repository');
    },
  });
};
