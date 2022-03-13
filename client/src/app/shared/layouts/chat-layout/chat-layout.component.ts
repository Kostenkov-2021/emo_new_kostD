import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ComponentFactoryResolver} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { User, Message, Messages } from '../../interfaces';
import { ChatService } from '../../services/chat.service';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { SocketioService } from '../../services/socketio.service';
import { AnswersComponent } from '../../components/answers/answers.component';
import { RefDirective } from '../../directive/ref.directive';

const STEP = 5

@Component({
  selector: 'app-chat-layout',
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.css']
})
export class ChatLayoutComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(RefDirective) refDir: RefDirective

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false

  oSub: Subscription
  socMesSub: any
  socOnlSub: any
  session: User
  user$: Observable<User>
  messages$: Subscription
  id: string
  textarea = ''
  zoom = false
  image = ''
  deleteMessage = false
  deleteID: Message
  letters: Message[] = []
  mesloading = false
  withAnswers = []
  text_bottom: string

  constructor(private loginService: LoginService,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private navService: NavService,
    private socketService: SocketioService,
    private router: Router,
    private resolver: ComponentFactoryResolver) {
      this.socMesSub = this.socketService.newMessage.subscribe(message => {
        if (message.sender == this.id && message.recipient == this.session._id && !this.letters.includes(message)) {
          this.letters.push(message)
          this.offset += 1
          for (const src of message.message) {
            this.chatService.getAnswers(src).subscribe(answers => {
              
              if (answers.answers.length !== 0 && !this.withAnswers.includes(src)) this.withAnswers.push(src)
            },
            error => {
              console.log(error.error.message)
            })
          }
          setTimeout(scroll, 200)
          function scroll() {
            document.getElementById('forScroll').scrollIntoView(false)
          } 
        }
      })
      this.socOnlSub = this.socketService.online.subscribe(online => {
        if (online == this.session._id && this.session._id != this.id) {
          for (let message of this.letters) {
            message.read = true
          }
        }
      })
    }

  ngOnInit(): void {
    this.reloading = true
    this.mesloading = true

    this.route.firstChild.params.subscribe((params: Params) => {
      this.id = params.id
      this.user$ = this.chatService.getInterlocutor(this.id)
      this.fetch()
    }) 

    this.oSub = this.loginService.getUser().subscribe(user =>{
      this.session = user
      this.socketService.setupSocketConnection(user._id, this.id)
      this.reloading = false
    }) 
  }

  ngAfterViewInit() {
    let TimerId = setInterval(scroll, 500)

    function scroll() {
      if (document.getElementById('forScroll')) {
        clearTimeout(TimerId)
        let separator = document.getElementById('separator') 
        if (separator) separator.scrollIntoView(true)
        else document.getElementById('forScroll').scrollIntoView(false)
      }
    }
  }

  fetch() {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.messages$ = this.chatService.getMessages2(this.id, params).subscribe(letters => {
      for (const letter of letters) {
        for (const src of letter.message) {
          this.chatService.getAnswers(src).subscribe(answers => {
            if (answers.answers.length !== 0 && !this.withAnswers.includes(src)) this.withAnswers.push(src)
          },
          error => {
            console.log(error.error.message)
          })
        }
      }
      this.letters = letters.concat(this.letters)
      this.noMore = letters.length < this.limit
      if (!this.noMore) this.loadMore()
      this.mesloading = false
      this.loading = false
    })
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetch()
  }

  newText() {
    if (this.textarea.trim()) {
      this.navService.sendTextMessage(this.textarea, 2)
      this.textarea = ''
    }
  }

  newMessageFromMe(message) {
    this.letters.push(message)
    this.offset += 1

    setTimeout(scroll, 500)
    function scroll() {
      document.getElementById('forScroll').scrollIntoView(false)
    }    
  }

  clearChat(clear) {
    if (clear) {
      this.letters = []
    }
  }

  openZoom(src, text_bottom?) {
    this.image = src
    this.text_bottom = text_bottom
    this.zoom = true
  }

  closeZoom(result) {
    if (result) this.zoom = false
    this.text_bottom = null
  }

  screenRead(text) {
    let urls = this.chatService.readLongText(text)
    playUrls(0)
    function playUrls(i) {
      let audio = new Audio(urls[i].url)
      audio.play()
      audio.addEventListener("ended", function () {if (i < urls.length -1) playUrls(i+1)}) 
    }
  }

  getDateString(date) {
    return this.chatService.timeString(date)
  }

  openDeleteMessage(data) {
    this.deleteID = data
    this.deleteMessage = true
  }

  closeDeleteMessage(result) {
    if (result) {
      this.chatService.deleteOneMessage(this.deleteID._id).subscribe(message => {
        document.getElementById(this.deleteID._id).remove()
      })
    }
    this.deleteMessage = false
  }

  openAnswers (ans) {
    const modalFactory = this.resolver.resolveComponentFactory(AnswersComponent)

    this.refDir.containerRef.clear()
    const component = this.refDir.containerRef.createComponent(modalFactory)

    component.instance.src = ans
    component.instance.session = this.session

    component.instance.close.subscribe(close => {
      if (close) this.refDir.containerRef.clear()
    })
    component.instance.meta.subscribe(meta => {
      this.checkAnswer(meta)
      this.refDir.containerRef.clear()
    })
  }

  checkAnswer(meta) {
    if (meta[1]) {
      this.route.queryParams.subscribe((queryParam: any) => {
        let queryC = queryParam.color
        this.router.navigate([], {queryParams: {'folder': meta[0], 'color': queryC}})
        location.href=location.href
      })
    }
    else {
      this.navService.sendTextMessage(meta[0], meta[2])
    }
  }

  ngOnDestroy() {
    this.socketService.disconnectSocket(this.session._id)
    this.oSub.unsubscribe()
    this.messages$.unsubscribe()
    this.socMesSub.unsubscribe()
    this.socOnlSub.unsubscribe()
  }

}
