import { Observable, Subscription } from 'rxjs';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/shared/services/chat.service';

const STEP = 10

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
})
export class RatingComponent implements OnInit, OnDestroy {

  @ViewChild('page') page: ElementRef<HTMLDivElement>;

  limit = STEP
  offset = 0

  loading = false
  reloading = false
  noMore = false
  session: User
  obs$: Subscription
  rSub$: Subscription
  pSub$: Subscription
  position: number
  users: User[] = []
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
      this.pSub$ = this.usersService.getPosition().subscribe(p => {
        this.position = p.position
      })

      this.page.nativeElement.addEventListener("scroll", this.checkScroll.bind(this));

      this.fetch()
      
    })     
  }

  checkScroll() { 
    var contentHeight = this.page.nativeElement.offsetHeight;      // 1) высота блока контента вместе с границами
    var yOffset       = window.pageYOffset;      // 2) текущее положение скролбара
    var window_height = window.innerHeight;      // 3) высота внутренней области окна документа
    var y             = yOffset + window_height;
   
    
    if (y >= contentHeight)
    {
        //загружаем новое содержимое в элемент
        this.offset += this.limit
        this.loading = true
        this.fetch()
    }
  }

  fetch() {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.rSub$ = this.usersService.getRating2(params).subscribe(users => {
      this.users = this.users.concat(users)
      this.noMore = users.length < this.limit
      if (this.noMore) window.removeEventListener('scroll', this.checkScroll)
      this.loading = false
      this.reloading = false
    })
  }


  throttle(callee, timeout) {
    let timer = null

    return function perform(...args) {
      if (timer) return

      timer = setTimeout(() => {
        callee(...args)

        clearTimeout(timer)
        timer = null
      }, timeout)
    }
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
