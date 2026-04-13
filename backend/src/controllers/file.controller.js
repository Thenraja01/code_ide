const prisma = require('../config/db');
const FileService = require('../services/FileService');

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

    // Auto-sync to disk on modification
    await FileService.syncToDisk(projectId);

    res.json(file)
  } catch (error) {
    res.status(500).json({ error: "Failed to create file", details: error.message })
  }
}

exports.getFiles = async (req, res) => {
  try {
    const { projectId, parentId } = req.query

    const whereClause = { projectId };
    if (parentId !== undefined) {
      whereClause.parentId = parentId === 'null' ? null : parentId;
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      orderBy: { type: 'asc' } // Folders first
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

    // Sync to disk
    await FileService.syncToDisk(file.projectId);

    res.json(file)
  } catch (error) {
    res.status(500).json({ error: "Failed to update file", details: error.message })
  }
}

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params
    const file = await prisma.file.findUnique({ where: { id } });
    
    if (!file) return res.status(404).json({ error: "File not found" });

    await prisma.file.delete({
      where: { id }
    })

    await FileService.syncToDisk(file.projectId);

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

    await FileService.syncToDisk(file.projectId);

    res.json(file)
  } catch (error) {
    res.status(500).json({ error: "Failed to move file", details: error.message })
  }
}
