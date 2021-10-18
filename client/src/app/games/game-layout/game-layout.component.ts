import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrls: ['./game-layout.component.css']
})
export class GameLayoutComponent implements OnInit, OnDestroy {

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

  cross() {
    this.router.navigate(['/people/games'])
  }

  ngOnDestroy() {
    this.obs$.unsubscribe()
  }

}
