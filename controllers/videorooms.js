const errorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const VideoRoom = require('../models/VideoRoom');
const VideoRoomMessage = require('../models/VideoRoomMessage');
// const { Expo } = require('expo-server-sdk')
// const expo = new Expo();

module.exports.create = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}, $inc: {score: 1}},
        {new: true})

        const room = await new VideoRoom(req.body).save()
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
        if (room.author == req.user.id) {
          await VideoRoom.deleteOne({_id: req.params.id})
          await VideoRoomMessage.deleteMany({room: req.params.id})
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
      if (req.file) updated.image = 'https://emo.su/uploads/' + req.file.filename

      const room = await VideoRoom.findById(req.params.id, 'author').lean()
      const author = await User.findById(room.author, '_id institution photo name surname').lean()
      if (room.author == req.user.id || req.user.levelStatus == 1 || (req.user.levelStatus == 2 && author.institution == req.user.institution)) {
        const new_room = await VideoRoom.findOneAndUpdate({_id: req.params.id}, {$set: updated}, {new: true}).lean()
        new_room.author_ref = author
        res.status(200).json(new_room)
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
        const author = await User.findById(room.author, '_id institution photo name surname').lean()
        if (author) room.author_ref = author
      }
      res.status(200).json(rooms)

    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.getArchive = async function(req, res) {
  try {
    const q = {active: 2}
    if (req.user.levelStatus != 1 && req.user.levelStatus != 2) q.author = req.user.id
    if (req.user.levelStatus == 2) {
      const users = await User.distinct("_id", {institution: req.user.institution})
      q.author = {$in: users}
    }
    const rooms = await VideoRoom
    .find(q)
    .skip(+req.query.offset)
    .limit(+req.query.limit)
    .sort({createTime: -1})
    .lean()

    for (const room of rooms) {
      const author = await User.findById(room.author, '_id institution photo name surname').lean()
      if (author) room.author_ref = author
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
          const author = await User.findById(room.author, '_id institution photo name surname').lean()
          if (author) room.author_ref = author
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
        const author = await User.findById(room.author, '_id institution photo name surname').lean()
        if (author) room.author_ref = author
      }
      res.status(200).json(room)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.pushUser = async function(req, res) {  
  try {
    await VideoRoom.updateOne({_id: req.params.id}, {$addToSet: {users: req.params.user}}, {new: true}).lean()
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