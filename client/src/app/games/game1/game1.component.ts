import { Component, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Picture } from 'src/app/shared/interfaces';
import { PeopleService } from 'src/app/shared/services/people.service';
import { PicturesService } from 'src/app/shared/services/pictures.service';

@Component({
  selector: 'app-game1',
  templateUrl: './game1.component.html',
  styleUrls: ['./game1.component.css']
})
export class Game1Component implements OnDestroy{

  gameProgress: number = 0
  pSub: Subscription
  pictures: Picture[]
  score: number = 0
  answer: string = ''


  constructor(private picturesService: PicturesService,
    private router: Router,
    private peopleService: PeopleService) { }

  start(count) {
    function randomInteger(min, max) {
      // случайное число от min до (max)
      let rand = min + Math.random() * (max + 1 - min);
      return Math.floor(rand);
    }

    this.pSub = this.picturesService.getGame1(count).subscribe(pictures => {
      this.pictures = pictures
      for (let picture of this.pictures) {
        if (randomInteger(1, 2) == 1) {
          if (picture.text) picture.textInHTML = picture.text.trim()
          else if (picture.textForGirls) picture.textInHTML = picture.textForGirls.trim()

          if (randomInteger(1, 2) == 1) {
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

          if (randomInteger(1, 2) == 1) {
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
    if (this.gameProgress > this.pictures.length) this.peopleService.newScore(this.score).subscribe()
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
  }
}
