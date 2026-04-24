import { convex, anyApi } from '../config/convex.js';
import { pushFile, buildPath } from './github.service.js';

export const pushProject = async (token, owner, repo, projectId) => {
  // Fetch all files for this project from Convex
  const files = await convex.query(anyApi.files.getFilesByProject, { projectId });

  if (!files || files.length === 0) {
    return { success: true, message: "No files to push", filesCount: 0 };
  }

  // Build file paths and push each file
  const results = [];
  for (const file of files) {
    if (file.type === 'folder') continue; // Skip folders, GitHub creates them implicitly

    const path = buildPath(file, files);
    const content = file.content || '';

    try {
      const result = await pushFile(token, owner, repo, path, content, `Update ${path}`);
      results.push({ path, status: 'pushed' });
    } catch (err) {
      console.error(`Failed to push file ${path}:`, err.message);
      results.push({ path, status: 'failed', error: err.message });
    }
  }

  return {
    success: true,
    filesCount: results.length,
    results,
  };
};
