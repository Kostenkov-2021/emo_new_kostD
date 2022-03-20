import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Event, User } from '../../interfaces';

@Component({
  selector: 'app-delete-all-message',
  templateUrl: './delete-all-message.component.html',
  styleUrls: ['./delete-all-message.component.css']
})
export class DeleteAllMessageComponent {

  @Input() event: Event 
  @Input() session: User
  @Output() result = new EventEmitter<boolean>()

  checked(ans) {
    this.result.emit(ans)
  }
}
