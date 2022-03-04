const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  login: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date
  },
  sex: {            //1 - boy, 2 - girl
    type: Number,
    required: true
  },
  institution: {
    ref: 'institutions',
    type: Schema.Types.ObjectId
  },
  levelStatus: {    // 1 - админ, 2 - модератор, 3 - подопечный, 4 - гость, 5 - родитель, 6 - запрос
    type: Number,
    required: true
  },
  photo: {
    type: String,
    default: ''
  },
  onlineStatus: {
      type: String,
      default: '-1'
  },
  last_active_at: {
    type: Date
  },

  info: String,

  // settings  
  online: {         // показывать ли онлайны других пользователей
    type: Boolean,
    default: true
  },
  text: {           // показывать ли подписи к пиктограммам
    type: Boolean,
    default: true
  },
  read: {           // показывать, почитаны сообщения или нет
    type: Boolean,
    default: true
  },
  firstColor: {          // первый цвет: 1 - розовый, 2 - оранжевый, 3 - жёлтый, 4 - зелёный, 5 - голубой, 6 - фиолетовый, 7 - коричневый
    type: Number,
    default: 5
  },
  secondColor: {          // второй цвет
    type: Number,
    default: 1
  },
  surnameView: {        // показывать ли фамилии
    type: Boolean,
    default: true
  },
  setting: {        // 0 - не разрешать менять настройки, 1 - разрешать менять только цвета, 2 - разрешать менять все настройки
    type: Number,
    default: 2
  },
  vote: {               // разрешить записывать голосовые сообщения
    type: Boolean,
    default: true
  },
  sentence: {           // может ли отправлять предложения
    type: Boolean,
    default: true
  },
  answers: {            // видны ли подсказки к ответам
    type: Boolean,
    default: true
  },
  change: {             // доступна ли смена картинок цветные/чб
    type: Boolean,
    default: true
  },
  defaultColor: {       // цветные/чб по умолчанию ('grey', 'color')
    type: String,
    default: 'grey'
  },
  birthdays: {          // отображаются ли именинники
    type: Boolean,
    default: true
  },
  screenreader: {
    type: Boolean,
    default: true
  },
  time: {   //время сообщения
    type: Boolean,
    default: true
  },
  events: {          // мероприятия
    type: Boolean,
    default: true
  },
  loginDates: {
    type: [String]
  },
  score: Number,
  games: {          
    type: Boolean,
    default: true
  },
  videorooms: {
    type: Boolean,
    default: false
  },
  expoPushToken: String,
  // access: {
  //   privacy: [String], //политика конфиденциальности
  //   agreement: [String] //пользовательское соглашение
  // }
})

module.exports = mongoose.model('users', userSchema)