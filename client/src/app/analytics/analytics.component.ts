import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Institution, User, Filter } from '../shared/interfaces';
import { LoginService } from '../shared/services/login.service';
import { PeopleService } from '../shared/services/people.service';
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
  allSub: Subscription
  gSub: Subscription
  session$: Subscription
  session: User
  institutions$: Observable<Institution[]>
  institution: string
  users: User[] = []
  games: any[] = []
  all: any
  info: string = ''
  show_info = false

  usersAnalytics = false
  gamesAnalytics = false

  constructor(private loginService: LoginService,
              private peopleService: PeopleService,
              private usersService: UsersService,
              private router: Router) { }

  ngOnInit(): void {
    this.reloading = true

    this.session$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.institution = this.session.institution 
      this.allSub = this.usersService.getAnalyticsCounters().subscribe(all => {
        this.all = all
        this.reloading = false
      })
    })
    this.institutions$ = this.peopleService.getInstitutions()
  }

  startUsers() {
    if (this.gSub) this.gSub.unsubscribe()
    this.gamesAnalytics = false
    this.usersAnalytics = true
    this.users = []
    this.offset = 0
    this.fetchUsers(true)
  }

  startGames() {
    if (this.oSub) this.oSub.unsubscribe()
    this.gamesAnalytics = true
    this.usersAnalytics = false
    this.games = []
    this.offset = 0
    this.fetchGames(true)
  }

  fetchUsers(isNew = false) {
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
      if (!this.noMore) this.loadMoreUsers()
    })
  }

  loadMoreUsers() {
    this.offset += STEP
    this.loading = true
    this.fetchUsers(false)
  }

  fetchGames(isNew = false) {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.gSub = this.usersService.getGamesAnalytics(params).subscribe(games => {
      if (isNew) this.games = games
      else this.games = this.games.concat(games)
      this.noMore = games.length < this.limit
      this.loading = false
      this.reloading = false
      if (!this.noMore) this.loadMoreGames()
    })
  }

  loadMoreGames() {
    this.offset += STEP
    this.loading = true
    this.fetchGames(false)
  }

  toggleInfo(event, arr) {
    const wind: any = document.querySelector('.info_window')
    if (this.show_info) this.show_info = false
    else {
      this.info = ''
      for (let text of arr) this.info += (text + ' ')
      wind.style.top = `${event.layerY}px`
      wind.style.left = `${event.layerX}px`
      this.show_info = true
    }
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
      case 6:
        return 'Запрос'
      default:
        return 'Неизвестно'
    }
  }

  getGameName(code) {
    switch (code) {
      case 1:
        return 'Письмо'
      case 2:
        return 'Тир'
      case 3:
        return 'Примеры'
      case 4:
        return 'Мячик'
      default:
        return 'Неизвестно'
    }
  }

  ngOnDestroy(): void {
    this.allSub.unsubscribe()
    if (this.gSub) this.gSub.unsubscribe()
    if (this.oSub) this.oSub.unsubscribe()
    this.session$.unsubscribe()
  }
}
