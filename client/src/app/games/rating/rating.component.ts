import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/shared/services/chat.service';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit, OnDestroy {

  session: User
  reloading = false
  obs$: Subscription
  rSub$: Subscription
  users: User[]
  myPlace: Number
  zoom = false
  image = ''

  constructor(private loginService: LoginService, 
    private usersService: UsersService, 
    private router: Router,
    private chatService: ChatService) { }

  ngOnInit(): void {
    this.reloading = true
    this.obs$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.rSub$ = this.usersService.getRating().subscribe(users => {
        this.users = users
        this.myPlace = users.indexOf(users.find(el => el._id === this.session._id)) + 1
        this.reloading = false
      })
    })     
  }

  cross() {
    this.router.navigate(['/people/games'])
  }

  openZoom(src) {
    this.image = src
    this.zoom = true
  }

  closeZoom(result) {
    if (result) this.zoom = false
  }

  goToChat(id: string, color: string) {
    this.chatService.goToChat(id, color)
  }

  ngOnDestroy() {
    this.rSub$.unsubscribe()
    this.obs$.unsubscribe()
  }

}
