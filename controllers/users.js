const bcrypt = require('bcryptjs')
const User = require('../models/User')
const errorHandler = require('../utils/errorHandler')
const { query } = require('express')
const Institution = require('../models/Institution')
const Message = require('../models/Message')
const GroupMessage = require('../models/GroupMessage')
const Event = require('../models/Event')
const moment = require('moment')

module.exports.create = async function(req, res) {

    // login password
    const candidate = await User.findOne({login: req.body.login})
  
    if (candidate) {
      // Пользователь существует, нужно отправить ошибку
      res.status(409).json({
        message: 'Такой логин уже занят. Попробуйте другой.'
      })
    } else {
      // Нужно создать пользователя
      let institution
      if (req.user.levelStatus == 2) institution = req.user.institution
      else institution = req.body.institution

      const salt = bcrypt.genSaltSync(10)
      const password = req.body.password
      const user = new User({
        login: req.body.login,
        password: bcrypt.hashSync(password, salt),
        name: req.body.name,
        surname: req.body.surname,
        birthDate: req.body.birthDate,
        sex: req.body.sex,
        institution: institution,
        levelStatus: req.body.levelStatus,
        photo: req.file ? req.file.location : (req.body.sex == '2' ? '/images/girl.png' : '/images/boy.png'),
        online: req.body.online,
        text: req.body.text,
        read: req.body.read,
        firstColor: req.body.firstColor,
        secondColor: req.body.secondColor,
        surnameView: req.body.surnameView,
        setting: req.body.setting,
        vote: req.body.vote,
        sentence: req.body.sentence,
        answers: req.body.answers,
        change: req.body.change,
        defaultColor: req.body.defaultColor,
        birthdays: req.body.birthdays,
        events: req.body.events,
        screenreader: req.body.screenreader,
        games: req.body.games
      })
  
      try {
        await user.save()
        res.status(201).json(user)
      } catch(e) {
        errorHandler(res, e)
      }
  
    }
  }

