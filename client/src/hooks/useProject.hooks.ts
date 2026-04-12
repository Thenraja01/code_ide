import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  createProject,
  deleteProject,
  initializeProject,
  toggleStarProject
} from '@/api/project.api';
import { toast } from 'sonner';

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });
};

export const useToggleStarMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleStarProject,
    onSuccess: (updatedProject: any) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] }); // Update dashboard stats too
      toast.success(updatedProject.isStarred ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update star status');
    },
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project permanently deleted from DB and locally');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });
};

export const useInitializeProjectMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: initializeProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to initialize project');
    },
  });
};
