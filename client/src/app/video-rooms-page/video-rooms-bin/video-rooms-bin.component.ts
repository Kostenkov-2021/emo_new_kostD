import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, VideoRoom } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { VideoRoomService } from 'src/app/shared/services/videorooms.service';

const STEP = 6 

@Component({
  selector: 'app-video-rooms-bin',
  templateUrl: './video-rooms-bin.component.html',
  styleUrls: ['./video-rooms-bin.component.css']
})

export class VideoRoomsBinComponent implements OnInit {

  limit = STEP
  offset = 0
  obs$: Subscription
  session: User
  rooms$: Subscription
  rooms: VideoRoom[]
  reloading = false
  loading = false
  noMore = false
  filter: any = {}
  form: boolean =  false
  currentRoom: VideoRoom

  constructor(private videoroomService: VideoRoomService,
    private router: Router,
    private loginService: LoginService) { }

  ngOnInit(): void {
    this.reloading = true
    this.obs$ = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.fetch(true)
    })
  }

  fetch(isNew = false) {
    const params = Object.assign({}, {
      offset: this.offset,
      limit: this.limit
    })

    this.rooms$ = this.videoroomService.fetchArchive({...this.filter, ...params}).subscribe(rooms => {
      if (isNew) this.rooms = rooms
      else this.rooms = this.rooms.concat(rooms)
      this.reloading = false
      this.loading = false
      this.noMore = rooms.length < this.limit
      if (!this.noMore) this.loadMore()
    }, err => console.log(err))
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetch(false)
  }

  goToVP() {
    this.router.navigate(['/people/videorooms'])
  }

  openForm(currentRoom) {
    this.currentRoom = currentRoom
    this.form = true
  }

  closeForm(result) {
    if (result == 'delete' || result == 'active') {
      let index = this.rooms.indexOf(this.currentRoom)
      this.rooms.splice(index, 1)
    }
    this.form = false
  }

  ngOnDestroy() {
    this.obs$.unsubscribe()
    this.rooms$.unsubscribe()
  }

}
