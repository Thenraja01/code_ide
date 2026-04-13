const express = require('express');
const router = express.Router();
const ContainerService = require('../services/ContainerService');
const FileService = require('../services/FileService');

// Execute command in project workspace
router.post('/command', async (req, res) => {
  try {
    const { projectId, command } = req.body;
    await ContainerService.executeInContainer(projectId, command);
    res.status(200).json({ status: 'started', message: `Command '${command}' started.` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Start live preview
router.post('/preview/start', async (req, res) => {
  try {
    const { projectId, framework } = req.body;
    await FileService.syncToDisk(projectId); 
    const containerData = await ContainerService.createContainer(projectId, framework);
    res.status(200).json({ status: 'running', url: containerData.previewUrl });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Stop preview
router.post('/preview/stop', async (req, res) => {
  try {
    const { projectId } = req.body;
    await ContainerService.stopContainer(projectId);
    res.status(200).json({ status: 'stopped' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

