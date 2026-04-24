import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProjectbyid,
  createProject,
  deleteProject,
  initializeProject,
  toggleStarProject,
  getProjectsPartial
} from '@/api/project.api';
import { toast } from 'sonner';

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });
};

export const usePartialProjects= (limit:number  =10,page:number=1) => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: ()=>getProjectsPartial(limit,page),
  });
};

export const useProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectbyid(projectId),
    enabled: !!projectId,
  });
};

export const useToggleStarMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleStarProject,
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);

      queryClient.setQueryData(['projects'], (old: any) => 
        old?.map((p: any) => p.id === projectId ? { ...p, isStarred: !p.isStarred } : p)
      );

      return { previousProjects };
    },
    onError: (_err, _projectId, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast.error('Failed to update star status');
    },
    onSuccess: (updatedProject: any) => {
      toast.success(updatedProject.isStarred ? 'Added to favorites' : 'Removed from favorites');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
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
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(['projects']);

      queryClient.setQueryData(['projects'], (old: any) => 
        old?.filter((p: any) => p.id !== projectId)
      );

      return { previousProjects };
    },
    onError: (_err, _projectId, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast.error('Failed to delete project');
    },
    onSuccess: () => {
      toast.success('Project permanently deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
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
