import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { NavService } from '../../services/nav.service';
import { Subscription } from 'rxjs';
import { Picture, User } from '../../interfaces';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css']
})
export class AnswersComponent implements OnInit, OnDestroy {

  @Input() src: string
  @Input() session: User
  @Input() group: boolean
  @Output() close = new EventEmitter<boolean>()
  @Output() meta = new EventEmitter<any[]>()

  $answers: Subscription
  answers: Picture[]
  reloading = false
  interlocutor: Subscription
  interlocutorSex: number
  id: string
  queryC = ''

  constructor(private chatService: ChatService,
              private route: ActivatedRoute) {}
               

  ngOnInit(): void {
    this.reloading = true

    this.route.firstChild.params.subscribe((params: Params) => {
      this.id = params.id
      
      this.route.queryParams.subscribe((queryParam: any) => {
        this.queryC = queryParam.color
        this.$answers = this.chatService.getAnswers(this.src).subscribe(answers => {
          this.answers = answers.answers
          this.sortAnswers()
        })
      })
      
    })
  }

  sortAnswers() {
    for (let picture of this.answers) {     
      if (picture._id == '5f130939962c2f062467f853' || picture._id == '602fcb569ca5cc7b757d0443') {
        picture.src = this.session.photo
        if (picture.text) picture.textInHTML = picture.text
        else if (picture.textForGirls) picture.textInHTML = picture.textForGirls
      }
      else {        
        if (this.session.sex == 1) {
          if (picture.text) picture.textInHTML = picture.text
          else if (picture.textForGirls) picture.textInHTML = picture.textForGirls

          if (this.queryC == 'grey') {
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
          if (picture.textForGirls) picture.textInHTML = picture.textForGirls
          else if (picture.text) picture.textInHTML = picture.text

          if (this.queryC == 'grey') {
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
    }
    this.reloading = false
  }

  closeModal(ans) {
    this.close.emit(ans)
  }

  checkAnswer(id: string, folder: boolean, type?: number) {
    if (type) this.meta.emit([id, folder, type])
    else this.meta.emit([id, folder])
  }

  ngOnDestroy() {
    this.$answers.unsubscribe()
  }

}
