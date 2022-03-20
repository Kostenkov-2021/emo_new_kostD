import {Injectable} from '@angular/core'
import {HttpClient, HttpParams} from '@angular/common/http'
import {Observable} from 'rxjs'
import {User, Institution, MessageFromServer} from '../interfaces'

@Injectable({
  providedIn: 'root'
})
export class UsersService {
    constructor(private http: HttpClient) {       
    }

    fetch(params: any): Observable<User[]> {
      return this.http.get<User[]>(`/api/manage/users`, {
        params: new HttpParams({
          fromObject: params
        })
      })
    }
    
    getById(id: string): Observable<User> {
      return this.http.get<User>(`/api/manage/users/${id}`)
    }

    getRating(params: any): Observable<User[]> {
      return this.http.get<User[]>(`/api/manage/users/rating/all`, {
        params: new HttpParams({
          fromObject: params
        })
      })
    }

    getPosition(): Observable<{position: number}> {
      return this.http.get<{position: number}>(`/api/manage/users/rating/position`)
    }

    countRequests(): Observable<{requests: number}> {
      return this.http.get<{requests: number}>(`/api/manage/users/count-requests`)
    }

    getAnalytics(institution: string, params: any): Observable<User[]> {
      return this.http.get<User[]>(`/api/manage/users/analytics/${institution}`, {
        params: new HttpParams({
          fromObject: params
        })
      })
    }

    create(
      login: string,
      name: string,
      surname: string,
      sex: number,
      institution: string,
      levelStatus: number,
      password: string,
      birthDate?: Date,
      photo?: File,

      online?: boolean,
      text?: boolean,
      read?: boolean,
      firstColor?: number,
      secondColor?: number,
      surnameView?: boolean,
      setting?: number,
      vote?: boolean,
      sentence?: boolean,
      answers?: boolean,
      change?: boolean,
      defaultColor?: string,
      birthdays?: boolean,
      events?: boolean,
      screenreader?: boolean,
      games?: boolean,
      time?: boolean,
      info?: string,
      videorooms?: string,
      easyLang?: string,
      invert?: string
    ): Observable<User> {

      const fd = new FormData()

      if (photo) fd.append('image', photo, photo.name)
      if (birthDate) fd.append('birthDate', birthDate.toString())

      fd.append('login', login)
      fd.append('password', password)
      fd.append('surname', surname)
      fd.append('name', name)
      fd.append('sex', sex.toString())
      fd.append('institution', institution)
      fd.append('levelStatus', levelStatus.toString())

      if (online) fd.append('online', online.toString())
      if (info) fd.append('info', info)
      if (text) fd.append('text', text.toString())
      if (read) fd.append('read', read.toString())
      if (firstColor) fd.append('firstColor', firstColor.toString())
      if (secondColor) fd.append('secondColor', secondColor.toString())
      if (surnameView) fd.append('surnameView', surnameView.toString())
      if (setting) fd.append('setting', setting.toString())
      if (vote) fd.append('vote', vote.toString())
      if (sentence) fd.append('sentence', sentence.toString())
      if (answers) fd.append('answers', answers.toString())
      if (change) fd.append('change', change.toString())
      if (defaultColor) fd.append('defaultColor', defaultColor)
      if (birthdays) fd.append('birthdays', birthdays.toString())
      if (events) fd.append('events', events.toString())
      if (games) fd.append('games', games.toString())
      if (time) fd.append('time', time.toString())
      if (screenreader) fd.append('screenreader', screenreader.toString())
      if (videorooms) fd.append('videorooms', videorooms)
      if (easyLang) fd.append('easyLang', easyLang)
      if (invert) fd.append('invert', invert)

      return this.http.post<User>(`/api/manage/users`, fd)
    }


    update(
      id: string,
      changeL: boolean,
      login: string,
      name: string,
      surname: string,
      sex: number,
      institution: string,
      levelStatus: number,
      password?: string,
      birthDate?: Date,
      photo?: File,
      imageText?: string,

      online?: boolean,
      text?: boolean,
      read?: boolean,
      firstColor?: number,
      secondColor?: number,
      surnameView?: boolean,
      setting?: number,
      vote?: boolean,
      sentence?: boolean,
      answers?: boolean,
      change?: boolean,
      defaultColor?: string,
      birthdays?: boolean,
      events?: boolean,
      screenreader?: boolean,
      games?: boolean,
      time?: boolean,
      info?: string,
      videorooms?: string,
      easyLang?: string,
      invert?: string
    ): Observable<User> {

      const fd = new FormData()

      if (photo) fd.append('image', photo, photo.name)
      if (imageText) fd.append('photo', imageText)
      if (birthDate) fd.append('birthDate', birthDate.toString())
      if (info) fd.append('info', info)
      if (changeL) fd.append('login', login)
      if (password) fd.append('password', password)
      if (videorooms) fd.append('videorooms', videorooms)
      fd.append('surname', surname)
      fd.append('name', name)
      fd.append('sex', sex.toString())
      fd.append('institution', institution)
      fd.append('levelStatus', levelStatus.toString())

      if (online) fd.append('online', online.toString())
      if (text) fd.append('text', text.toString())
      if (read) fd.append('read', read.toString())
      if (firstColor) fd.append('firstColor', firstColor.toString())
      if (secondColor) fd.append('secondColor', secondColor.toString())
      if (surnameView) fd.append('surnameView', surnameView.toString())
      if (setting) fd.append('setting', setting.toString())
      if (vote) fd.append('vote', vote.toString())
      if (sentence) fd.append('sentence', sentence.toString())
      if (answers) fd.append('answers', answers.toString())
      if (change) fd.append('change', change.toString())
      if (defaultColor) fd.append('defaultColor', defaultColor)
      if (birthdays) fd.append('birthdays', birthdays.toString())
      if (events) fd.append('events', events.toString())
      if (screenreader) fd.append('screenreader', screenreader.toString())
      if (games) fd.append('games', games.toString())
      if (time) fd.append('time', time.toString())
      if (easyLang) fd.append('easyLang', easyLang)
      if (invert) fd.append('invert', invert)

      return this.http.patch<User>(`/api/manage/users/${id}`, fd)
    }

    delete(id: string): Observable<MessageFromServer> {
      return this.http.delete<MessageFromServer>(`/api/manage/users/${id}`)
    }

    createRequest(
      login: string,
      password: string,
      name: string,
      surname: string,
      sex: string,
      institution?: string,
      birthDate?: string,
      photo?: File,
      info?: string
    ): Observable<User> {

      const fd = new FormData()

      if (photo) fd.append('image', photo, photo.name)
      if (birthDate) fd.append('birthDate', birthDate)
      if (info) fd.append('info', info)

      fd.append('login', login)
      fd.append('password', password)
      fd.append('surname', surname)
      fd.append('name', name)
      fd.append('sex', sex)

      if (institution) fd.append('institution', institution)
      return this.http.post<User>(`/api/manage/users/request`, fd)
    }

}