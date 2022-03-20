import { Component, Input, Output, EventEmitter} from '@angular/core';
import { User } from '../../interfaces';

@Component({
  selector: 'app-delete-picture',
  templateUrl: './delete-picture.component.html',
  styleUrls: ['./delete-picture.component.css']
})
export class DeletePictureComponent{

  @Input() image: string
  @Input() session: User
  @Output() result = new EventEmitter<boolean>()

  checkedDelete (ans: boolean){
    this.result.emit(ans)
  }
}
