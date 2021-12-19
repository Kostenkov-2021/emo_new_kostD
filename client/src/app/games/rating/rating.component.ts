import { Observable, Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit} from '@angular/core';
import { Institution, User } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/shared/services/chat.service';
import { PeopleService } from 'src/app/shared/services/people.service';

const STEP = 10

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
})
export class RatingComponent implements OnInit, OnDestroy {

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false
  session: User
  obs$: Subscription
  rSub$: Subscription
  pSub$: Subscription
  institutions$: Observable<Institution[]>
  institution: string = ''
  position: number
  users: User[] = []
  num_users: User[] = []
  myPlace: Number
  zoom = false
  image = ''
  name: string = ''

  constructor(private loginService: LoginService, 
    private usersService: UsersService, 
    private router: Router,
    private chatService: ChatService,
    private peopleService: PeopleService
    ) { 
    }

  ngOnInit(): void {
    this.reloading = true
    this.obs$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.institutions$ = this.peopleService.getInstitutions()
      this.pSub$ = this.usersService.getPosition().subscribe(p => {
        this.position = p.position
      })
      this.fetch()
      
    })     
  }

  fetch() {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.rSub$ = this.usersService.getRating2(params).subscribe(users => {
      this.users = this.users.concat(users)
      this.num_users = this.users
      this.noMore = users.length < this.limit
      if (!this.noMore) this.loadMore()
      this.loading = false
      this.reloading = false
    })
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetch()
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
