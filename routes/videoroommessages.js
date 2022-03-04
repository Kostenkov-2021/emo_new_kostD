const express = require('express')
const passport = require('passport')
const controller = require('../controllers/videoroommessages')
const router = express.Router()

router.post('/:id', controller.send)
router.delete('/:id', controller.remove)
router.get('/:id', controller.getAll)
router.get('/one/:id', controller.getById)
router.get('/read/:id', passport.authenticate('jwt', {session: false}), controller.read)

module.exports = router