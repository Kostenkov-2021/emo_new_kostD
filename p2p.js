
const express = require("express");
const app = express();
const bodyParser = require('body-parser')

const server = require("http").Server(app);
const io = require("socket.io")(server, {
    origins: ["http://localhost:4200", "https://emo.su:444", "https://emo.su:443"], 
    pingTimeout: 60000,
    maxHttpBufferSize: 1e8
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: 3,
  alive_timeout: 86400000
});

app.use("/peer", peerServer);

io.on('connection', (socket) => {
  console.log('Socket connect')

  socket.on("join-video-room", (roomId, user) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", user);
    socket.on("videoroom-message", (message) => {
      io.to(roomId).emit("videoroom-message", message);
    });

    socket.on('leave-video-room', (userLeave) => {
      io.to(roomId).emit("user-disconnected", userLeave);
      socket.leave(roomId)
    })
    socket.on('twice-connect', userIdUniqe => {
        io.to(roomId).emit("twice-connect", userIdUniqe);
    })
    socket.on("disconnect", () => {
      io.to(roomId).emit("user-disconnected", user);
    })
  });

  socket.on('in-chat', (id) => {
      socket.join(id)
      socket.join(id + '-online')
  })

  socket.on('in-group', (data) => {
    socket.join(data.group)
    io.in(data.group).emit('online', data.id)
  })

  socket.on('new message', (data) => {
      io.in(data.id).emit('new message', {message: data.message})
  })

  socket.on('new-group-message', (data) => {
    io.in(data.group).emit('new-group-message', data.message)
  })

  socket.on('online', (id) => {
      io.in(id + '-online').emit('online', id)
  })

  socket.on('leave room', (id) => {
      socket.leave(id)
      socket.leave(id + '-online')
  })

  socket.on('leave group room', (id) => {
    socket.leave(id)
  })

})


app.use(require('morgan')('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('cors')())

module.exports = server