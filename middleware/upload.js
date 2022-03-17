const aws = require('aws-sdk')
const multer = require('multer')
const moment = require('moment')
const cyrillicToTranslit = require('cyrillic-to-translit-js')
// import cyrillicToTranslit from 'cyrillic-to-translit-js'
const multerS3 = require('multer-s3')
const keys = require('./../config/keys')

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

aws.config.update({
  accessKeyId: keys.awsKeyId,
  secretAccessKey: keys.awsSecretKey
});

const s3 = new aws.S3()

const storage = multerS3({
  s3: s3,
  bucket: 'emooo',
  acl: "public-read",
  metadata: function (req, file, cb) {
    cb(null, {fieldName: file.fieldname});
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const date = moment().format('DDMMYYYY-HHmmss_SSS')
    const random = getRandomInt(1, 10000)
    cb(null, `${date}-${random}-${cyrillicToTranslit().transform(file.originalname, "_")}`)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const limits = {
  fileSize: 1024 * 1024 * 2
}

module.exports = multer({storage, fileFilter, limits})