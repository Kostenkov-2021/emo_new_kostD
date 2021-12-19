import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BotButton, Event } from '../shared/interfaces';
import { BotService } from '../shared/services/bot.service';
import { EventsService } from '../shared/services/events.service';

const STEP = 5

@Component({
  selector: 'app-public-events-page',
  templateUrl: './public-events-page.component.html',
  styleUrls: ['./public-events-page.component.css']
})
export class PublicEventsPageComponent implements OnInit {

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

    this.events$ = this.eventsService.getPublicEvents(params).subscribe(events => {
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

  openZoom(src) {
    this.image = src
    this.zoom = true
  }

  closeZoom(result) {
    if (result) this.zoom = false
  }

}
