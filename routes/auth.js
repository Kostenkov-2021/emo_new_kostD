const express = require('express')
const controller = require('../controllers/auth')
const router = express.Router()

router.post('/', controller.login)
router.post('/get-user', controller.get)

module.exports = router