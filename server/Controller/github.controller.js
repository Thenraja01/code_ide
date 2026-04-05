const { createRepo } = require('../service/github.service')
const { pushProject } = require('../service/github.push.service')

exports.createRepository = async (req, res) => {
  try {
    const { token, repoName } = req.body
    if (!token || !repoName) {
      return res.status(400).json({ error: "Missing token or repoName" })
    }
    const repo = await createRepo(token, repoName)
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
    const { token, owner, repo, projectId } = req.body
    if (!token || !owner || !repo || !projectId) {
      return res.status(400).json({ error: "Missing required parameters" })
    }
    const result = await pushProject(token, owner, repo, projectId)
    res.json(result)
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: "GitHub push failed", 
      details: error.response?.data || error.message 
    })
  }
}
