const express = require('express')
const router = express.Router()

const {
  createFile,
  getFiles,
  updateFile,
  deleteFile,
  moveFile
} = require('../controllers/file.controller')

router.post('/', createFile)
router.get('/', getFiles)
router.put('/:id', updateFile)
router.delete('/:id', deleteFile)
router.put('/move/:id', moveFile)

module.exports = router

