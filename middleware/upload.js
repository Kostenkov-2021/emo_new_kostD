const multer = require('multer')
const moment = require('moment')

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    const date = moment().format('DDMMYYYY-HHmmss_SSS')
    const random = getRandomInt(1, 10000)
    cb(null, `${date}-${random}-${file.originalname}`)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const limits = {
  fileSize: 1024 * 1024 * 5
}


module.exports = multer({storage, fileFilter, limits})