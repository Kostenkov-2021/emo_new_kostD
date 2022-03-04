import * as io from 'socket.io-client';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Message, GroupMessage, VideoRoomMessage } from '../interfaces';
import  Peer  from  'peerjs-client' 

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  newMessage: EventEmitter<Message> = new EventEmitter()
  newGroupMessage: EventEmitter<GroupMessage> = new EventEmitter()
  online: EventEmitter<string> = new EventEmitter()
  newVideoStream: EventEmitter<any> = new EventEmitter()
  newVideoRoomMessage: EventEmitter<VideoRoomMessage> = new EventEmitter()
  videoID: EventEmitter<string> = new EventEmitter()
  leaveRoomID: EventEmitter<string> = new EventEmitter()

  socket = io(environment.SOCKET_ENDPOINT).connect()

  peer 

  constructor() {}

  videoRoomStart(room) {
    this.peer = new Peer({
      // host: 'localhost',
      // port: 80,
      // path: '/',
      secure: environment.production ? true : false
    });
    this.peer.on("open", (id) => {
      this.videoID.emit(id)
      this.socket.emit("join-video-room", room._id, id);
    });
  }

  startStreamInVideoroom(stream) {
    this.peer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        this.newVideoStream.emit({userVideoStream, userId: call.peer})
      });
    });

    this.socket.on("user-connected", (userId) => {
      // console.log("user-connected", userId)
      const call = this.peer.call(userId, stream);
      call.on("stream", (userVideoStream) => {
        this.newVideoStream.emit({userVideoStream, userId})
      });
    });

    this.socket.on("user-disconnected", (userId) => {
      this.leaveRoomID.emit(userId)
    });

    this.socket.on("videoroom-message", (message) => {
      this.newVideoRoomMessage.emit(message)
    });
  }
  
  setupSocketConnection(id, interlocutor) {       //вхождение в чат (ngOnInit)
    this.socket.emit('in-chat', id)

    this.socket.emit('online', interlocutor)

    this.socket.on('new message', (data) => {
      this.newMessage.emit(data.message)
    })

    this.socket.on('online', (id) => {
      this.online.emit(id)
    })
  }

  sendMessage(id: string, message: Message) {       //отправка сообщения
    this.socket.emit('new message', {id, message})
  }

  disconnectSocket(id: string) {      //выхождение из чата (ngOnDestroy)
    this.socket.emit('leave room', id)
  }

  setupSocketConnectionGroup(id, group) {       //вхождение в чат (ngOnInit) group
    this.socket.emit('in-group', {group, id})

    this.socket.on('new-group-message', (message) => {
      this.newGroupMessage.emit(message)
    })

    this.socket.on('online', (id) => {
      this.online.emit(id)
    })
  }

  sendMessageGroup(group: string, message: GroupMessage) {       //отправка сообщения group
    this.socket.emit('new-group-message', {group, message})
  }

  disconnectSocketGroup(group: string) {      //выхождение из чата (ngOnDestroy) group
    this.socket.emit('leave group room', group)
  }

  sendVideoRoomMessage(message) {
    this.socket.emit("videoroom-message", message);
  }

  leaveVideoRoom() {
    this.socket.emit("leave-video-room");
  }
}
