import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { PeopleService } from 'src/app/shared/services/people.service';

const colors = [
  '#FC2125', '#29C732', '#0A60FF', '#FD8208', '#FEC309', '#90714C',
  '#FB0D8F', '#9D33D6', '#453CCC', '#7B7B81', '#007B81', '#678532'
]

@Component({
  selector: 'app-game2',
  templateUrl: './game2.component.html',
  styleUrls: ['./game2.component.css']
})

export class Game2Component implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('board') board: ElementRef<HTMLDivElement>;

  gameProgress: number = -1
  score: number = 0
  answer: string = ''
  time: number = 0
  balls: number = 0
  timeStr: string
  t: any
  levelName: string
  session: User
  oSub: Subscription


  constructor(
    private router: Router,
    private loginService: LoginService,
    private peopleService: PeopleService,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    this.oSub = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.gameProgress += 1
    })
  }

  ngAfterViewInit () {
    this.board.nativeElement.addEventListener('click', event => {
      const target = event.target as HTMLDivElement;
      if (target.classList.contains('circle')) {
          this.balls++
          target.remove()
          this.createRandomCircle()
      }
    })
  }

  start(count, name) {
    this.levelName = name
    this.gameProgress = 1
    this.time = count
    this.createRandomCircle()
    this.t = setInterval(() => this.decreaseTime(), 1000)
  }

  createRandomCircle() {
    const circle = this.renderer.createElement('div')
    this.renderer.addClass(circle, 'circle')
    this.renderer.addClass(circle, 'green-cursor')

    const size = this.getRandomNumber(50, 150)
    const {width, height} = this.board.nativeElement.getBoundingClientRect()
    const x = this.getRandomNumber(size, width - size)
    const y = this.getRandomNumber(size, height - size)
    const color = this.getRandomColor()

    this.renderer.setStyle(circle, 'width', `${size}px`)
    this.renderer.setStyle(circle, 'height', `${size}px`)
    this.renderer.setStyle(circle, 'top', `${y}px`)
    this.renderer.setStyle(circle, 'left', `${x}px`)
    this.renderer.setStyle(circle, 'background', color)

    this.renderer.appendChild(this.board.nativeElement, circle)
  }

  getRandomNumber(min, max) {
      return Math.round(Math.random() * (max - min) + min)
  }

  getRandomColor() {
    const index = Math.floor(Math.random() * colors.length)
    return colors[index]
  }

  decreaseTime() {
    if (this.time === 0) {
        clearInterval(this.t)
        this.finishGame()
    } else {
      this.time-- 
    }
  }

  finishGame() {
    document.getElementsByClassName('circle')[0].remove()
    this.score = Math.ceil(this.balls / 4)
    this.peopleService.playedGame({game: 2, score: this.score, level: this.levelName}).subscribe()
    this.gameProgress = 2
  }

  newStart() {
    this.balls = 0
    this.score = 0
    this.gameProgress = 0
  }

  exit() {
    this.router.navigate(['/people/games'])
  }

  ngOnDestroy() {
    clearInterval(this.t)
    this.oSub.unsubscribe()
  }

}