module.exports.update = async function(req, res) {
  
  try {
    if ((req.user.levelStatus == 2 && req.body.institution == req.user.institution && req.body.levelStatus != 1) || req.user.levelStatus == 1) {
      if (!req.body.login) {
        const updated = req.body
        delete updated.score

        if (req.body.password) {
          const salt = bcrypt.genSaltSync(10)
          const password = req.body.password
          updated.password = bcrypt.hashSync(password, salt)
        }

        if (req.file) {
          updated.photo = req.file.location
        }
        
        const thisuser = await User.findOneAndUpdate(
          {_id: req.params.userID},
          {$set: updated},
          {new: true}
        )
        res.status(200).json(thisuser)
      }
      else {
        const candidate = await User.findOne({login: req.body.login})
    
        if (candidate) {
          // Пользователь существует, нужно отправить ошибку
          res.status(409).json({
            message: 'Такой логин уже занят. Попробуйте другой.'
          })
        } 
        else {
          const updated = req.body
          delete updated.score
          if (req.body.password) {
            const salt = bcrypt.genSaltSync(10)
            const password = req.body.password
            updated.password = bcrypt.hashSync(password, salt)
          }

          if (req.file) {
            updated.photo = req.file.location
          }
          
          const thisuser = await User.findOneAndUpdate(
            {_id: req.params.userID},
            {$set: updated},
            {new: true}
          )
          res.status(200).json(thisuser)
        }
      }
    }
    else {
      res.status(403).json({
        message: 'Недостаточно прав для совершения действия.'
      })
    }
  }
  catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getAll = async function(req, res) {
  q = {}
  if (req.user.levelStatus != 1) {
    q.institution = req.user.institution
  } else {
    if (req.query.institution) {
      q.institution =  req.query.institution
    }
  }

  if (req.query.name) {
    q.name =  req.query.name
  } 

  if (req.query.surname) {
    q.surname =  req.query.surname
  } 

  if (req.query.sex) {
    q.sex =  req.query.sex
  } 

  if (req.query.levelStatus) {
    let roles = req.query.levelStatus.split(',')
    q.levelStatus = {$in: roles}
  } 

  if (req.query.login) {
    q.login =  req.query.login
  }

  try {
    const now = new Date();
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}},
        {new: true})
        
    let users = await User
      .find(q, {loginDates: 0})
      .sort({surname: 1, name: 1})
      .skip(+req.query.offset)
      .limit(+req.query.limit)
      .lean()

    for (let user of users) {
      let institutionName = await Institution.findOne({_id: user.institution}, {_id: 0}) // {name: 'Name'}
      user.institutionName = institutionName.name
    }

    res.status(200).json(users)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getByUserID = async function(req, res) {
  try {
    let user = await User.findOne({_id: req.params.userID})
    const institution = await Institution.findOne({_id: user.institution}, {_id: 0})
    user.institutionName = institution.name
    res.status(200).json(user)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.remove = async function(req, res) {
  try { 
    if (req.params.userID != req.user.id && ((req.user.levelStatus == 2 && req.body.institution == req.user.institution && req.body.levelStatus != 1) || req.user.levelStatus == 1)) {
      await User.deleteOne({_id: req.params.userID})
      await Message.deleteMany({
        $or: [{recipient: req.params.userID}, {sender: req.params.userID}]
      })
      res.status(200).json({
        message: 'Пользователь удален.'
      })
    }
    else {
      res.status(403).json({
        message: 'Недостаточно прав для совершения действия.'
      })
    }
    
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getRating = async function(req, res) {
  try {
    const users = await User
    .find({score: {$gte: 0}}, {name: 1, surname: 1, photo: 1, institution: 1, score: 1, levelStatus: 1, sex: 1})
    .sort({score: -1, last_active_at: -1})
    .lean()

    for (const user of users) {
      const institution = await Institution.findOne({_id: user.institution}, {_id: 0})
      user.institutionName = institution.name
    }
    
    res.status(200).json(users)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getAnalytics = async function (req, res) {
  try {
    const users = await User.find({institution: req.params.instID, levelStatus: {$ne: 4}}, {name: 1, surname: 1, score: 1, loginDates: 1, expoPushToken: 1, last_active_at: 1, birthDate: 1, levelStatus: 1}).sort({name: 1, surname: 1}).skip(+req.query.offset).limit(+req.query.limit).lean()
    for (let user of users) {
      user.send_messages = await Message.count({sender: user._id})
      user.send_messages_read = await Message.count({sender: user._id, read: true})
      user.get_messages = await Message.count({recipient: user._id})
      user.get_messages_read = await Message.count({recipient: user._id, read: true})

      user.send_group_messages = await GroupMessage.count({sender: user._id})
      user.send_group_messages_read = await GroupMessage.count({sender: user._id, "read.1": {$exists: true}})
      user.get_group_messages_not_read = await GroupMessage.count({wait: user._id})
      user.get_group_messages_read = await GroupMessage.count({read: user._id, sender: {$ne: user._id}})

      user.event_hide = await Event.count({hide: user._id})
      user.event_participant = await Event.count({participants: user._id})
      user.event_author = await Event.count({autor: user._id})
      user.likes = await Event.count({likes: user._id})

      let him_recipient = await Message.distinct("sender", {recipient: user._id})
      let him_sender = await Message.distinct("recipient", {sender: user._id})
      
      for (let i = 0; i < him_sender.length; i++) him_sender[i] = him_sender[i].toString()
      for (let i = 0; i < him_recipient.length; i++) him_recipient[i] = him_recipient[i].toString()

      function union_arr(arr1, arr2) {
        let arr = [...arr1]
        for (let el of arr2) {
          if (!arr1.includes(el)) arr.push(el);
        }
        return arr.length;
      }

      function only_function(arr1, arr2) {
        let arr = []
        for (let el of arr1) {
          if (!arr2.includes(el)) arr.push(el)
        }
        return arr.length
      }

      user.all_chats = union_arr(him_recipient, him_sender)
      user.only_get_chats = only_function(him_recipient, him_sender)
      user.only_send_chats = only_function(him_sender, him_recipient)
      user.self_chat = await Message.findOne({sender: user._id, recipient: user._id}).lean() ? true : false
      user.send_and_get_chats = user.all_chats - (user.only_get_chats + user.only_send_chats)
    }

    res.status(200).json(users)
  } catch (e) {
    errorHandler(res, e)
  }
}
/*
module.exports.createManyUsers = async function (req, res) {
  try {
    for (let i = 1; i < 21; i++) {
      const salt = bcrypt.genSaltSync(10)
      const password = 'гость'
      const user = new User({
        login: `гость160321${i}`,
        password: bcrypt.hashSync(password, salt),
        name: `Гость${i}`,
        surname: `${i}`,
        sex: i % 4 == 0 ? 1 : 2,
        institution: '5fb77da2d49fe712e86e3e49',
        levelStatus: 5,
        photo: i % 4 != 0 ? '/images/girl.png' : '/images/boy.png',
        online: true,
        text: true,
        read: true,
        firstColor: 5,
        secondColor: 1,
        surnameView: true,
        setting: 2,
        vote: true,
        sentence: true,
        answers: true,
        change: true,
        defaultColor: 'color',
        birthdays: true,
        events: true
      })
      await user.save()
    }
    res.status(201).json({message: "Пользователи созданы"})
  } catch (e) {
    errorHandler(res, e)
  }
}
*/

// module.exports.onfunction = async function(req, res) {
//   try {
//     await User.updateMany(
//       {}, 
//       {$set: req.body},
//       {new: true})
//       res.status(200).json({message: "Обновлено"})
//   } catch (e) {
//     errorHandler(res, e)
//   }
// }
