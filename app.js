const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const path = require('path')

const authRoutes = require('./routes/auth')
const chatRoutes = require('./routes/chat')
const peopleRoutes = require('./routes/people')
const picturesRoutes = require('./routes/pictures')
const usersRoutes = require('./routes/users')
const institutionsRoutes = require('./routes/institutions')
const botRoutes = require('./routes/bot')
const eventsRoutes = require('./routes/events')
const groupRoutes = require('./routes/group')
const tableRoutes = require('./routes/table')
const videoroomRoutes = require('./routes/videorooms')
const videoroommessagesRoutes = require('./routes/videoroommessages')
const keys = require('./config/keys')

const app = express()

mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
    })
    .then(() => console.log('MongoDB connected'))
    .catch(error => console.log(error))

app.use(require('morgan')('dev'))
app.use(passport.initialize())
require('./middleware/passport')(passport)

app.use('/uploads', express.static('uploads'))
app.use('/images', express.static('images'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('cors')())

app.use('/api/login', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/people', peopleRoutes)
app.use('/api/bot', botRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/group', groupRoutes)
app.use('/api/table', tableRoutes)
app.use('/api/videorooms', videoroomRoutes)
app.use('/api/videoroom-messages', videoroommessagesRoutes)
app.use('/api/manage/pictures', picturesRoutes)
app.use('/api/manage/users', usersRoutes)
app.use('/api/manage/institutions', institutionsRoutes)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/dist/client'))
    app.use(express.static(__dirname))
  
    const client = [
      '.js',
      '.css',
      '.ico'
    ];

    const files = [
      '.png',
      '.jpg',
      '.jpeg',
      '.cur',
      '.svg'
    ];
   
    app.get('*', (req, res) => {
      if (files.includes(path.extname(req.path))) {
        res.sendFile(path.join(__dirname, `${req.path}`));
      } else if (client.includes(path.extname(req.path))) {
        res.sendFile(path.join(__dirname, `client/dist/client/${req.path}`));
      } else {
        res.sendFile(path.join(__dirname, 'client/dist/client/index.html'));
      }
    })
  }

module.exports = app
