import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { User, BotButton, Institution, Event, Region } from '../shared/interfaces';
import { BotService } from '../shared/services/bot.service';
import { EventsService } from '../shared/services/events.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PeopleService } from '../shared/services/people.service';
import { RegionsService } from '../shared/services/region.service';

@Component({
  selector: 'app-emo-bot-page',
  templateUrl: './emo-bot-page.component.html',
  styleUrls: ['./emo-bot-page.component.css']
})
export class EmoBotPageComponent implements OnInit, OnDestroy {

  @Input() session: User
  @Output() newEvent = new EventEmitter<Event>()

  stage: number = 0
  myEventType: number
  myEventInstit: string[] = []
  buttons$: Observable<BotButton[]>
  iSub$: Subscription
  institutions: Institution[]
  rSub$: Subscription
  regions: Region[]
  description: string
  region: string = ''

  constructor(private botService: BotService, 
    private regionsService: RegionsService, 
    private router: Router,
    private peopleService: PeopleService,
    private eventsService: EventsService) { }

  ngOnInit(): void {
  }

  startEvent() {
    if (this.session.levelStatus == 6) return
    this.buttons$ = this.botService.fetch()
    this.stage = 1
  }

  makeEvent(type) {
    this.myEventType = type
    this.stage = 2
    this.fetchInstitution()
    this.rSub$ = this.regionsService.fetch({}).subscribe(regions => this.regions = regions)
  }

  fetchInstitution(id?) {
    let q: any = {}
    if (id) q.region = id
    this.iSub$ = this.peopleService.getInstitutions(q).subscribe(institutions => {
      this.institutions = institutions
      this.clearInst()
    })
  }

  checkUser(id) {
    if (this.myEventInstit.includes(id))  {
      let index = this.myEventInstit.indexOf(id, 0)
      this.myEventInstit.splice(index, 1)
    }
    else {
      this.myEventInstit.push(id)
    }
  }

  checkAll() {
    this.myEventInstit = []
    for (let instit of this.institutions) {
      this.myEventInstit.push(instit._id)
    }
  }

  clearInst() {
    for (let i = this.myEventInstit.length - 1; i >= 0; i--) {
      const instit = this.institutions.find(el => el._id == this.myEventInstit[i])
      if (!instit) this.myEventInstit.splice(i, 1)
    }
  }

  checkNobody() {
    this.myEventInstit = []
  }

  cross() {
    this.router.navigate(['/people/events'])
  }

  toDescription() {
    this.stage = 3
  }

  finish() {
    this.eventsService.create(this.myEventInstit, this.myEventType, this.description)
    .subscribe(event => {
      this.stage = 0
      this.myEventType = null
      this.myEventInstit = []
      this.newEvent.emit(event)
    },
    error => console.log(error.error.message)
    )
  }

  ngOnDestroy() {
    if (this.stage >= 2) this.iSub$.unsubscribe()
  }
}
