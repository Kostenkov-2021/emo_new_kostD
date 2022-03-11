import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { User, VideoRoom, VideoRoomMessage, VideoUser } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { SocketioService } from 'src/app/shared/services/socketio.service';
import { VideoRoomService } from 'src/app/shared/services/videorooms.service';
import { environment } from 'src/environments/environment';

const STEP = 5

@Component({
  selector: 'app-video-room-page',
  templateUrl: './video-room-page.component.html',
  styleUrls: ['./video-room-page.component.css']
})

export class VideoRoomPageComponent implements OnInit, OnDestroy {

  status = 0
  room: VideoRoom
  session: User | VideoUser | any
  sesSub: Subscription
  rSub: Subscription
  anonimName: string
  myVideoStream: any
  showChatToggle = false
  host = environment.url
  copySuccess = false
  wantCopyLink = false
  chat_message = ''
  messages: VideoRoomMessage[] | any = []
  streamSub: Subscription
  messSub: Subscription
  idSub: Subscription
  leaveSub: Subscription
  wcSub: Subscription
  tcon: Subscription
  messages$: Subscription
  limit = STEP
  offset = 0
  loading = false
  noMore = false
  interval
  isMeActive: boolean
  activeSub: Subscription

  @ViewChild('video_grid') videoGrid: ElementRef<HTMLDivElement>
  @ViewChild('stopVideo') stopVideo: ElementRef<HTMLDivElement>
  @ViewChild('muteButton') muteButton: ElementRef<HTMLDivElement>
  @ViewChild('showChat') showChat: ElementRef<HTMLDivElement>

  constructor(private socketioService: SocketioService, 
    private videoroomService: VideoRoomService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: LoginService) { 
      this.streamSub = this.socketioService.newVideoStream.subscribe(data => {
        this.addVideo(data)
      })
      this.activeSub = this.socketioService.isMeActive.subscribe(active => {
        this.isMeActive = active
      })
      this.idSub = this.socketioService.videoID.subscribe(id => {
        this.session.id = id
      })
      this.leaveSub = this.socketioService.leaveRoomID.subscribe(user => {
        try {
          if (user.id && this.session.id == user.id
          || (user._id && this.session._id == user._id)
          || (user.anonimus_id && this.session.anonimus_id == user.anonimus_id)) {
          this.exit()
        } else {
          const children: any = this.videoGrid.nativeElement.childNodes
          let len = children.length
          for (let i = len - 1; i >= 0; i--) {
            if (children[i].user && (
              (user.id && children[i].user.id == user.id) 
              || (user._id && children[i].user._id == user._id)
              || (user.anonimus_id && children[i].user.anonimus_id == user.anonimus_id)
            )) {
              this.videoGrid.nativeElement.children[i].remove()
            }
          }
        }
      } catch (e) {
        console.log(e)
      }
      })
      this.messSub = this.socketioService.newVideoRoomMessage.subscribe((message: VideoRoomMessage) => {
        if (message.room == this.room._id && !this.messages.find(el => el._id == message._id)) {
          this.messages.push(message)
          this.scrollChat()
        }
      })

      this.tcon = this.socketioService.wantToConnect.subscribe((userId) => {
        if (userId == this.session.id) {
          this.myVideoStream.getTracks().forEach(function(track) {
            track.stop();
          });
          console.log(userId, this.session.id)
          this.status = 3;
        }
      })
    }

  ngOnInit(): void {
    this.route.params.subscribe((param: any) => {
      this.rSub = this.videoroomService.getById(param.id).subscribe(room => {
        this.room = room
        if (this.room.active == 0) {
          this.status = -1
        } else {
          this.fetchMessages()
          window.addEventListener('beforeunload', e => {
            e.preventDefault(); //per the standard
            e.returnValue = ''; //required for Chrome
          });
          window.addEventListener('unload', event => {
            this.leaveRoom()
          });
          if (this.auth.isAuthenticated()) {
            this.auth.getUser().subscribe(session => {
              const fpPromise = FingerprintJS.load()
    
              fpPromise
                .then(fp => fp.get())
                .then(result => {
                  const visitorId = result.visitorId
                  this.session = session
                  this.session.anonimus_id = visitorId
                  this.status = 2
                  this.startStream()
                })
              
            }, error => this.status = 1)
          }
          else this.status = 1
        }
      }, error => this.status = -2)
    }) 
  }

