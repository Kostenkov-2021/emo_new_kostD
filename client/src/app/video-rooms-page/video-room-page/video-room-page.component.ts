import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  session: User | VideoUser
  sesSub: Subscription
  rSub: Subscription
  anonimName: string
  myVideoStream: any
  showChatToggle = false
  host = environment.url
  copySuccess = false
  wantCopyLink = false
  chat_message = ''
  messages: VideoRoomMessage[] = []
  authID: string = ''
  streamSub: Subscription
  messSub: Subscription
  idSub: Subscription
  leaveSub: Subscription
  wcSub: Subscription
  messages$: Subscription
  limit = STEP
  offset = 0
  loading = false
  noMore = false
  interval

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
        console.log('streamSub')
        this.addVideo(data)
      })
      this.idSub = this.socketioService.videoID.subscribe(id => {
        this.session.id = id
        var t = setInterval(() => check(), 100)
        function check() {
          const myVideo = document.getElementById('my')
          if (myVideo) {
            myVideo.removeAttribute("id")
            myVideo.setAttribute("id",`${id}`)
            clearInterval(t)
          }
        }
        
      })
      this.leaveSub = this.socketioService.leaveRoomID.subscribe(id => {
        const video = document.getElementById(id)
        if (video) video.remove()
      })
      this.messSub = this.socketioService.newVideoRoomMessage.subscribe((message: VideoRoomMessage) => {
        if (message.room == this.room._id && !this.messages.find(el => el._id == message._id)) {
          this.messages.push(message)
          this.scrollChat()
        }
      })
    }

  ngOnInit(): void {
    this.host
    this.route.params.subscribe((param: any) => {
      this.rSub = this.videoroomService.getById(param.id).subscribe(room => {
        this.room = room
        if (this.room.active == 0) {
          this.status = -1
        } else {
          this.fetchMessages()
          window.addEventListener('unload', event => {
            this.leaveRoom()
          });
          if (this.auth.isAuthenticated()) {
            this.auth.getUser().subscribe(session => {
              this.session = session
              this.authID = this.session._id
              this.status = 2
              this.startStream()
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
    this.socketioService.leaveVideoRoom()
  }

  createUser() {
    this.session = {name: this.anonimName ? this.anonimName : 'Аноним'}
    this.status = 2
    this.startStream()
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
    const find = document.getElementById(`${data.userId}`) //`${data.userId}`
    if (!find) {
      const video = document.createElement("video");
      video.setAttribute("id", `${data.userId}`)
      video.classList.add('room_video')
      this.addVideoStream(video, data.userVideoStream);
    }
  }

  active() {
    this.socketioService.active()
  }
  startStream() {
    const myVideo = document.createElement("video")
    myVideo.classList.add('room_video')
    myVideo.setAttribute("id", `my`)
    myVideo.muted = true;
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        this.myVideoStream = stream;
        this.addVideoStream(myVideo, this.myVideoStream);
        this.socketioService.startStreamInVideoroom(this.myVideoStream, this.room._id)
        // this.interval = setInterval(() => this.active(), 5000)
    });
  }

  addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
       video.play();
       this.videoGrid.nativeElement.append(video);
    });
  };

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
      this.videoroomService.sendMessage(this.room._id, {message: this.chat_message, type: 2, senderName: this.session.name, sender: this.authID}).subscribe(message => {
        this.chat_message = ''
        this.socketioService.sendVideoRoomMessage(message)
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
      // if (this.interval) clearInterval(this.interval)
      this.leaveRoom()
  }
}
