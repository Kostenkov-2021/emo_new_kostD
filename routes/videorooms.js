const express = require('express')
const passport = require('passport')
const upload = require('../middleware/upload')
const controller = require('../controllers/videorooms')
const router = express.Router()

router.post('/', passport.authenticate('jwt', {session: false}), controller.create)
router.delete('/:id', passport.authenticate('jwt', {session: false}), controller.remove)
router.patch('/:id', passport.authenticate('jwt', {session: false}), upload.single('image'), controller.update)
router.get('/:id', controller.getByIdPublic, passport.authenticate('jwt', {session: false}), controller.getByIdPrivate)
router.get('/', passport.authenticate('jwt', {session: false}), controller.getAll)

router.get('/pu/:id/:user', passport.authenticate('jwt', {session: false}), controller.pushUser)
router.get('/du/:id/:user', passport.authenticate('jwt', {session: false}), controller.deleteUser)
router.patch('/cu/:id', passport.authenticate('jwt', {session: false}), controller.changeUsers)

module.exports = router