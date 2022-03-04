const mongoose = require('mongoose')
const Schema = mongoose.Schema

const videoRoomSchema = new Schema({
    author: {
      ref: 'users',
      type: Schema.Types.ObjectId,
      required: true
    },
    privateLevel: {     //публичное
      type: Number, //0 - неавторизованные, 1 - все пользователи эмо, 2 - отдельные пользователи
      required: true
    },
    users: {           //приглашены
      ref: 'users',
      type: [Schema.Types.ObjectId]
    },
    image: {
      type: String
    },
    createTime: {
      type: Date,
      default: Date.now
    },
    title: {
      type: String,
      default: "Новая видео комната"
    },
    active: {
        type: Number,
        default: 0
    }
  })
  
  module.exports = mongoose.model('video_rooms', videoRoomSchema)