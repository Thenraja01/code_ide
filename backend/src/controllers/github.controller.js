import { createGitHubRepo, pushToGitHub } from '../services/GithubService.js';

export const createRepository = async (req, res) => {
  try {
    const { token, name, repoName } = req.body;
    if (!token || (!name && !repoName)) {
      return res.status(400).json({ error: "Missing GitHub token or repository name" });
    }
    const finalRepoName = name || repoName;
    const repo = await createGitHubRepo(token, finalRepoName);
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
    const { token, owner, repo, projectId, repoName, files } = req.body;
    const finalRepo = repo || repoName;
    if (!token || !owner || !finalRepo || !projectId) {
      return res.status(400).json({ error: "Missing required parameters (token, owner, repo/repoName, projectId)" });
    }
    const result = await pushToGitHub(token, owner, finalRepo, "main", files);
    res.json({ status: "Push triggered", result });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: "GitHub push failed", 
      details: error.response?.data || error.message 
    });
  }
};
