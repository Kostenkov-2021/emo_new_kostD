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

      const day = moment().format('DD')
      const month = moment().format('MM')
      const year = moment().format('YYYY')
      await User.updateOne(
        {_id: candidate._id},
        {$addToSet: {loginDates: `${day}.${month}.${year}`}, $inc: {score: 1}},
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


