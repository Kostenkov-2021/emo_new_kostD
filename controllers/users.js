const bcrypt = require('bcryptjs')
const User = require('../models/User')
const errorHandler = require('../utils/errorHandler')
const Institution = require('../models/Institution')
const Message = require('../models/Message')
const GroupMessage = require('../models/GroupMessage')
const Event = require('../models/Event')
const Picture = require('../models/Picture')
const GameSession = require('../models/GameSessions')

module.exports.create = async function(req, res) {
    try {
    // login password
      const candidate = await User.findOne({login: req.body.login})
  
      if (candidate) {
        // Пользователь существует, нужно отправить ошибку
        res.status(409).json({
          message: 'Такой логин уже занят. Попробуйте другой.'
        })
      } else {
        // Нужно создать пользователя
        
        const create = req.body
        create.photo = req.file ? 'https://emo.su/uploads/' + req.file.filename : (req.body.sex == '2' ? 'https://emo.su/images/girl.png' : 'https://emo.su/images/boy.png')
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password
        create.password = bcrypt.hashSync(password, salt)
        if (req.user.levelStatus == 2) create.institution = req.user.institution

        const user = await new User(create).save()
        res.status(201).json(user)
      }
    } catch(e) {
      errorHandler(res, e)
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
          updated.photo = 'https://emo.su/uploads/' + req.file.filename
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
            updated.photo = 'https://emo.su/uploads/' + req.file.filename
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
      user.institutionName = institutionName ? institutionName.name : 'не указано'
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
    user.institutionName = institution ? institution.name : 'не указано'
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
    let q = {score: {$gte: 0}, levelStatus: {$nin: [4, 6]}}
    if (req.query.institution) q.institution = req.query.institution
    const users = await User
    .find(q, {name: 1, surname: 1, photo: 1, institution: 1, score: 1, levelStatus: 1, sex: 1})
    .sort({score: -1, last_active_at: -1})
    .skip(+req.query.offset)
    .limit(+req.query.limit)
    .lean()

    for (const user of users) {
      const institution = await Institution.findOne({_id: user.institution}, {_id: 0})
      user.institutionName = institution.name ? institution.name : "Без организации"
    }
    
    res.status(200).json(users)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getRatingPosition = async function(req, res) {
  try {
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: new Date()}},
      {new: true}) 

    const user = await User.findById(req.user.id).lean()
    const position = await User
    .count({score: {$gt: user.score}, levelStatus: {$nin: [4, 6]}})
    .lean()
    
    res.status(200).json({position: position + 1})
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getAnalytics = async function (req, res) {
  try {
    const users = await User.find({institution: req.params.instID, levelStatus: {$nin: [4, 6]}}, {name: 1, surname: 1, score: 1, loginDates: 1, expoPushToken: 1, last_active_at: 1, birthDate: 1, levelStatus: 1}).sort({name: 1, surname: 1}).skip(+req.query.offset).limit(+req.query.limit).lean()
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
      user.self_chat = await Message.count({sender: user._id, recipient: user._id})
      user.send_and_get_chats = user.all_chats - (user.only_get_chats + user.only_send_chats)

      user.pictures = await Picture.count({parent: {$in: ['5f1309e3962c2f062467f854', '603e1ae80c54fc9b6e417951']}, user: user._id})
      user.videos = await Picture.count({parent: {$in: ['5f1309f1962c2f062467f855','603e1b0c0c54fc9b6e417952']}, user: user._id})
      user.music = await Picture.count({parent: {$in: ['5f130a00962c2f062467f856','603e1b430c54fc9b6e417953']}, user: user._id})
      user.documents = await Picture.count({parent: {$in: ['5f130a0d962c2f062467f857','603e1b630c54fc9b6e417954']}, user: user._id})
      user.vote = await Picture.count({parent: {$in: ['5f5486f982194ca1fb21ff6d', '603e1ba10c54fc9b6e417955']}, user: user._id})

      user.send_pictures = await Message.count({sender: user._id, type: 1}) + await GroupMessage.count({sender: user._id, type: 1})
      user.send_text = await Message.count({sender: user._id, type: 2}) + await GroupMessage.count({sender: user._id, type: 2})
      user.send_audios = await Message.count({sender: user._id, type: 3}) + await GroupMessage.count({sender: user._id, type: 3})
      user.send_videos = await Message.count({sender: user._id, type: 4}) + await GroupMessage.count({sender: user._id, type: 4})
      user.send_documents = await Message.count({sender: user._id, type: 5}) + await GroupMessage.count({sender: user._id, type: 5})

      user.get_pictures = await Message.count({recipient: user._id, type: 1}) + await GroupMessage.count({$or: [{wait: user._id}, {read: user._id}], type: 1})
      user.get_text = await Message.count({recipient: user._id, type: 2}) + await GroupMessage.count({$or: [{wait: user._id}, {read: user._id}], type: 2})
      user.get_audios = await Message.count({recipient: user._id, type: 3}) + await GroupMessage.count({$or: [{wait: user._id}, {read: user._id}], type: 3})
      user.get_videos = await Message.count({recipient: user._id, type: 4}) + await GroupMessage.count({$or: [{wait: user._id}, {read: user._id}], type: 4})
      user.get_documents = await Message.count({recipient: user._id, type: 5}) + await GroupMessage.count({$or: [{wait: user._id}, {read: user._id}], type: 5})
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
//     let grMes = await GroupMessage.find({}).lean()
//     for (let gm of grMes) {
//       let newMes = []
//       for (let str of gm.message) {
//         let a = str.replace("https://emooo.s3.amazonaws.com", "https://emo.su/uploads/from-aws").replace("https://emooo.s3.eu-north-1.amazonaws.com", "https://emo.su/uploads/from-aws")
//         if (str.substring(0, 7) == 'uploads') {
//           a = str.replace("uploads/", "https://emo.su/uploads/")
//         }
//         newMes.push(a)
//       }
//       await GroupMessage.updateOne({_id: gm._id}, {$set: {message: newMes}}, {new: true})
//     }
//     res.status(200).json({message: "Обновлено"})
//   } catch (e) {
//     errorHandler(res, e)
//   }
// }
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

module.exports.createRequest = async function(req, res) {
  // login password
  const candidate = await User.findOne({login: req.body.login})
  
  if (candidate) {
    // Пользователь существует, нужно отправить ошибку
    res.status(409).json({
      message: 'Такой логин уже занят. Попробуйте другой.'
    })
  } else {
    const salt = bcrypt.genSaltSync(10)
    const password = req.body.password
    const user = new User({
      login: req.body.login,
      password: bcrypt.hashSync(password, salt),
      name: req.body.name,
      surname: req.body.surname,
      birthDate: req.body.birthDate,
      sex: req.body.sex,
      institution: req.body.institution,
      levelStatus: 6,
      photo: req.file ? 'https://emo.su/uploads/' + req.file.filename : (req.body.sex == '2' ? 'https://emo.su/images/girl.png' : 'https://emo.su/images/boy.png'),
      info: req.body.info
    })

    try {
      await user.save()
      res.status(201).json(user)
    } catch(e) {
      errorHandler(res, e)
    }

  }
}

module.exports.countRequests = async function(req, res) {
  try {
    let q = {levelStatus: 6}
    if (req.user.levelStatus != 1) q.institution = req.user.institution
    const num = await User.count(q).lean()
    res.status(201).json({requests: num})
  } catch(e) {
    errorHandler(res, e)
  }
}