import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User, VideoRoom } from '../../interfaces';
import { PeopleService } from '../../services/people.service';
import { VideoRoomService } from '../../services/videorooms.service';

@Component({
  selector: 'app-video-room-form',
  templateUrl: './video-room-form.component.html',
  styleUrls: ['./video-room-form.component.css']
})
export class VideoRoomFormComponent implements OnInit, OnDestroy {

  @Input() room: VideoRoom
  @Input() session: User
  @Output() result = new EventEmitter<boolean>()
  @Output() newRoom = new EventEmitter<VideoRoom>()

  form: FormGroup
  imagePreview = ''
  image: File
  users: string[] = []
  friends: User[] = []
  oSub$: Subscription

  constructor(private videoroomService: VideoRoomService, private peopleService: PeopleService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(this.room.title),
      privateLevel: new FormControl(this.room.privateLevel),
    })
    this.imagePreview = this.room.image ? this.room.image : 'https://emo.su/images/videorooms.png'
    for (let user of this.room.users) if (user) this.users.push(user._id ? user._id : user)
    this.oSub$ = this.peopleService.fetchFriends().subscribe(friends => {
      this.friends = [...friends.withMessageUsers, ...friends.withoutMessageUsers]
    })
  }

  close() {
    this.result.emit(true)
  }

  changeActive(num) {
    this.room.active = num
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.image = file
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }

  checkUser(id: string) {
    if (this.users.includes(id)) {
      let index = this.users.indexOf(id, 0)
      this.users.splice(index, 1)
    }
    else {
      this.users.push(id)
    }
  }

  checkAll() {
    for (let user of this.friends) {
      if (!this.users.includes(user._id)) this.users.push(user._id)
    }
  }

  checkNobody() {
    for (let user of this.friends) {
      let index = this.users.indexOf(user._id, 0)
      if (index != -1) this.users.splice(index, 1)
    }
  }
  onSubmit() {
    if (this.room._id) this.update()
    else this.create()
  }
  create() {
    this.form.disable()
    this.videoroomService.create({...this.room, ...this.form.value})
    .subscribe(room => {
      this.room = room
      if (!this.image) {
        this.changeUsers()
      } else {
        this.videoroomService.update(this.room, this.image).subscribe(room => {
          this.room = room
          this.changeUsers()
        })
      }
    },
    error => console.log(error))
  }

  update() {
    this.form.disable()
    this.videoroomService.update({...this.room, ...this.form.value}, this.image).subscribe(room => {
      this.room = room
      console.log(room)
      this.changeUsers()
    }, error => {console.log(error)})
  }

  delete() {
    this.videoroomService.update({...this.room, active: 2}).subscribe(room => {
      this.result.emit(false)
    }, error => {console.log(error)})
  }

  changeUsers() {
    let toPush = []
    let toRemove = []
    for (let user of this.users) {
      if (!this.room.users.includes(user)) {
        toPush.push(user)
      }
    }
    for (let user of this.room.users) {
      if (!this.users.includes(user)) {
        toRemove.push(user)
      }
    }
    this.videoroomService.changeUsers(this.room._id, toPush, toRemove).subscribe(res => {
      this.videoroomService.getById(this.room._id).subscribe(room => {
        this.form.enable()
        this.newRoom.emit(room)
        this.result.emit(true)
      }, err => console.error(err))
      error => console.log(error)
    })

    
  }

  ngOnDestroy(): void {
      this.oSub$.unsubscribe()
  }
}
