import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, MessageFromServer, User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private http: HttpClient) { }

  create(wait: string[],
        type: number,
        description: string,
        ): Observable<Event> {
    const fd = {wait, type, description}
    let json = JSON.stringify(fd)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post<Event>(`/api/events`, json, {headers: myHeaders})
  }

  fetchForModerators(params: any): Observable<Event[]> {
    return this.http.get<Event[]>(`/api/events/moderators`, {
      params: new HttpParams({
        fromObject: params
      })
    })
  }

  fetchForBot(): Observable<Event[]> {
    return this.http.get<Event[]>(`/api/events/bot`)
  }

  fetchForEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`/api/events/events/0`)
  }

  fetchForPhotolikes(): Observable<Event[]> {
    return this.http.get<Event[]>(`/api/events/photolikes`)
  }

  update(id: string,
    moderator?: string,
    status?: number,
    wait?: string[],
    date?: string,
    description?: string,
    address?: string,
    chatImage?: File,
    cost?: number,
    chatTitle?: string,
    photolikes?: File[],
    institutions?: string[],
    p_status?: boolean,
    roles?: number[]
    ): Observable<Event> {
      const fd = new FormData()
      if (status) fd.append('status', status.toString())
      if (wait) fd.append('wait', wait.toString())
      if (roles) fd.append('roles', roles.toString())
      if (institutions) fd.append('institutions', institutions.toString())
      if (p_status) fd.append('p_status', p_status.toString())
      if (date) fd.append('date', date.toString().replace('T',' ').replace('-','/'))
      if (description) fd.append('description', description)
      if (address) fd.append('address', address)
      if (chatImage) fd.append('image', chatImage, chatImage.name)
      if (cost) fd.append('cost', cost.toString())
      if (chatTitle) fd.append('chatTitle', chatTitle)
      if (photolikes) {
        for (let i = 0; i < photolikes.length; i++) {
          fd.append(`photolikes`, photolikes[i], photolikes[i].name)
        }
      }
      return this.http.patch<Event>(`/api/events/${id}`, fd)
  }

  changeUserStatus(id: string,
    change: number
    ): Observable<Event> {
      const fd = {change}
      const json = JSON.stringify(fd)
      const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
      return this.http.patch<Event>(`/api/events/users/${id}`, json, {headers: myHeaders})
  }

  getById(id): Observable<Event>  {
    return this.http.get<Event>(`/api/events/one/${id}`)
  }

  deleteById(id): Observable<MessageFromServer>  {
    return this.http.delete<MessageFromServer>(`/api/events/${id}`)
  }

  emoLetters(): Observable<Event> {
    return this.http.get<Event>(`/api/events/emo`)
  }

  pushLike(id): Observable<Event> {
    return this.http.get<Event>(`/api/events/pl/${id}`)
  }

  deleteLike(id): Observable<Event> {
    return this.http.get<Event>(`/api/events/dl/${id}`)
  }

  getLikes(id): Observable<User[]> {
    return this.http.get<User[]>(`/api/events/gl/${id}`)
  }

  getPublicEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`/api/events/public`)
  }
}


