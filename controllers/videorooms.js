const errorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const VideoRoom = require('../models/VideoRoom');
// const { Expo } = require('expo-server-sdk')
// const expo = new Expo();

module.exports.create = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}, $inc: {score: 1}},
        {new: true})

        const room = await new VideoRoom({
            author: req.user.id,
            privateLevel: req.body.privateLevel,
            users: req.body.users,
            image: req.body.image,
            title: req.body.title
        }).save()

        res.status(201).json(room)

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

        const room = await VideoRoom.findById(req.params.id, 'author').lean()
        const author = await User.findById(room.author, 'institution').lean()
        if (room.author == req.user.id || req.user.levelStatus == 1 || (req.user.levelStatus == 2 && author.institution == req.user.institution)) {
          await VideoRoom.updateOne({_id: req.params.id}, {$set: {active: 2}}, {new: true})
          res.status(200).json({
            message: 'Видеокомната удалена.'
          })
        } else {
          res.status(403).json({
            message: 'Недостаточно прав для совершения операции.'
          })
        }

    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.update = async function(req, res) {
  try {
      const now = new Date();
      await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true})

      const updated = req.body
      if (req.file) updated.image = req.file.location

      const room = await VideoRoom.findById(req.params.id, 'author').lean()
      const author = await User.findById(room.author, 'institution').lean()
      if (room.author == req.user.id || req.user.levelStatus == 1 || (req.user.levelStatus == 2 && author.institution == req.user.institution)) {
        const room = await VideoRoom.findOneAndUpdate({_id: req.params.id}, {$set: updated}, {new: true})
        res.status(200).json(room)
      } else {
        res.status(403).json({
          message: 'Недостаточно прав для совершения операции.'
        })
      }

  } catch (e) {
      errorHandler(res, e) 
  }
}

module.exports.getAll = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}},
        {new: true})

        const rooms = await VideoRoom
        .find({active: {$ne: 2}, $or: [{privateLevel: {$in: [0, 1]}}, {author: req.user.id}, {users: req.user.id, privateLevel: 2}]})
          .skip(+req.query.offset)
          .limit(+req.query.limit)
          .sort({createTime: -1})
          .lean()

        for (const room of rooms) {
          const author = await User.findById(room.author).lean()
          if (author) room.institution = author.institution
          room.user_refs = []
          for (let id of room.users) {
            const user = await User.findOne({_id: id}, {_id: 1, name: 1, surname: 1, institution: 1, photo: 1}).lean()
            room.user_refs.push(user)
          }
        }
        res.status(200).json(rooms)

    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.getByIdPublic = async function(req, res, next) {
    try {
        const room = await VideoRoom.findOne({_id: req.params.id, privateLevel: 0}).lean()

        if (room) {
          room.user_refs = []
          for (let id of room.users) {
            const user = await User.findOne({_id: id}, {_id: 1, name: 1, surname: 1, institution: 1, photo: 1}).lean()
            room.user_refs.push(user)
          }
          res.status(200).json(room)
        }
        next()
    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.getByIdPrivate = async function(req, res) {
  try {
      const room = await VideoRoom.findOne({_id: req.params.id, $or: [{privateLevel: {$in: [0, 1]}}, {author: req.user.id}, {users: req.user.id}]}).lean()
      if (room) {
        room.user_refs = []
        for (let id of room.users) {
          const user = await User.findOne({_id: id}, {_id: 1, name: 1, surname: 1, institution: 1, photo: 1}).lean()
          room.user_refs.push(user)
        }
      }
      res.status(200).json(room)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.pushUser = async function(req, res) {  
  try {
    console.log('here 1')
    await VideoRoom.updateOne({_id: req.params.id}, {$addToSet: {users: req.params.user}}, {new: true}).lean()
    console.log('here 2')
    res.status(200).json({message: 'Добавлено'})
  } catch (e) {
      errorHandler(res, e)
  }
}

module.exports.deleteUser = async function(req, res) {  
  try {
    await VideoRoom.updateOne({_id: req.params.id}, {$pull: {users: req.params.user}}, {new: true}).lean()
    res.status(200).json({message: 'Удалено'})
  } catch (e) {
      errorHandler(res, e)
  }
}

module.exports.changeUsers = async function(req, res) {  
  try {
    if (req.body.toPush && req.body.toPush.length) await VideoRoom.updateOne({_id: req.params.id}, {$addToSet: {users: {$each: req.body.toPush}}}, {new: true}).lean()
    if (req.body.toRemove && req.body.toRemove.length) await VideoRoom.updateOne({_id: req.params.id}, {$pullAll: {users: req.body.toRemove}}, {new: true}).lean()
    res.status(200).json({message: 'Изменено'})
  } catch (e) {
      errorHandler(res, e)
  }
}