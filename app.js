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
const regionRoutes = require('./routes/regions')
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
app.use('/api/regions', regionRoutes)
app.use('/api/videoroom-messages', videoroommessagesRoutes)
app.use('/api/manage/pictures', picturesRoutes)
app.use('/api/manage/users', usersRoutes)
app.use('/api/manage/institutions', institutionsRoutes)

if (process.env.NODE_ENV === 'production') {
    app.use('/uploads', express.static('uploads'))
    app.use('/images', express.static('images'))
    app.use('/client/dist', express.static('client/dist'))
  
    const client = [
      '.js',
      '.css',
      '.ico'
    ];

    const html = [
      '.html'
    ];
   
    app.get('*', (req, res) => {
      if (client.includes(path.extname(req.path))) {
        res.sendFile(path.join(__dirname, `client/dist/client/${req.path}`));
      } else if (html.includes(path.extname(req.path))) {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
      } else {
        res.sendFile(path.join(__dirname, `${req.path}`));
      }  
    })
  } else {
    app.use('/uploads', express.static('uploads'))
    app.use('/images', express.static('images'))
  } 

module.exports = app
