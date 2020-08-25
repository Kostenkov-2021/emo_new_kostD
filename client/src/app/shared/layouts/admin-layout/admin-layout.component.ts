import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { NavService } from '../../services/nav.service';
import { Router} from '@angular/router';
import {Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {

  oSub: Subscription

  links = [
    {url: '/manage/users', name: 'Пользователи'},
    {url: '/manage/institutions', name: 'Учреждения'},
    {url: '/manage/pictures', name: 'Пиктограммы'}
  ]
  color: string
  reloading: boolean = false

  constructor(
    private auth: LoginService,
    private router: Router,
    private navService: NavService) {
      this.navService.newColor.subscribe(color => this.color = color)
    }

  ngOnInit(): void {
    this.reloading = true
    this.oSub = this.auth.getUser().subscribe(user => {
      this.color = user.firstColor
      this.reloading = false
    })
  }

  logout(event: Event) {
    let oSub = this.auth.exit().subscribe()
    oSub.unsubscribe()
    event.preventDefault()
    this.auth.logout()
    this.router.navigate(['/login'])
  }


}