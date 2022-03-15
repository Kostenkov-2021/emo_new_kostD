import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '../shared/services/login.service';
import { Subscription, Observable } from 'rxjs';
import { User, Institution, Filter, Event } from '../shared/interfaces';
import { UsersService } from '../shared/services/users.service';
import { EventsService } from '../shared/services/events.service';
import { Router } from '@angular/router';
import { PeopleService } from '../shared/services/people.service';

const STEP = 10

@Component({
  selector: 'app-admin-events-page',
  templateUrl: './admin-events-page.component.html',
  styleUrls: ['./admin-events-page.component.css']
})

export class AdminEventsPageComponent implements OnInit, OnDestroy {

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false
  oSub: Subscription
  session$: Subscription
  session: User
  institutions$: Observable<Institution[]>
  filter: Filter = {}
  events: Event[] = []
  institution: string = ''
  filter_status: string = ''

  constructor(private loginService: LoginService,
              private peopleService: PeopleService,
              private eventsService: EventsService,
              private router: Router) { }

  ngOnInit(): void {
    this.reloading = true

    this.session$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.session.levelStatus === 2 ? this.institution = this.session.institution : this.institution = ''
    })

    this.institutions$ = this.peopleService.getInstitutions()

    this.fetch()
  }

  private fetch() {
    const params = Object.assign({}, this.filter, {
      offset: this.offset,
      limit: this.limit
    })

    this.oSub = this.eventsService.fetchForModerators(params).subscribe(events => {
      this.events = this.events.concat(events)
      this.noMore = events.length < STEP
      this.loading = false
      this.reloading = false
    })
  }

  loadMore() {
    this.offset += STEP
    this.loading = true
    this.fetch()
  }

  onFilter() {
    this.events = []
    this.offset = 0
    this.filter.institution = this.institution
    this.filter.status = this.filter_status
    this.reloading = true
    this.fetch()
  }

  deleteEvent(id, authorName) {
    const decision = window.confirm(`Вы уверены, что хотите удалить мероприятие? Автор: ${authorName}`)

    if (decision) {
      this.eventsService.deleteById(id)
        .subscribe(
          response => {
            let box = document.getElementById(id)
            box.remove()
          },
          error => {alert(error.error.message)}
        )
    }
  }

  ngOnDestroy() {
    this.session$.unsubscribe()
  }

}
