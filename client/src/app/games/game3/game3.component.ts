import { Component} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PeopleService } from 'src/app/shared/services/people.service';

@Component({
  selector: 'app-game3',
  templateUrl: './game3.component.html',
  styleUrls: ['./game3.component.css']
})
export class Game3Component  {

  gameProgress: number = 0
  score: number = 0
  right: number = 0
  addition: any[] = []
  subtraction: any[] = []
  form: FormGroup
  count = 10

  constructor(
    private router: Router,
    private peopleService: PeopleService) { }

  start(count) {
    function randomInteger(min, max) {
      // случайное число от min до (max)
      let rand = min + Math.random() * (max + 1 - min);
      return Math.floor(rand);
    }

    function formArrayGenerator() {
      let arr = []
      for (let i = 0; i < 6; i++) {
        arr.push(new FormControl())
      }
      return arr
    }

    this.count = count

    for (let i = 0; i < 6; i++) {
      let a1 = randomInteger(0, this.count)
      let a2 = randomInteger(0, this.count - a1)
      this.addition.push({example: `${a1} + ${a2} = `, result: a1 + a2})

      let s1 = randomInteger(0, this.count)
      let s2 = randomInteger(0, s1)
      this.subtraction.push({example: `${s1} - ${s2} = `, result: s1 - s2})
    }

    this.form = new FormGroup({
      addition: new FormArray(formArrayGenerator()),
      subtraction: new FormArray(formArrayGenerator())
    })

    this.gameProgress += 1 
  }

  answer() {
    for (let i = 0; i < 6; i++) {
      if (this.form.value.addition[i] === this.addition[i].result) this.right++
      if (this.form.value.subtraction[i] === this.subtraction[i].result) this.right++
    }
    switch (this.count) {
      case 10:
        this.score = Math.floor(this.right / 2)
        break;
      case 100:
        this.score = Math.floor(this.right / 1.5)
        break;
      case 1000:
        this.score = this.right
        break;
    }
    this.peopleService.newScore(this.score).subscribe()
    this.gameProgress += 1   
  }

  newStart() {
    this.score = 0
    this.right = 0
    this.gameProgress = 0
    this.addition = []
    this.subtraction = []
  }

  exit() {
    this.router.navigate(['/people/games'])
  }

}
