import { createRepo } from '../services/github.service.js';
import { pushProject } from '../services/github.push.service.js';

export const createRepository = async (req, res) => {
  try {
    const { token, name, repoName } = req.body;
    if (!token || (!name && !repoName)) {
      return res.status(400).json({ error: "Missing GitHub token or repository name" });
    }
    const finalRepoName = name || repoName;
    const repo = await createRepo(token, finalRepoName);
    res.json(repo);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: "GitHub repository creation failed", 
      details: error.response?.data || error.message 
    });
  }
};

export const pushToGithub = async (req, res) => {
  try {
    const { token, owner, repo, projectId, repoName } = req.body;
    const finalRepo = repo || repoName;
    if (!token || !owner || !finalRepo || !projectId) {
      return res.status(400).json({ error: "Missing required parameters (token, owner, repo/repoName, projectId)" });
    }
    const result = await pushProject(token, owner, finalRepo, projectId);
    res.json({ status: "Push triggered", result });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: "GitHub push failed", 
      details: error.response?.data || error.message 
    });
  }
};
