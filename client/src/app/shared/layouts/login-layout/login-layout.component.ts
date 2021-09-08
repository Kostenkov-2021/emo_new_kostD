import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.css']
})
export class LoginLayoutComponent implements OnInit {

  links = [
    {url: '/login', name: 'Вход'},
    {url: '/events', name: 'Мероприятия'},
    {url: '/photolikes', name: 'Фотолайки'}
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
