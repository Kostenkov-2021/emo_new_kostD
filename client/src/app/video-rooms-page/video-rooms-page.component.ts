import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, VideoRoom } from '../shared/interfaces';
import { LoginService } from '../shared/services/login.service';
import {VideoRoomService} from '../shared/services/videorooms.service'

const STEP = 6

@Component({
  selector: 'app-video-rooms-page',
  templateUrl: './video-rooms-page.component.html',
  styleUrls: ['./video-rooms-page.component.css']
})

export class VideoRoomsPageComponent implements OnInit {

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
  form: boolean
  currentRoom: VideoRoom
  image: string
  zoom: boolean
  text_top: string
  text_bottom: string

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

    this.rooms$ = this.videoroomService.fetch({...this.filter, ...params}).subscribe(rooms => {
      if (isNew) this.rooms = rooms
      else this.rooms = this.rooms.concat(rooms)
      this.reloading = false
      this.loading = false
      this.noMore = rooms.length < this.limit
      if (!this.noMore) this.loadMore()
    })
  }

  loadMore() {
    this.offset += this.limit
    this.loading = true
    this.fetch(false)
  }

  goToBin() {
    this.router.navigate(['/people/videorooms/bin'])
  }

  create() {
    let currentRoom = {
      author: this.session._id,
      privateLevel: 0,
      users: [],
      title: "Новая комната",
      image: '/images/videorooms.png',
      active: 0
    }
    this.openForm(currentRoom)
  }

  openForm(currentRoom) {
    this.currentRoom = currentRoom
    this.form = true
  }

  closeForm(result) {
    if (!result) {
      let index = this.rooms.indexOf(this.currentRoom)
      this.rooms.splice(index, 1)
    }
    this.form = false
  }

  editRoom(room) {
    if (this.session._id == room.author || this.session.levelStatus == 1 || this.session.levelStatus == 2 && room.institution == this.session.institution) this.openForm(room)
    else this.goToRoom(room._id)
  }

  newRoom(room) {
    if (!this.currentRoom._id) this.rooms.unshift(room)
    else {
      let index = this.rooms.indexOf(this.rooms.find(el => el._id == room._id))
      this.rooms[index] = room
    }
    this.currentRoom = null
  }

  goToRoom(id: string) {
    this.videoroomService.goToRoom(id)
  }

  openZoom(src, text_top?, text_bottom?) {
    this.image = src
    this.text_bottom = text_bottom
    this.text_top = text_top
    this.zoom = true
  }

  closeZoom(result) {
    if (result) this.zoom = false
    this.image = null
    this.text_bottom = null
    this.text_top = null
  }

  ngOnDestroy() {
    this.obs$.unsubscribe()
    this.rooms$.unsubscribe()
  }

}
