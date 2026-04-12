import api from "./axios";

export interface FileData {
  id?: string;
  name: string;
  type: "FILE" | "FOLDER";
  content?: string;
  projectId: string;
  parentId?: string | null;
}

export const createFile = async (data: FileData): Promise<FileData> => {
  const res = await api.post("/files", data);
  return res.data;
};

export const getFiles = async (
  projectId: string,
  parentId?: string
): Promise<FileData[]> => {
  const params: any = { projectId };
  if (parentId) params.parentId = parentId;
  const res = await api.get("/files", { params });
  return res.data;
};

export const updateFile = async (data: { id: string; content: string }): Promise<FileData> => {
  const res = await api.put(`/files/${data.id}`, { content: data.content });
  return res.data;
};

export const deleteFile = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/files/${id}`);
  return res.data;
};

export const moveFile = async (data: { id: string; newParentId: string | null }): Promise<FileData> => {
  const res = await api.put(`/files/move/${data.id}`, { newParentId: data.newParentId });
  return res.data;
};
