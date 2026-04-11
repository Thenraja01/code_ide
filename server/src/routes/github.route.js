const express = require('express')
const router = express.Router()

const {
  createRepository,
  pushToGithub
} = require('../controllers/github.controller')

router.post('/repo', createRepository)
router.post('/push', pushToGithub)

module.exports = router
