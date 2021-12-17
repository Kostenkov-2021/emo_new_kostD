import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Institution, User, Filter } from '../shared/interfaces';
import { LoginService } from '../shared/services/login.service';
import { UsersService } from '../shared/services/users.service';

const STEP = 3

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false
  oSub: Subscription
  session$: Subscription
  session: User
  institutions$: Observable<Institution[]>
  institution: string
  users: User[] = []

  constructor(private loginService: LoginService,
              private usersService: UsersService,
              private router: Router) { }

  ngOnInit(): void {
    this.reloading = true

    this.session$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.institution = this.session.institution 
      this.fetch(true)
    })

    this.institutions$ = this.usersService.getInstitutions()
  }

  newInstitution() {
    this.offset = 0
    this.users = []
    this.loading = true
    this.fetch(true)
  }

  fetch(isNew = false) {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.oSub = this.usersService.getAnalytics(this.institution, params).subscribe(users => {
      if (isNew) this.users = users
      else this.users = this.users.concat(users)
      this.noMore = users.length < this.limit
      this.loading = false
      this.reloading = false
      if (!this.noMore) this.loadMore()
    })
  }

  loadMore() {
    this.offset += STEP
    this.loading = true
    this.fetch(false)
  }

  countAge(bd) {
    if (!bd) return '—'
    let now = new Date(); //Текущя дата
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //Текущя дата без времени
    let dob = new Date(bd); //Дата рождения
    let dobnow = new Date(today.getFullYear(), dob.getMonth(), dob.getDate()); //ДР в текущем году
    let age; //Возраст
    
    //Возраст = текущий год - год рождения
    age = today.getFullYear() - dob.getFullYear();
    //Если ДР в этом году ещё предстоит, то вычитаем из age один год
    if (today < dobnow) {
      age = age - 1;
    }
    return age;
  }

  getRole(code) {
    switch (code) {
      case 1:
        return 'Администратор'
      case 2:
        return 'Модератор'
      case 3:
        return 'Подопечный'
      case 4:
        return 'Гость'
      case 5:
        return 'Взрослый'
    }
  }

  ngOnDestroy(): void {
    this.oSub.unsubscribe()
    this.session$.unsubscribe()
  }
}
