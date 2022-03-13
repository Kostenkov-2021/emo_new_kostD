import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User, VideoRoom } from 'src/app/shared/interfaces';
import { VideoRoomService } from 'src/app/shared/services/videorooms.service';

@Component({
  selector: 'app-video-rooms-bin-form',
  templateUrl: './video-rooms-bin-form.component.html',
  styleUrls: ['./video-rooms-bin-form.component.css']
})
export class VideoRoomsBinFormComponent implements OnInit, OnDestroy {
  @Input() room: VideoRoom
  @Input() session: User
  @Output() result = new EventEmitter<string>()

  form_del: FormGroup
  oSub$: Subscription

  constructor(private videoroomService: VideoRoomService){}

  ngOnInit(): void {
    this.form_del = new FormGroup({
      whatDo: new FormControl('nothing')
    })
  }

  onSubmit() {
    if (this.form_del.value.whatDo == 'nothing') {
      this.result.emit('nothing')
    } else if (this.form_del.value.whatDo == 'delete') {
      this.oSub$ = this.videoroomService.deleteById(this.room._id).subscribe(message => this.result.emit('delete'))
    } else if (this.form_del.value.whatDo == 'active') {
      this.oSub$ = this.videoroomService.update({...this.room, active: 0}).subscribe(message => this.result.emit('active'))
    } else {
      this.form_del.value.whatDo
    }
  }

  close() {
    this.result.emit('nothing')
  }

  ngOnDestroy(): void {
      if (this.oSub$) this.oSub$.unsubscribe()
  }
}
