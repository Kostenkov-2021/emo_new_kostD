const mongoose = require('mongoose')
const errorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const Picture = require('../models/Picture');
const GroupMessage = require('../models/GroupMessage');
const Event = require('../models/Event');
const { Expo } = require('expo-server-sdk')

const expo = new Expo();

module.exports.send = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}, $inc: {score: 1}},
        {new: true})

        const group = req.params.groupID

        let read = []
        let wait = []

        const event =  await Event.findOne({_id: group})
        for (let participant of event.participants) {
            const status = await User.findOne({_id: participant._id}, {onlineStatus: 1, last_active_at: 1, _id: 0})
            if (status.onlineStatus == group && (new Date().getTime() - new Date(status.last_active_at).getTime()) < 300000 && !read.includes(participant._id)) read.push(participant._id)
            else if (!wait.includes(participant._id)) wait.push(participant._id)
        }

        const message = await new GroupMessage({
            sender: req.user.id,
            group,
            type: req.body.type,
            message: req.body.message,
            read,
            wait
        }).save()

        const user = await User.findOne({_id: req.user.id}, {name: 1, photo: 1, sex: 1})

        const messageInBD = await GroupMessage.findOne({_id: message._id}).lean()

        messageInBD.senderName = user.name
        messageInBD.senderPhoto = user.photo

        let messages = [];

        let somePushTokens = []

        for (let us of wait) {
          let getUser = await User.findOne({_id: us}, {expoPushToken: 1, _id: 0}).lean()
          if (getUser.expoPushToken) somePushTokens.push(getUser.expoPushToken)
        }

        try {
          for (let pushToken of somePushTokens) {
            if (!Expo.isExpoPushToken(pushToken)) {
              console.error(`Push token ${pushToken} is not a valid Expo push token`);
              continue;
            }

            messages.push({
              to: pushToken,
              sound: 'default',
              title: 'Групповое сообщение',
              body: `${user.name} прислал${user.sex == 2 ? 'а' : ''} новое групповое сообщение`,
            })
          }

          let chunks = expo.chunkPushNotifications(messages);
          (async () => {
            for (let chunk of chunks) {
              try {
                await expo.sendPushNotificationsAsync(chunk);
              } catch (error) {
                console.error(error);
              }
            }
          })();
        } catch (e) {
          console.log(e)
        }

        res.status(201).json(messageInBD)

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

        await GroupMessage.deleteOne({_id: req.params.messageID})
        res.status(200).json({
            message: 'Сообщение удалено.'
        })

    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.getAll = async function(req, res) {
    try {
        const id = mongoose.Types.ObjectId(req.user.id);
        const now = new Date();
        await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now, onlineStatus: req.params.groupID}, $inc: {score: 1}},
        {new: true})

        const messages = await GroupMessage.find({group: req.params.groupID}).lean()

        for (let message of messages) {
            const sender = await User.findOne({_id: message.sender}, {name: 1, photo: 1})
            message.senderName = sender.name
            message.senderPhoto = sender.photo 
        }

        await GroupMessage.updateMany(
          {group: req.params.groupID},
          {$pull: {wait: id}},
          {new: true}
        )

        await GroupMessage.updateMany(
          {group: req.params.groupID},
          {$addToSet: {read: id}},
          {new: true}
        )

        res.status(200).json(messages)

    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.getAll2 = async function(req, res) {
  try {
      const id = mongoose.Types.ObjectId(req.user.id);
      const now = new Date();
      await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now, onlineStatus: req.params.groupID}, $inc: {score: +req.query.offset === 0 ? 1 : 0}},
      {new: true})

      const messages = await GroupMessage
      .find({group: req.params.groupID})
      .skip(+req.query.offset)
      .limit(+req.query.limit)
      .sort({time: -1})
      .lean()

      messages.reverse()

      for (let message of messages) {
          const sender = await User.findOne({_id: message.sender}, {name: 1, photo: 1})
          message.senderName = sender.name
          message.senderPhoto = sender.photo 
      }

      await GroupMessage.updateMany(
        {group: req.params.groupID},
        {$pull: {wait: id}},
        {new: true}
      )

      await GroupMessage.updateMany(
        {group: req.params.groupID},
        {$addToSet: {read: id}},
        {new: true}
      )

      res.status(200).json(messages)

  } catch (e) {
      errorHandler(res, e) 
  }
}

module.exports.getById = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}},
        {new: true})

        const message = await GroupMessage.findOne({_id: req.params.id})

        res.status(200).json(message)

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
      for (const file of files) {

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
            boysGreyPicture: 'https://emo.su/uploads/' + file.filename,
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
            boysGreyPicture: 'https://emo.su/uploads/' + file.filename,
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
            boysGreyPicture: 'https://emo.su/uploads/' + file.filename,
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
            boysGreyPicture: 'https://emo.su/uploads/' + file.filename,
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
      boysGreyPicture: 'https://emo.su/uploads/' + req.file.filename, 
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
