import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createFile,
  getFiles,
  updateFile,
  deleteFile,
  moveFile,
} from '@/api/file.api';
import { toast } from 'sonner';

export const useFilesQuery = (projectId: string, parentId?: string) => {
  return useQuery({
    queryKey: ['files', projectId, parentId],
    queryFn: () => getFiles(projectId, parentId),
    enabled: !!projectId,
  });
};

export const useCreateFileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createFile,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files', variables.projectId] });
      toast.success('Created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create');
    },
  });
};

export const useUpdateFileMutation = (projectId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateFile,
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['files'] });
      }
      toast.success('Updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update');
    },
  });
};

export const useDeleteFileMutation = (projectId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['files'] });
      }
      toast.success('Deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete');
    },
  });
};

export const useMoveFileMutation = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveFile,
    onSuccess: () => {
      if (projectId) {
         queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      } else {
         queryClient.invalidateQueries({ queryKey: ['files'] });
      }
      toast.success('Moved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to move');
    },
  });
};
