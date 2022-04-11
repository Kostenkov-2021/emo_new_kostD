const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const User = require('../models/User')
const keys = require('../config/keys')


module.exports.login = async function(req, res) {
  const candidate = await User.findOne({login: req.body.login}, {login: 1, password: 1, levelStatus: 1, institution: 1}).lean()

  if (candidate) {
    // Проверка пароля, пользователь существует
    const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
    if (passwordResult) {
      // Генерация токена, пароли совпали
      const token = jwt.sign({
        login: candidate.login,
        userId: candidate._id
      }, keys.jwt, {expiresIn: 60 * 60 * 7})

      const date = moment().format('DD.MM.YYYY')
      await User.updateOne(
        {_id: candidate._id},
        {$addToSet: {loginDates: date}, $inc: {score: 1}},
        {new: true}
      )

      res.status(200).json({
        token: `Bearer ${token}`
      })
    } else {
      // Пароли не совпали
      res.status(401).json({
        message: 'Пароли не совпадают. Попробуйте снова.'
      })
    }
  } else {
    // Пользователя нет, ошибка
    res.status(404).json({
      message: 'Пользователь с таким login не найден.'
    })
  }
}


module.exports.get = async function(req, res) {
  const candidate = await User.findOne({login: req.body.login}, {login: 1, password: 1, levelStatus: 1, info: 1, photo: 1, name: 1, surname: 1, sex: 1}).lean()

  if (candidate) {
    // Проверка пароля, пользователь существует
    const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
    if (passwordResult) {

      res.status(200).json({
        name: candidate.name,
        surname: candidate.surname,
        isAdmin: candidate.levelStatus == 1 ? true : false,
        password: req.body.password,
        info: candidate.info,
        photo: candidate.photo,
        emo: candidate._id,
        sex: candidate.sex
      })
    } else {
      // Пароли не совпали
      res.status(401).json({
        message: 'Пароли не совпадают. Попробуйте снова.'
      })
    }
  } else {
    // Пользователя нет, ошибка
    res.status(404).json({
      message: 'Пользователь с таким login не найден.'
    })
  }
}


