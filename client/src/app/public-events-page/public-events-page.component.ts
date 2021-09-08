import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BotButton, Event } from '../shared/interfaces';
import { BotService } from '../shared/services/bot.service';
import { EventsService } from '../shared/services/events.service';

@Component({
  selector: 'app-public-events-page',
  templateUrl: './public-events-page.component.html',
  styleUrls: ['./public-events-page.component.css']
})
export class PublicEventsPageComponent implements OnInit {

  buttons$: Observable<BotButton[]>
  events: Event[]
  events$: Subscription
  reloading = false

  constructor(private eventsService: EventsService,
    private botService: BotService) { }

  ngOnInit(): void {
    this.reloading = true

    this.events$ = this.eventsService.getPublicEvents().subscribe(events => {
      this.events = events
      this.reloading = false
    })

    this.buttons$ = this.botService.fetch() 
  }

}
