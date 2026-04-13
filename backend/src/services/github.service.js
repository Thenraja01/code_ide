const axios = require('axios')
const prisma = require('../config/db')


const BASE_URL = "https://api.github.com"

// Create Repository
exports.createRepo = async (token, repoName) => {
  const res = await axios.post(
    `${BASE_URL}/user/repos`,
    {
      name: repoName,
      private: false
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    }
  )
  return res.data
}
exports.pushFile = async (token, owner, repo, path, content, message) => {
  const encoded = Buffer.from(content).toString("base64")

  const sha = await exports.getFileSHA(token, owner, repo, path)

  const res = await axios.put(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      message,
      content: encoded,
      sha // required for update
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    }
  )

  return res.data
}

// services/github.service.js

exports.getFileSHA = async (token, owner, repo, path) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json"
        }
      }
    )
    return res.data.sha
  } catch {
    return null 
  }
}

exports.buildPath = (file, allFiles) => {
  let path = file.name
  let current = file

  while (current.parentId) {
    const parent = allFiles.find(f => f.id === current.parentId)
    if (!parent) break

    path = `${parent.name}/${path}`
    current = parent
  }

  return path
}
// services/githubPush.service.js
exports.deleteFile = async (token, owner, repo, path) => {
  const sha = await exports.getFileSHA(token, owner, repo, path)

  if (!sha) return

  await axios.delete(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        message: "delete file",
        sha
      }
    }
  )
}
exports.getRepo = async (token, owner, repo) => {
  const res = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  return res.data
}

exports.getRepoFiles = async (token, owner, repo, path = "") => {
  const res = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  return res.data
}


exports.pushProject = async (token, owner, repo, projectId) => {
  const files = await prisma.file.findMany({
    where: { projectId }
  })

  for (const file of files) {
    if (file.type === "FILE") {
      const path = exports.buildPath(file, files)

      await exports.pushFile(
        token,
        owner,
        repo,
        path,
        file.content || "",
        "commit from IDE"
      )
    }
  }

  return { success: true }
}
