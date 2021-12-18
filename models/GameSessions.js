const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gameSessionSchema = new Schema({
  game: {
    type: Number,
    required: true
  },
  level: String,
  user: {
    ref: 'users',
    type: Schema.Types.ObjectId,
    required: true
  },
  score: Number,
  time: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('games_sessions', gameSessionSchema)