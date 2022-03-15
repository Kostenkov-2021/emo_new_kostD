import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.css']
})
export class LoginLayoutComponent implements OnInit {

  links = [
    {url: '/login', name: 'Вход'},
    {url: '/registration', name: 'Регистрация'},
    {url: '/events', name: 'Мероприятия'},
    {url: '/photolikes', name: 'Фотолайки'}
  ]

  ngOnInit(): void {
  }

}
