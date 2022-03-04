const errorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const VideoRoomMessage = require('../models/VideoRoomMessage');
const VideoRoom = require('../models/VideoRoom');

module.exports.send = async function(req, res) {
    try {
        const message = new VideoRoomMessage({
            senderName: req.body.senderName,
            room: req.params.id,
            type: req.body.type,
            message: req.body.message
        })
        if (req.body.sender) message.sender = req.body.sender

        await message.save()

        res.status(201).json(message)

    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.remove = async function(req, res) {
    try {
        await VideoRoomMessage.deleteOne({_id: req.params.id})
        res.status(200).json({
            message: 'Сообщение удалено.'
        })
    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.getAll = async function(req, res) {
  try {
      const messages = await VideoRoomMessage
      .find({room: req.params.id})
      .skip(+req.query.offset)
      .limit(+req.query.limit)
      .sort({time: -1})
      .lean()

      messages.reverse()

      for (let message of messages) {
          const sender = await User.findOne({_id: message.sender}, {name: 1, surname: 1})
          if (sender) message.senderName = sender.name + ' ' + sender.surname
      }

      res.status(200).json(messages)

  } catch (e) {
      errorHandler(res, e) 
  }
}

module.exports.getById = async function(req, res) {
    try {

        const message = await VideoRoomMessage.findById(req.params.id)

        res.status(200).json(message)

    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.read = async function(req, res) {  
    try {

        await VideoRoomMessage.updateMany({room: req.params.id}, {$addToSet: {read: req.user.id}}, {new: true})
        res.status(200).json({message: 'Прочитано'})
        
    } catch (e) {
        errorHandler(res, e)
    }
  }