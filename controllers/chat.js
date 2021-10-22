const errorHandler = require('../utils/errorHandler')
const User = require('../models/User')
const Message = require('../models/Message')
const Picture = require('../models/Picture')
const { Expo } = require('expo-server-sdk')

const expo = new Expo();

module.exports.getAllMessage = async function(req, res) {   
    try {
      const friend = req.params.userID
      const me = req.user.id
      const now = new Date();
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {onlineStatus: friend, last_active_at: now}, $inc: {score: 1}},
        {new: true})
      const messagesRead = await Message
        .find({ $or: [
            {sender: me, recipient: friend},
            {sender: friend, recipient: me, read: true}
          ]
        })
        .sort({time: 1})
        .lean()
        
        const messagesNotRead = await Message
        .find(
          {sender: friend, recipient: me, read: false}
        )
        .sort({time: 1})
        .lean()

      const message = {messagesRead, messagesNotRead}
      
      await Message.updateMany(
        {sender: friend, recipient: me}, 
        {$set: {read: true}},
        {new: true})
        console.log(4, new Date())
      res.status(200).json(message)
      
    } catch (e) {
      errorHandler(res, e)
    }
  }

module.exports.getAllPictures = async function(req, res) {
    try {
      const now = new Date();
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}},
        {new: true})

      const f = {parent: req.params.parentID}
      let sort = 1
      if (
        req.params.parentID == '5f1309e3962c2f062467f854' || 
        req.params.parentID == '5f1309f1962c2f062467f855' || 
        req.params.parentID == '5f130a00962c2f062467f856' || 
        req.params.parentID == '5f5486f982194ca1fb21ff6d' || 
        req.params.parentID == '5f130a0d962c2f062467f857' ||
        req.params.parentID == '603e1ae80c54fc9b6e417951' || 
        req.params.parentID == '603e1b0c0c54fc9b6e417952' || 
        req.params.parentID == '603e1b430c54fc9b6e417953' || 
        req.params.parentID == '603e1b630c54fc9b6e417954' || 
        req.params.parentID == '603e1ba10c54fc9b6e417955') {
          f.user = req.user.id
          sort = -1
        }
      const pictures = await Picture
      .find(f, {system: 0})
      .sort({p_sort: sort})

      const folder = await Picture.findOne({_id: req.params.parentID}, {many: 1, parent: 1})
      const picturesAndFolder = {pictures, folder}

      res.status(200).json(picturesAndFolder)
    } catch (e) {
      errorHandler(res, e)
    }
  }

