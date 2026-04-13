const prisma = require('../config/db')
const { pushFile, buildPath } = require('./github.service')

exports.pushProject = async (token, owner, repo, projectId) => {
  const files = await prisma.file.findMany({
    where: { projectId }
  })

  for (const file of files) {
    if (file.type === "FILE") {
      const path = buildPath(file, files)
      await pushFile(
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
