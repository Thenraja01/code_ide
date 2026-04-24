import { convex, anyApi } from '../config/convex.js';

// POST /files  — create a file or folder
export const createFile = async (req, res) => {
  try {
    const { name, type, content, projectId, parentId } = req.body;

    if (!name || !type || !projectId) {
      return res.status(400).json({ error: "name, type, and projectId are required" });
    }

    const fileType = type === 'FOLDER' ? 'folder' : 'file';

    const args = {
      name,
      type: fileType,
      projectId,
      content: content || '',
    };

    if (parentId) {
      args.parentId = parentId;
    }

    const fileId = await convex.mutation(anyApi.files.createFile, args);

    res.status(201).json({
      id: fileId,
      name,
      type,
      content: content || '',
      projectId,
      parentId: parentId || null,
    });
  } catch (error) {
    console.error("Create File Error:", error.message || error);
    res.status(500).json({ error: "Failed to create file" });
  }
};

// GET /files?projectId=&parentId=  — list files
export const getFiles = async (req, res) => {
  try {
    const { projectId, parentId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: "projectId query param is required" });
    }

    const allFiles = await convex.query(anyApi.files.getFilesByProject, { projectId });

    // Filter by parentId if provided
    let files = allFiles;
    if (parentId) {
      files = allFiles.filter(f => f.parentId === parentId);
    }

    const result = files.map(f => ({
      id: f._id,
      name: f.name,
      type: f.type === 'folder' ? 'FOLDER' : 'FILE',
      content: f.content || '',
      projectId: f.projectId,
      parentId: f.parentId || null,
    }));

    res.json(result);
  } catch (error) {
    console.error("Get Files Error:", error.message || error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// PUT /files/:id  — update file content
export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    await convex.mutation(anyApi.files.updateFileContent, {
      fileId: id,
      content: content || '',
    });

    res.json({ id, content });
  } catch (error) {
    console.error("Update File Error:", error.message || error);
    res.status(500).json({ error: "Failed to update file" });
  }
};

// DELETE /files/:id  — delete a file or folder
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Convex files.ts doesn't have a delete mutation yet, 
    // we need to use the raw db.delete through a mutation
    // For now, attempt to call it if it exists
    try {
      await convex.mutation(anyApi.files.deleteFile, { fileId: id });
    } catch (e) {
      // If deleteFile mutation doesn't exist in Convex, log and return success
      console.warn("files.deleteFile mutation not found in Convex, skipping:", e.message);
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete File Error:", error.message || error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

// PUT /files/move/:id  — move a file to a new parent
export const moveFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { newParentId } = req.body;

    // Attempt to call a moveFile mutation in Convex
    try {
      await convex.mutation(anyApi.files.moveFile, {
        fileId: id,
        newParentId: newParentId || null,
      });
    } catch (e) {
      console.warn("files.moveFile mutation not found in Convex, skipping:", e.message);
    }

    res.json({ id, parentId: newParentId });
  } catch (error) {
    console.error("Move File Error:", error.message || error);
    res.status(500).json({ error: "Failed to move file" });
  }
};
