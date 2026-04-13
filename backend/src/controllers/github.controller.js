const { createRepo } = require('../services/github.service')
const { pushProject } = require('../services/github.push.service')

exports.createRepository = async (req, res) => {
  try {
    const { token, name, repoName } = req.body
    if (!token || (!name && !repoName)) {
      return res.status(400).json({ error: "Missing GitHub token or repository name" })
    }
    const finalRepoName = name || repoName
    const repo = await createRepo(token, finalRepoName)
    res.json(repo)
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: "GitHub repository creation failed", 
      details: error.response?.data || error.message 
    })
  }
}

exports.pushToGithub = async (req, res) => {
  try {
    const { token, owner, repo, projectId, repoName } = req.body
    const finalRepo = repo || repoName
    if (!token || !owner || !finalRepo || !projectId) {
      return res.status(400).json({ error: "Missing required parameters (token, owner, repo/repoName, projectId)" })
    }
    const result = await pushProject(token, owner, finalRepo, projectId)
    res.json(result)
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: "GitHub push failed", 
      details: error.response?.data || error.message 
    })
  }
}

// OAuth Placeholder
exports.getAuthUrl = (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID || 'your_dummy_id';
    const redirectUri = `${req.protocol}://${req.get('host')}/api/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
    res.json({ url });
};

exports.callback = async (req, res) => {
    // This would exchange code for token in a real app
    res.json({ message: "OAuth callback successful (placeholder)", code: req.query.code });
};
