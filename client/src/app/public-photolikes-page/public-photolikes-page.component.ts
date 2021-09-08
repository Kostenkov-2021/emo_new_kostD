import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { BotButton, Event, User } from '../shared/interfaces';
import { BotService } from '../shared/services/bot.service';
import { EventsService } from '../shared/services/events.service';

@Component({
  selector: 'app-public-photolikes-page',
  templateUrl: './public-photolikes-page.component.html',
  styleUrls: ['./public-photolikes-page.component.css']
})
export class PublicPhotolikesPageComponent implements OnInit {

  buttons$: Observable<BotButton[]>
  events: Event[]
  events$: Subscription
  reloading = false
  zoom = false
  image = ''
  openlikes = false
  likes: User[]

  constructor(private eventsService: EventsService,
    private botService: BotService) { }

  ngOnInit(): void {
    this.reloading = true

    this.events$ = this.eventsService.fetchForPhotolikes().subscribe(events => {
      this.events = events
      this.reloading = false
    })

    this.buttons$ = this.botService.fetch() 
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
