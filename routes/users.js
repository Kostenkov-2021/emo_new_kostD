const express = require('express')
const passport = require('passport')
const upload = require('../middleware/upload')
const controller = require('../controllers/users')
const router = express.Router()

const stop = (req, res, next) =>  {
    if(req.user && req.user.levelStatus !== 1 && req.user.levelStatus !== 2) {
      next(new Error('У вас нет прав доступа к данной странице.'));
    } else {
      next();
    }
  }

router.post('/', passport.authenticate('jwt', {session: false}), stop, upload.single('image'), controller.create)
router.post('/request', upload.single('image'), controller.createRequest)
router.patch('/:userID', passport.authenticate('jwt', {session: false}), stop, upload.single('image'), controller.update)
router.get('/', passport.authenticate('jwt', {session: false}), stop, controller.getAll)
router.get('/count-requests', passport.authenticate('jwt', {session: false}), stop, controller.countRequests)
router.get('/rating/all', controller.getRating)
router.get('/rating/position', passport.authenticate('jwt', {session: false}), controller.getRatingPosition)
router.get('/analytics/games', passport.authenticate('jwt', {session: false}), stop, controller.getGamesAnalytics)
router.get('/analytics/all', passport.authenticate('jwt', {session: false}), stop, controller.getAnalyticsAllCount)
router.get('/analytics/users/:instID', passport.authenticate('jwt', {session: false}), stop, controller.getAnalytics)
router.get('/:userID', passport.authenticate('jwt', {session: false}), stop, controller.getByUserID)
router.delete('/:userID', passport.authenticate('jwt', {session: false}), stop, controller.remove)
// router.post('/createmany', controller.createManyUsers)
// router.post('/onfunction', controller.onfunction)

module.exports = router