import api from "./axios";

export interface GithubRepoData {
  token: string;
  name: string;
  description?: string;
  private?: boolean;
}

export interface GithubPushData {
  token: string;
  owner: string;
  repo: string;
  projectId: string;
}

export interface CloneFromGithubData {
  repoUrl: string;
  projectName: string;
  userId: string;
}

export const createRepository = async (data: GithubRepoData) => {
  const res = await api.post("/github/repo", data);
  return res.data;
};

export const pushToGithub = async (data: GithubPushData) => {
  const res = await api.post("/github/push", data);
  return res.data;
};

export const cloneFromGithub = async (data: CloneFromGithubData) => {
  const res = await api.post("/github/clone", data);
  return res.data;
};
