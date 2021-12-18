import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, Institution, Users, MessageFromServer } from '../interfaces';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  constructor(private http: HttpClient) { }

  update(
    online?: boolean,
    text?: boolean,
    read?: boolean,
    firstColor?: number,
    secondColor?: number,
    surnameView?: boolean,
    vote?: boolean,
    sentence?: boolean,
    answers?: boolean,
    change?: boolean,
    defaultColor?: string,
    birthdays?: boolean,
    screenreader?: boolean
  ): Observable<User> {
    let obj = {
      online,
      text,
      read,
      firstColor,
      secondColor,
      surnameView,
      vote,
      sentence,
      answers,
      change,
      defaultColor,
      birthdays,
      screenreader
    }
    let json = JSON.stringify(obj)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.patch<User>(`/api/people`, json, {headers: myHeaders})
  }

  newRole(levelStatus: string) {
    let obj = {
      levelStatus
    }
    let json = JSON.stringify(obj)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.patch<User>(`/api/people`, json, {headers: myHeaders})
  }

  fetchAll(id: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/people/search/${id}/0`)
  }

  fetchAll2(params: any): Observable<User[]> {
    return this.http.get<User[]>(`/api/people/search2`, {
      params: new HttpParams({
        fromObject: params
      })
    })
  }

  fetchFriends(): Observable<Users> {
    return this.http.get<Users>(`/api/people/friends/0`)
  }

  getInstitutions(): Observable<Institution[]> {
    return this.http.get<Institution[]>(`/api/manage/institutions/search`)
  }

  newScore(score: number): Observable<MessageFromServer> {
    const obj = {score}
    let json = JSON.stringify(obj)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post<MessageFromServer>(`/api/people/score`, json, {headers: myHeaders})
  }
}
