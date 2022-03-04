import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, MessageFromServer, User, VideoRoom, VideoRoomMessage } from '../interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class VideoRoomService {

  constructor(private http: HttpClient, private router: Router) { }

  create(videoroom: VideoRoom): Observable<VideoRoom> {
    let json = JSON.stringify(videoroom)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post<VideoRoom>(`/api/videorooms`, json, {headers: myHeaders})
  }

  fetch(params: any): Observable<VideoRoom[]> {
    return this.http.get<VideoRoom[]>(`/api/videorooms`, {
      params: new HttpParams({
        fromObject: params
      })
    })
  }

  update(videoroom: VideoRoom, image?: File): Observable<VideoRoom> {
    const fd = new FormData()
    if (typeof videoroom.active == 'number') fd.append('active', videoroom.active.toString())
    if (videoroom.title) fd.append('title', videoroom.title)
    if (image) fd.append('image', image, image.name)
    if (typeof videoroom.privateLevel == 'number') fd.append('privateLevel', videoroom.privateLevel.toString())
    return this.http.patch<VideoRoom>(`/api/videorooms/${videoroom._id}`, fd)
  }

  pushUser(id, user): Observable<MessageFromServer> {
      return this.http.get<MessageFromServer>(`/api/videorooms/pu/${id}/${user}`)
  }

  deleteUser(id, user): Observable<MessageFromServer> {
      return this.http.get<MessageFromServer>(`/api/videorooms/du/${id}/${user}`)
  }

  changeUsers(id, toPush, toRemove): Observable<MessageFromServer> {
    let json = JSON.stringify({toPush, toRemove})
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.patch<MessageFromServer>(`/api/videorooms/cu/${id}`, json, {headers: myHeaders})
  }
  
  getById(id): Observable<VideoRoom>  {
    return this.http.get<VideoRoom>(`/api/videorooms/${id}`)
  }

  deleteById(id): Observable<MessageFromServer>  {
    return this.http.delete<MessageFromServer>(`/api/videorooms/${id}`)
  }

  sendMessage(room: string, message: VideoRoomMessage): Observable<VideoRoomMessage> {
    let json = JSON.stringify(message)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post<VideoRoomMessage>(`/api/videoroom-messages/${room}`, json, {headers: myHeaders})
  }

  fetchMessages(room: string, params: any): Observable<VideoRoomMessage[]> {
    return this.http.get<VideoRoomMessage[]>(`/api/videoroom-messages/${room}`, {
      params: new HttpParams({
        fromObject: params
      })
    })
  }
  getMessageById(id): Observable<VideoRoom>  {
    return this.http.get<VideoRoom>(`/api/videoroom-messages/one/${id}`)
  }

  deleteMessageById(id): Observable<MessageFromServer>  {
    return this.http.delete<MessageFromServer>(`/api/videoroom-messages/${id}`)
  }
  
  readMessages(id: string): Observable<MessageFromServer> {
      return this.http.get<MessageFromServer>(`/api/videoroom-messages/read/${id}`)
  }

  goToRoom(id) {
    this.router.navigate([`/videoroom/${id}`], {queryParams: {auth: 'false'}})
  }
}
