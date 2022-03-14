const mongoose = require('mongoose')
const Schema = mongoose.Schema

const comSchema = new Schema({
  autor: {
    ref: 'users',
    type: Schema.Types.ObjectId,
    required: true
  },
  participants: {     //участники
    ref: 'users',
    type: [Schema.Types.ObjectId]
  },
  waitingList: {     //заявки на участие
    ref: 'users',
    type: [Schema.Types.ObjectId]
  },
  subscribers: {     //подписчики
    ref: 'users',
    type: [Schema.Types.ObjectId]
  },
  private_settings: {
    isUnAuthWatch: Boolean,
    query: Object,
    waitingList: Number //0 - участие без подтверждения, 1 - участие после подтверждения, 2 - участие по приглашениям
  },
  name: {   
    type: String
  },
  description: {   //описание
    type: String
  },
  image: {
    type: String
  },
  status: {     
    type: Number,   //0 - ожидание, 1 - активно, -1 - архив
    required: true
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  likes: {
    ref: 'users',
    type: [Schema.Types.ObjectId]
  }
})

module.exports = mongoose.model('community', comSchema)