import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, Event } from '../../interfaces';
import { LoginService } from '../../services/login.service';
import { EventsService } from '../../services/events.service';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

const STEP = 5

@Component({
  selector: 'app-bot-layout',
  templateUrl: './bot-layout.component.html',
  styleUrls: ['./bot-layout.component.css']
})
export class BotLayoutComponent implements OnInit, OnDestroy {

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false
  oSub: Subscription
  session: User
  user$: Observable<User>
  events$: Subscription
  events: Event[] = []
  messages$: Subscription
  id: string
  textarea = ''
  zoom = false
  mesloading = false
  image = ''
  mystatus = 'wait'
  deletingEvent = false
  eventWantDelete: Event

  constructor(private loginService: LoginService, 
              private eventsService: EventsService,
              private chatService: ChatService,
              private router: Router) { }

  ngOnInit(): void {
    this.reloading = true
    this.oSub = this.loginService.getUser().subscribe(user =>{
      this.session = user
      this.reloading = false
      this.fetch()
    })
  }

  fetch() {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit,
      mystatus: this.mystatus
    })

    this.events$ = this.eventsService.fetchForBot(params).subscribe(events => {
      this.events = events.concat(this.events)
      this.noMore = events.length < this.limit
      if (!this.noMore) this.loadMore()
      this.loading = false
      this.scroll()
    })
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetch()
  }

  changeMyStatus() {
    this.offset = 0
    this.events = []
    this.loading = true
    this.fetch()
  }

  scroll() {
    let TimerId = setInterval(scroll, 200)

    function scroll() {
      if (document.getElementById('forScroll')) {
        clearTimeout(TimerId)
        document.getElementById('forScroll').scrollIntoView(false)
      }
    }
  }

  newEventFromMe(message) {
    this.events.push(message)
    setTimeout(scroll, 500)
    function scroll() {
      document.getElementById('forScroll').scrollIntoView(false)
    }    
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

  openDeleteEvent(event) {
    this.eventWantDelete = event
    this.deletingEvent = true
  }

  openZoom(src) {
    this.image = src
    this.zoom = true
  }

  closeZoom(result) {
    if (result) this.zoom = false
  }

  fromDeleteEvent(result) {
    if (result) {
      this.eventsService.deleteById(this.eventWantDelete._id).subscribe(message => {
        if (message) {
          this.events = this.events.filter(event => event._id !== this.eventWantDelete._id)
          this.eventWantDelete = null
        }
      })
    }
    this.deletingEvent = false
  }

  newMessageFromMe(event) {
    this.events.push(event)   
  }

  newStatus(id, status) {
    this.eventsService.changeUserStatus(id, status).subscribe(new_event => {
      for (let event of this.events) {
        if (event._id == new_event._id) {
          event.wait = new_event.wait
          event.hide = new_event.hide
          event.participants = new_event.participants
        }
      }
    })
  }

  toGroup(id) {
    this.router.navigate([`/group/${id}`], {queryParams: {color: this.session.defaultColor, folder: '5f12ff8cc06cd105437d84e3'}})
  }

  ngOnDestroy() {
    this.oSub.unsubscribe()
    this.events$.unsubscribe()
  }

}
