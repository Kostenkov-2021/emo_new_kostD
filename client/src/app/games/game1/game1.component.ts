import { Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Picture, User } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { PeopleService } from 'src/app/shared/services/people.service';
import { PicturesService } from 'src/app/shared/services/pictures.service';

@Component({
  selector: 'app-game1',
  templateUrl: './game1.component.html',
  styleUrls: ['./game1.component.css']
})
export class Game1Component implements OnDestroy, OnInit{

  gameProgress: number = -1
  pSub: Subscription
  pictures: Picture[]
  score: number = 0
  answer: string = ''
  levelName: string
  session: User
  oSub: Subscription


  constructor(private picturesService: PicturesService,
    private loginService: LoginService,
    private router: Router,
    private peopleService: PeopleService) { }

  ngOnInit(): void {
    this.oSub = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.gameProgress += 1
    })
  }

  start(count, name) {

    this.levelName = name
    this.pSub = this.picturesService.getGame1(count).subscribe(pictures => {
      this.pictures = pictures
      for (let picture of this.pictures) {
        if (Math.random() < 0.5) {
          if (picture.text) picture.textInHTML = picture.text.trim()
          else if (picture.textForGirls) picture.textInHTML = picture.textForGirls.trim()

          if (Math.random() < 0.5) {
            if (picture.boysGreyPicture) picture.src = picture.boysGreyPicture
            else if (picture.girlsGreyPicture) picture.src = picture.girlsGreyPicture
            else if (picture.boysColorPicture) picture.src = picture.boysColorPicture
            else if (picture.girlsColorPicture) picture.src = picture.girlsColorPicture
          }
          else {
            if (picture.boysColorPicture) picture.src = picture.boysColorPicture
            else if (picture.girlsColorPicture) picture.src = picture.girlsColorPicture
            else if (picture.boysGreyPicture) picture.src = picture.boysGreyPicture
            else if (picture.girlsGreyPicture) picture.src = picture.girlsGreyPicture
          }
        }
        else {
          if (picture.textForGirls) picture.textInHTML = picture.textForGirls.trim()
          else if (picture.text) picture.textInHTML = picture.text.trim()

          if (Math.random() < 0.5) {
            if (picture.girlsGreyPicture) picture.src = picture.girlsGreyPicture
            else if (picture.boysGreyPicture) picture.src = picture.boysGreyPicture
            else if (picture.girlsColorPicture) picture.src = picture.girlsColorPicture
            else if (picture.boysColorPicture) picture.src = picture.boysColorPicture
          }
          else {
            if (picture.girlsColorPicture) picture.src = picture.girlsColorPicture
            else if (picture.boysColorPicture) picture.src = picture.boysColorPicture
            else if (picture.girlsGreyPicture) picture.src = picture.girlsGreyPicture
            else if (picture.boysGreyPicture) picture.src = picture.boysGreyPicture
          }
        }
      }
      this.gameProgress += 1
    })
  }

  nextPicture() {
    if (this.answer.trim().toLocaleLowerCase() === this.pictures[this.gameProgress - 1].textInHTML.toLocaleLowerCase()) this.score += 1
    this.answer = ''
    this.gameProgress += 1
    if (this.gameProgress > this.pictures.length) this.peopleService.playedGame({game: 1, score: this.score, level: this.levelName}).subscribe()
  }

  newStart() {
    this.score = 0
    this.gameProgress = 0
    this.pictures = []
  }

  exit() {
    this.router.navigate(['/people/games'])
  }

  ngOnDestroy() {
    if (this.pictures) this.pSub.unsubscribe()
    this.oSub.unsubscribe()
  }
}
