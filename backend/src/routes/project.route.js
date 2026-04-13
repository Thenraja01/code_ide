const express = require('express');
const router = express.Router();

const {
  getProjects,
  createProject,
  deleteProject,
  initializeProject
} = require('../controllers/project.controller');

router.get('/', getProjects);
router.post('/', createProject);
router.delete('/:id', deleteProject);
router.post('/:id/initialize', initializeProject);

module.exports = router;


