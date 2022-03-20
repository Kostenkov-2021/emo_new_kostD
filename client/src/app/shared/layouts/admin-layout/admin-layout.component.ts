import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { NavService } from '../../services/nav.service';
import { Router} from '@angular/router';
import {Subscription } from 'rxjs';
import { User } from '../../interfaces';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {

  oSub: Subscription
  logSub: Subscription

  links = [
    {url: '/manage/users', name: 'Пользователи'},
    {url: '/manage/institutions', name: 'Организации'},
    {url: '/manage/pictures', name: 'Библиотека'},
    {url: '/manage/events', name: 'Мероприятия'},
    {url: '/manage/analytics', name: 'Аналитика'}
  ]
  session: User
  reloading: boolean = false

  constructor(
    private auth: LoginService,
    private router: Router,
    private navService: NavService) {
      this.navService.newSettings.subscribe(user => this.session = user)
    }

  ngOnInit(): void {
    this.reloading = true
    this.oSub = this.auth.getUser().subscribe(user => {
      this.session = user
      this.reloading = false
    })
  }

  logout(event: Event) {
    this.logSub = this.auth.exit().subscribe()
    this.logSub.unsubscribe()
    event.preventDefault()
    this.auth.logout()
    this.router.navigate(['/login'])
  }
}
