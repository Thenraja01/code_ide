import api from "./axios";

export interface GithubRepoData {
  name: string;
  description?: string;
  private?: boolean;
}

export interface GithubPushData {
  repoName: string;
  commitMessage: string;
  files: { path: string; content: string }[];
}

export const createRepository = async (data: GithubRepoData) => {
  const res = await api.post("/github/repo", data);
  return res.data;
};

export const pushToGithub = async (data: GithubPushData) => {
  const res = await api.post("/github/push", data);
  return res.data;
};
