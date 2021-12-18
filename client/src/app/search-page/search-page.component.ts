import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { User, Institution } from '../shared/interfaces';
import { LoginService } from '../shared/services/login.service';
import { PeopleService } from '../shared/services/people.service';
import { ChatService } from '../shared/services/chat.service';
import { DatePipe } from '@angular/common';

const STEP = 6

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
  providers:[DatePipe]
})
export class SearchPageComponent implements OnInit, OnDestroy {

  limit = STEP
  offset = 0
  obs$: Subscription
  session: User
  institutions$: Observable<Institution[]>
  users$: Subscription
  users: User[]
  reloading = false
  loading = false
  institution: string
  today = new Date()
  noMore = false
  filter: any = {}
  online = false
  birthday = false

  constructor(private loginService: LoginService,
              private peopleService: PeopleService,
              public datePipe : DatePipe,
              private chatService: ChatService) { }

  ngOnInit(): void {
    this.reloading = true
    this.obs$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.filter = {institution: ''}
      this.institution = ''
      this.fetch(true)
    })
    this.institutions$ = this.peopleService.getInstitutions()
  }

  fetch(isNew = false) {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.users$ = this.peopleService.fetchAll2({...this.filter, ...params}).subscribe(users => {
      for (let user of users) {
        if ((this.today.getTime() - new Date(user.last_active_at).getTime()) < 300000) {
          user.active = true
        }
        else {
          user.active = false
        }
        if (this.datePipe.transform(user.birthDate, "dd,MM") == this.datePipe.transform(this.today, "dd,MM")) {
          user.bd = true
        }
        else {
          user.bd = false
        }
      }
      if (isNew) this.users = users
      else this.users = this.users.concat(users)
      this.reloading = false
      this.loading = false
      this.noMore = users.length < this.limit
      if (!this.noMore) this.loadMore()
    })
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetch(false)
  }

  ngOnDestroy() {
    this.obs$.unsubscribe()
    this.users$.unsubscribe()
  }

  goToChat(id: string, color: string, folder?: string) {
    this.chatService.goToChat(id, color, folder)
  }

  changeBirthday() {
    this.birthday = !this.birthday
    this.filter.birthday = this.birthday
    this.offset = 0
    this.users = []
    this.loading = true
    this.fetch(true)
  }

  changeOnline() {
    this.online = !this.online
  }

  newInstitution() {
    this.filter.institution = this.institution
    this.offset = 0
    this.users = []
    this.loading = true
    this.fetch(true)
  }
}
