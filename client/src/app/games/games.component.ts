import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../shared/interfaces';
import { LoginService } from '../shared/services/login.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit, OnDestroy {

  session: User
  reloading = false
  obs$: Subscription

  constructor(private router: Router, private loginService: LoginService) { }

  ngOnInit(): void {
    this.reloading = true
    this.obs$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.reloading = false
    })     
  }

  goToGame(id) {
    this.router.navigate([`/game/${id}`])
  }

  goToRating() {
    this.router.navigate([`/rating`])
  }

  ngOnDestroy() {
    this.obs$.unsubscribe()
  }
}
