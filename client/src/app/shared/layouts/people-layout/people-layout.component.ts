import { Component, OnInit} from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavService } from '../../services/nav.service';
import { ChatService } from '../../services/chat.service';
import { User } from '../../interfaces';

@Component({
  selector: 'app-people-layout',
  templateUrl: './people-layout.component.html',
  styleUrls: ['./people-layout.component.css']
})
export class PeopleLayoutComponent implements OnInit {

  oSub: Subscription
  logSub: Subscription
  navSub: Subscription
  reloading: boolean = false
  session: User
  today = new Date()
  links: any[]

  constructor(
    private router: Router,
    private loginService: LoginService,
    private auth: LoginService,
    private navService: NavService,
    private chatService: ChatService) {
      this.navSub = this.navService.newSettings.subscribe(user => this.session = user)
     }

  ngOnInit(): void {
    this.reloading = true
    this.oSub = this.auth.getUser().subscribe(user => {
      this.session = user
      this.links = [
        {
          text: 'Диалоги',
          link: '/people/friends',
          image: '/images/dialog.png',
          show: true
        },{
          text: 'Поиск',
          link: '/people/search',
          image: '/images/lupa.png',
          show: true
        },{
          text: 'Видеокомнаты',
          link: '/people/videorooms',
          image: '/images/videorooms.png',
          show: this.session.videorooms
        },{
          text: 'Мероприятия',
          link: '/people/events',
          image: '/images/events.png',
          show: this.session.events
        },{
          text: 'Фотолайки',
          link: '/people/photolikes',
          image: '/images/photolike.png',
          show: this.session.events
        },{
          text: 'Тренажёры',
          link: '/people/games',
          image: '/images/games.png',
          show: this.session.games
        },{
          text: 'Настройки',
          link: '/people/settings',
          image: '/images/settings.jpg',
          show: true
        }
      ]
      this.reloading = false     
    })
  }

  goToChat(color: string, folder?: string) {
    this.chatService.goToChat(this.session._id, color, folder)
  }

  logout(event: Event) {
    this.logSub = this.loginService.exit().subscribe()
    this.logSub.unsubscribe()
    this.navSub.unsubscribe()
    this.oSub.unsubscribe()
    event.preventDefault()
    this.loginService.logout()
    this.router.navigate(['/login'])
  }

}
