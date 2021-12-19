import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { BotButton, Event, User } from '../shared/interfaces';
import { BotService } from '../shared/services/bot.service';
import { EventsService } from '../shared/services/events.service';

const STEP = 5

@Component({
  selector: 'app-public-photolikes-page',
  templateUrl: './public-photolikes-page.component.html',
  styleUrls: ['./public-photolikes-page.component.css']
})
export class PublicPhotolikesPageComponent implements OnInit {

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false

  buttons$: Observable<BotButton[]>
  events: Event[] = []
  events$: Subscription
  zoom = false
  image = ''
  openlikes = false
  likes: User[]

  constructor(private eventsService: EventsService,
    private botService: BotService) { }

  ngOnInit(): void {
    this.reloading = true

    this.buttons$ = this.botService.fetch() 

    this.fetch()
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

}
