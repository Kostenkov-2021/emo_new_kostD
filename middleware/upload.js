const multer = require('multer')
const moment = require('moment')
const path = require('path');
const cyrillicToTranslit = require('cyrillic-to-translit-js')

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const storage = multer.diskStorage({
  destination(req, file,  cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename(req, file, cb) {
    cb(null, `${moment().format('DDMMYYYY-HHmmss_SSS')}-${getRandomInt(1, 10000)}-${getRandomInt(1, 10000)}-emopictures-${cyrillicToTranslit().transform(file.originalname, "_")}`)
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const limits = {
  fileSize: 1024 * 1024 * 50
}

module.exports = multer({storage, fileFilter, limits})