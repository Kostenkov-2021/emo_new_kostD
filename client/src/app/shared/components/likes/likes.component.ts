import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { User } from '../../interfaces';

@Component({
  selector: 'app-likes',
  templateUrl: './likes.component.html',
  styleUrls: ['./likes.component.css']
})
export class LikesComponent implements OnInit {

  @Input() likes: User[]
  @Input() session: any
  @Output() result = new EventEmitter<boolean>()

  ngOnInit(): void {
    if (!this.session) this.session = {easyLang: true, surnameView: true}
  }

  close() {
    this.result.emit(true)
  }

}
