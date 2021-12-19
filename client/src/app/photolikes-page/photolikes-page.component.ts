import { Component, OnInit} from '@angular/core';
import { EventsService } from '../shared/services/events.service';
import { User, Event, BotButton } from '../shared/interfaces';
import { LoginService } from '../shared/services/login.service';
import { Subscription, Observable } from 'rxjs';
import { BotService } from '../shared/services/bot.service';
import { ChatService } from '../shared/services/chat.service';

const STEP = 5

@Component({
  selector: 'app-photolikes-page',
  templateUrl: './photolikes-page.component.html',
  styleUrls: ['./photolikes-page.component.css']
})
export class PhotolikesPageComponent implements OnInit {

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false
  session: User
  obs$: Subscription
  events: Event[] = []
  events$: Subscription
  buttons$: Observable<BotButton[]>
  zoom = false
  image = ''
  openlikes = false
  likes: User[]

  constructor(private loginService: LoginService,
    private eventsService: EventsService,
    private chatService: ChatService,
    private botService: BotService) { }

  ngOnInit(): void {
    this.reloading = true
    this.obs$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.fetch()
    })
    this.buttons$ = this.botService.fetch() 
  }

  fetch() {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.events$ = this.eventsService.fetchForPhotolikes(params).subscribe(events => {
      this.events = this.events.concat(events)
      this.noMore = events.length < this.limit
      if (!this.noMore) this.loadMore()
      this.reloading = false
      this.loading = false
    })
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetch()
  }

  openLikes(id) {
    this.eventsService.getLikes(id).subscribe(users => {
      this.likes = users
      this.openlikes = true
    }) 
  }

  screenRead(sex, name, surname, title, description) {
    let str = 'Пригласил'
    if (sex == 2) str += 'а'
    str += ` ${name}`
    if (this.session.surnameView) str += ` ${surname}`
    str += '. '
    if (title) str += (title + '. ')
    if (description) str += description
    let urls = this.chatService.readLongText(str)
    playUrls(0)
    function playUrls(i) {
      let audio = new Audio(urls[i].url)
      audio.play()
      audio.addEventListener("ended", function () {if (i < urls.length -1) playUrls(i+1)}) 
    }
  }

  closeLikes(result) {
    if (result) this.openlikes = false
  }

  openZoom(src) {
    this.image = src
    this.zoom = true
  }

  closeZoom(result) {
    if (result) this.zoom = false
  }

  deleteLike(id) {
    this.eventsService.deleteLike(id).subscribe(event => {
      this.changeArr(id, -1)
    })
  }

  pushLike(id) {
    this.eventsService.pushLike(id).subscribe(event => {
      this.changeArr(id, 1)
    })
  }

  changeArr = (id, like) => {
    let item = this.events.find(x => x._id === id)
    if (like == 1) item.likes.push(this.session._id)
    if (like == -1) {
      let index = item.likes.indexOf(this.session._id)
      item.likes.splice(index, 1)
    }
  }

}
