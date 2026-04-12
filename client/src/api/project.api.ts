import api from "./axios";

export interface ProjectData {
  id: string;
  title: string;
  description?: string;
  language?: string;
  userId: string;
  isStarred?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getProjects = async (): Promise<ProjectData[]> => {
  const res = await api.get("/projects");
  return res.data;
};

export const createProject = async (data: { title?: string; description?: string; language?: string; }): Promise<ProjectData> => {
  const res = await api.post("/projects", data);
  return res.data;
};

export const deleteProject = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};

export const initializeProject = async (id: string): Promise<{ message: string }> => {
  const res = await api.post(`/projects/${id}/initialize`);
  return res.data;
};

export const toggleStarProject = async (id: string): Promise<ProjectData> => {
  const res = await api.patch(`/projects/${id}/star`);
  return res.data;
};