module.exports.send = async function(req, res) {
  try { 
    const now = new Date();
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}, $inc: {score: 1}},
      {new: true})
      
    const recipient = await User.findOne({_id: req.params.friend}, {onlineStatus: 1, last_active_at: 1, expoPushToken: 1, _id: 0}).lean()
    const read = (recipient.onlineStatus == req.user.id && (new Date().getTime() - new Date(recipient.last_active_at).getTime()) < 300000) ? true : false
    
    const message = await new Message({
      sender: req.user.id,
      recipient: req.params.friend,
      message: req.body.message,
      type: req.body.type,
      read
    }).save()

    const sender = await User.findOne({_id: req.user.id}, {name: 1, sex: 1, _id: 0}).lean()

    try {
      if (Expo.isExpoPushToken(recipient.expoPushToken) && !read) {
        let notification = {
          to: recipient.expoPushToken,
          sound: 'default',
          title: 'Личное сообщение',
          body: `${sender.name} прислал${sender.sex == 2 ? 'а' : ''} вам личное сообщение`,
        }
  
        let chunks = expo.chunkPushNotifications([notification]);
        (async () => {
          for (let chunk of chunks) {
            try {
              await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
              console.error(error);
            }
          }
        })();
      }
    } catch (e) {
      console.log(e)
    }
    
    

    res.status(201).json(message)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.remove = async function(req, res) {
  try {
    const now = new Date();
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true})

    await Message.deleteOne({_id: req.params.messageID})
    res.status(200).json({
      message: 'Сообщение удалено.'
    })
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.removeAll = async function(req, res) {
  try {
    const now = new Date();
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true})

    const friend = req.params.friend
    const me = req.user.id

    await Message.deleteMany({ $or: [
      {sender: me, recipient: friend},
      {sender: friend, recipient: me}
  ] 
  })
    res.status(200).json({
      message: 'Сообщения удалены.'
    })
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.create = async function(req, res) {
  const now = new Date();
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true}) 

  function randomInteger(min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  try {
    if (req.files) {
      const files = req.files
      for (let file of files) {

        if (file.mimetype === 'image/png' 
        || file.mimetype === 'image/jpeg' 
        || file.mimetype === 'image/jpg'
        || file.mimetype === 'image/gif'
        || file.mimetype === 'image/webp') 
        {
          const lastPicture = await Picture
            .findOne({parent: '5f1309e3962c2f062467f854', user: req.user.id})
            .sort({p_sort: -1})

          const maxSort = lastPicture ? lastPicture.p_sort : 0

          const pictures = await new Picture({
            folder: false,
            boysGreyPicture: file.location,
            parent: '5f1309e3962c2f062467f854',
            p_sort: maxSort + 1,
            user: req.user.id
          }).save()
        }

        else if (file.mimetype === 'video/mp4' 
        || file.mimetype === 'video/x-msvideo' 
        || file.mimetype === 'video/mpeg'
        || file.mimetype === 'video/ogg'
        || file.mimetype === 'video/webm'
        || file.mimetype === 'video/quicktime'
        || file.mimetype === 'video/avi') 
        {
          const lastPicture = await Picture
            .findOne({parent: '5f1309f1962c2f062467f855', user: req.user.id})
            .sort({p_sort: -1})

          const maxSort = lastPicture ? lastPicture.p_sort : 0

          const pictures = await new Picture({
            folder: false,
            boysGreyPicture: file.location,
            parent: '5f1309f1962c2f062467f855',
            p_sort: maxSort + 1,
            user: req.user.id
          }).save()
        }

        else if (file.mimetype === 'audio/mpeg3' 
        || file.mimetype === 'audio/x-mpeg3' 
        || file.mimetype === 'audio/mod'
        || file.mimetype === 'audio/x-mod'
        || file.mimetype === 'audio/mpeg'
        || file.mimetype === 'audio/x-mpeg'
        || file.mimetype === 'audio/ogg'
        || file.mimetype === 'audio/wav'
        || file.mimetype === 'audio/webm') 
        {
          const lastPicture = await Picture
            .findOne({parent: '5f130a00962c2f062467f856', user: req.user.id})
            .sort({p_sort: -1})

          const maxSort = lastPicture ? lastPicture.p_sort : 0

          const pictures = await new Picture({
            folder: false,
            boysGreyPicture: file.location,
            parent: '5f130a00962c2f062467f856',
            p_sort: maxSort + 1,
            user: req.user.id,
            text: file.originalname,
            color: randomInteger(1, 12)
          }).save()
        }

        else {
          const lastPicture = await Picture
            .findOne({parent: '5f130a0d962c2f062467f857', user: req.user.id})
            .sort({p_sort: -1})

          const maxSort = lastPicture ? lastPicture.p_sort : 0

          const pictures = await new Picture({
            folder: false,
            boysGreyPicture: file.location,
            parent: '5f130a0d962c2f062467f857',
            p_sort: maxSort + 1,
            user: req.user.id,
            text: file.originalname,
            color: randomInteger(1, 12)
          }).save()
        }
      }
    }
    res.status(201).json({message: 'Файлы загружены.'})
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getFriend = async function (req, res) {
  try {
      const user = await User.findOne({_id: req.params.id}, {photo: 1, sex: 1})
      res.status(200).json(user)
  } catch (e) {
      errorHandler(res, e)
  } 
}

module.exports.getAnswers = async function (req, res) {
  try {
    const src = req.body.src
    const picture = await Picture.findOne({
      $or: [
        {boysGreyPicture: src},
        {girlsGreyPicture: src},
        {boysColorPicture: src},
        {girlsColorPicture: src}
      ]}, {answers: 1})

      let answers = []

      if (picture && picture.answers) {
        for (let id of picture.answers) {
          let answer = await Picture.findOne({_id: id}, 
            {boysGreyPicture: 1, girlsGreyPicture: 1, boysColorPicture: 1, girlsColorPicture: 1, 
            folder: 1, text: 1, textForGirls: 1})
          answers.push(answer)
        }
      }
      
      res.status(200).json({answers})
  } catch (e) {
      errorHandler(res, e)
  }
}

module.exports.vote = async function (req, res) {
  
  const now = new Date();
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true})

  function randomInteger(min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }
  try {
    
    const lastPicture = await Picture
      .findOne({parent: '5f5486f982194ca1fb21ff6d', user: req.user.id})
      .sort({p_sort: -1})

    const maxSort = lastPicture ? lastPicture.p_sort : 0

    const vote = await new Picture({
      folder: false,
      boysGreyPicture: req.file.location,
      parent: '5f5486f982194ca1fb21ff6d',
      p_sort: maxSort + 1,
      user: req.user.id,
      text: 'Моё голосовое сообщение',
      color: randomInteger(1, 12)
    }).save()

    res.status(201).json(vote)
  } catch(e) {
    errorHandler(res, e)
  }
}