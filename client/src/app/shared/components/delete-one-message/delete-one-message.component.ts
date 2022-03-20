import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Message, GroupMessage, User } from '../../interfaces';

@Component({
  selector: 'app-delete-one-message',
  templateUrl: './delete-one-message.component.html',
  styleUrls: ['./delete-one-message.component.css']
})
export class DeleteOneMessageComponent {

  @Input() letter: Message | GroupMessage
  @Input() session: User
  @Output() result = new EventEmitter<boolean>()

  checked(ans) {
    this.result.emit(ans)
  }
}
