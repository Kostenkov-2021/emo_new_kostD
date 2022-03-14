import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, Institution, Users, MessageFromServer, GameSession } from '../interfaces';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  constructor(private http: HttpClient) { }

  update(
    user: User | any
  ): Observable<User> {
    let json = JSON.stringify(user)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.patch<User>(`/api/people`, json, {headers: myHeaders})
  }

  fetchAll2(params: any): Observable<User[]> {
    return this.http.get<User[]>(`/api/people/search2`, {
      params: new HttpParams({
        fromObject: params
      })
    })
  }

  fetchAll(id: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/people/search/${id}/0`)
  }

  fetchFriends(): Observable<Users> {
    return this.http.get<Users>(`/api/people/friends/0`)
  }

  getInstitutions(params: any = {}): Observable<Institution[]> {
    return this.http.get<Institution[]>(`/api/manage/institutions/search`, {
      params: new HttpParams({
        fromObject: params
      })
    })
  }

  newScore(score: number): Observable<MessageFromServer> {
    const obj = {score}
    let json = JSON.stringify(obj)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post<MessageFromServer>(`/api/people/score`, json, {headers: myHeaders})
  }

  playedGame(session: GameSession): Observable<MessageFromServer> {
    let json = JSON.stringify(session)
    const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post<MessageFromServer>(`/api/people/game`, json, {headers: myHeaders})
  }
}
