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
  wantToConnect: EventEmitter<string> = new EventEmitter()
  isMeActive: EventEmitter<boolean> = new EventEmitter()
  socket = io(environment.SOCKET_ENDPOINT, {transports: ["polling"]})
  peer
  session
  id
  socketID

  constructor() {
  }

  startStreamInVideoroom(stream, roomId, session) {
    if (!this.socketID) this.socketID = this.socket.id

    this.peer = new Peer(this.id, {
      path: "/peer",
      host: environment.host,
      port: environment.port,
      debug: 3,
      secure: environment.production
    })
    console.log(this.socket)
    console.log(this.socketID)
    console.log(this.peer)
    this.isMeActive.emit(this.socket.connected && !this.peer.disconnected && this.socket.id == this.socketID)
    this.session = session

    this.peer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        this.newVideoStream.emit({userVideoStream, user: {id: call.peer}})
      });
    });

    this.socket.on('pong', () => {
      this.isMeActive.emit(this.socket.connected && !this.peer.disconnected && this.socket.id == this.socketID)
    });

    this.peer.on('error', () => {
      this.isMeActive.emit(false)
    });

    this.socket.on('error', () => {
      this.isMeActive.emit(false)
    });

    this.socket.on("disconnected", () => {
      console.log('disconnected')
      this.isMeActive.emit(this.socket.connected && !this.peer.disconnected)
    });

    this.socket.on("user-connected", (user) => {
      const call = this.peer.call(user.id, stream);
      call.on("stream", (userVideoStream) => {
        this.newVideoStream.emit({userVideoStream, user})
      });
    });

    this.peer.on("open", (id) => {
      console.log("open", id)
      this.id = id
      this.videoID.emit(id)
      this.session = {...session, id}
      this.socket.emit("join-video-room", roomId, this.session);
    });

    this.socket.on("user-disconnected", (user) => {
      this.leaveRoomID.emit(user)
    });

    this.socket.on("isActive", (data) => {
      if (data.user.id == this.id) this.isMeActive.emit(data.isActive)
    });

    this.socket.on("twice-connect", (userID) => {
      this.wantToConnect.emit(userID)
    });

    this.socket.on("videoroom-message", (message) => {
      this.newVideoRoomMessage.emit(message)
    });
  }

  changeActive(data) {
    this.socket.emit("isActive", data)
  }

  exitRoom() {
    this.id = undefined
  }
  
  setupSocketConnection(id, interlocutor) {       //вхождение в чат (ngOnInit)
    console.log(this.socket)
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

  sendVideoRoomMessage(message, user) {
    this.socket.emit("videoroom-message", {...message, user});
  }

  leaveVideoRoom(user) {
    this.socket.emit("leave-video-room", user);
  }

  twiceConnect(userId) {
    this.socket.emit("twice-connect", userId);
  }

}