  leaveRoom() {
    if (this.myVideoStream) {
      this.myVideoStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    this.socketioService.exitRoom()
    this.socketioService.leaveVideoRoom(this.session)
  }

  createUser() {
    if (!this.anonimName) this.anonimName  = 'Аноним'
    const fpPromise = FingerprintJS.load()
    
    fpPromise
      .then(fp => fp.get())
      .then(result => {
        const visitorId = result.visitorId
        this.session = {name: this.anonimName, anonimus_id: visitorId}
        this.status = 2
        this.startStream()
      })
  }

  fetchMessages() {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.messages$ = this.videoroomService.fetchMessages(this.room._id, params).subscribe(messages => {
      this.messages = messages.concat(this.messages)
      this.scrollChat()
      this.noMore = messages.length < this.limit
      if (!this.noMore) this.loadMore()
      this.loading = false
    })
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetchMessages()
  }

  scrollChat() {
    let TimerId = setInterval(scroll, 500)

    function scroll() {
      let bottom = document.getElementById('forScroll')
      if (bottom) {
        clearTimeout(TimerId)
        bottom.scrollIntoView(false)
      }
    }
  }

  exit() {
    this.router.navigate(['/people/videorooms'])
  }

  addVideo(data) {
    const children: any = this.videoGrid.nativeElement.childNodes
      let len = children.length
      for (let i = 0; i < len; i++) {
        if (children[i].user && (
        (data.user.id && children[i].user.id == data.user.id) 
        || (data.user._id && children[i].user._id == data.user._id)
        || (data.user.anonimus_id && children[i].user.anonimus_id == data.user.anonimus_id)
      )) {
          this.socketioService.leaveVideoRoom(data.user)
        } else {
          const video = document.createElement("video");
          video.classList.add('room_video', data.user.anonimus_id, data.user.id)
          this.addVideoStream(video, data.userVideoStream, data.user);
        }
      }
  }

  startStream() {
    const myVideo = document.createElement("video")
    myVideo.classList.add('room_video')
    myVideo.muted = true;
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        this.myVideoStream = stream;
        this.addVideoStream(myVideo, this.myVideoStream, this.session);
        this.socketioService.startStreamInVideoroom(this.myVideoStream, this.room._id, this.session)
    });
  }

  addVideoStream(video, stream, user) {
    video.srcObject = stream;
    video.user = user;
    video.addEventListener("loadedmetadata", () => {
      const children: any = this.videoGrid.nativeElement.childNodes
      let len = children.length
      let show = true
      for (let i = 0; i < len; i++) {
        if (children[i].user && (
        (user.id && children[i].user.id == user.id) 
        || (user._id && children[i].user._id == user._id)
        || (user.anonimus_id && children[i].user.anonimus_id == user.anonimus_id))) {
          show = false
        }
      }
      if (show) {
        video.play();
        this.videoGrid.nativeElement.append(video)
        stream.onactive = (user) => this.active(user)
        stream.oninactive = (user) => this.inactive(user)
      }
    });
  };

  active (user)  {
    console.log('active', user.id)
    this.socketioService.changeActive({user, isActive: true})
  }

  inactive (user) {
    console.log('inactive', user.id)
    this.socketioService.changeActive({user, isActive: false})
    const children: any = this.videoGrid.nativeElement.childNodes
    let len = children.length
      for (let i = 0; i < len; i++) {
        if (children[i].user && (
        (user.id && children[i].user.id == user.id) 
        || (user._id && children[i].user._id == user._id)
        || (user.anonimus_id && children[i].user.anonimus_id == user.anonimus_id))) {
          this.videoGrid.nativeElement.children[i].remove()
        }
      }
  }

  videoButton() {
    const enabled = this.myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      this.myVideoStream.getVideoTracks()[0].enabled = false;
      this.stopVideo.nativeElement.innerHTML = `<i class="fas fa-video-slash"></i>`
      this.stopVideo.nativeElement.classList.toggle("background__red");
    } else {
      this.myVideoStream.getVideoTracks()[0].enabled = true;
      this.stopVideo.nativeElement.innerHTML = `<i class="fas fa-video"></i>`
      this.stopVideo.nativeElement.classList.toggle("background__red");
    }
  }

  voteButton() {
    const enabled = this.myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      this.myVideoStream.getAudioTracks()[0].enabled = false;
      this.muteButton.nativeElement.innerHTML = `<i class="fas fa-microphone-slash"></i>`
      this.muteButton.nativeElement.classList.toggle("background__red");
    } else {
      this.myVideoStream.getAudioTracks()[0].enabled = true;
      this.muteButton.nativeElement.innerHTML = `<i class="fas fa-microphone"></i>`
      this.muteButton.nativeElement.classList.toggle("background__red");
    }
  }

  addButton() {
    this.wantCopyLink = true
  }

  copyLink() {
    navigator.clipboard.writeText(`${this.host}${this.router.url}`).then(() => this.copySuccess = true)
  }

  exitLink() {
    this.wantCopyLink = false
    this.copySuccess = false
  }

  chatButton() {
    this.showChatToggle = !this.showChatToggle
  }

  messageButton() {
    this.chat_message = this.chat_message.trim()
    if (this.chat_message) {
      this.videoroomService.sendMessage(this.room._id, {message: this.chat_message, type: 2, senderName: this.session.name, sender: this.session._id}).subscribe(message => {
        this.chat_message = ''
        this.socketioService.sendVideoRoomMessage(message, this.session)
      })
    }
  }

  ngOnDestroy(): void {
      if (this.sesSub) this.sesSub.unsubscribe()
      if (this.rSub) this.rSub.unsubscribe()
      if (this.messSub) this.messSub.unsubscribe()
      if (this.idSub) this.idSub.unsubscribe()
      if (this.streamSub) this.streamSub.unsubscribe()
      if (this.leaveSub) this.leaveSub.unsubscribe()
      if (this.messages$) this.messages$.unsubscribe()
      if (this.tcon) this.tcon.unsubscribe()
      if (this.activeSub) this.activeSub.unsubscribe()
      this.leaveRoom()
  }
}
