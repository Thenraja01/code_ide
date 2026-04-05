const prisma = require('../database/prisma')

exports.createFile = async (req, res) => {
  try {
    const { name, type, projectId, parentId, content } = req.body

    const file = await prisma.file.create({
      data: {
        name,
        type,
        content: type === "FILE" ? content || "" : null,
        projectId,
        parentId: parentId || null
      }
    })

    res.json(file)
  } catch (error) {
    res.status(500).json({ error: "Failed to create file", details: error.message })
  }
}

exports.getFiles = async (req, res) => {
  try {
    const { projectId, parentId } = req.query

    const files = await prisma.file.findMany({
      where: {
        projectId,
        parentId: parentId || null
      }
    })

    res.json(files)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch files", details: error.message })
  }
}

exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    const file = await prisma.file.update({
      where: { id },
      data: { content }
    })

    res.json(file)
  } catch (error) {
    res.status(500).json({ error: "Failed to update file", details: error.message })
  }
}

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.file.delete({
      where: { id }
    })

    res.json({ message: "Deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete file", details: error.message })
  }
}

exports.moveFile = async (req, res) => {
  try {
    const { id } = req.params
    const { newParentId } = req.body

    const file = await prisma.file.update({
      where: { id },
      data: {
        parentId: newParentId || null
      }
    })

    res.json(file)
  } catch (error) {
    res.status(500).json({ error: "Failed to move file", details: error.message })
  }
}
