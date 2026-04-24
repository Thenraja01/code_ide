import axios from 'axios';
// import prisma from '../config/db.js';

const BASE_URL = "https://api.github.com";
const ghHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json"
});

export const createRepo = async (token, repoName) => {
  const res = await axios.post(`${BASE_URL}/user/repos`, { name: repoName, private: false }, { headers: ghHeaders(token) });
  return res.data;
};

export const getFileSHA = async (token, owner, repo, path) => {
  try {
    const res = await axios.get(`${BASE_URL}/repos/${owner}/${repo}/contents/${path}`, { headers: ghHeaders(token) });
    return res.data.sha;
  } catch {
    return null;
  }
};

export const buildPath = (file, allFiles) => {
  let filePath = file.name;
  let current = file;
  while (current.parentId) {
    const parent = allFiles.find(f => f.id === current.parentId);
    if (!parent) break;
    filePath = `${parent.name}/${filePath}`;
    current = parent;
  }
  return filePath;
};

export const pushFile = async (token, owner, repo, path, content, message) => {
  const encoded = Buffer.from(content).toString("base64");
  const sha = await getFileSHA(token, owner, repo, path);
  const res = await axios.put(
    `${BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
    { message, content: encoded, sha },
    { headers: ghHeaders(token) }
  );
  return res.data;
};

export const deleteFile = async (token, owner, repo, path) => {
  const sha = await getFileSHA(token, owner, repo, path);
  if (!sha) return;
  await axios.delete(`${BASE_URL}/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { message: "delete file", sha }
  });
};

export const getRepo = async (token, owner, repo) => {
  const res = await axios.get(`${BASE_URL}/repos/${owner}/${repo}`, { headers: ghHeaders(token) });
  return res.data;
};

export const getRepoFiles = async (token, owner, repo, path = "") => {
  const res = await axios.get(`${BASE_URL}/repos/${owner}/${repo}/contents/${path}`, { headers: ghHeaders(token) });
  return res.data;
};

export const pushProject = async (token, owner, repo, projectId) => {
  // TODO: Fetch files from Convex
  return { success: true };
};
