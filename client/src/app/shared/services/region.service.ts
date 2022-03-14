import {Injectable} from '@angular/core'
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'
import {Observable} from 'rxjs'
import {Region, MessageFromServer} from '../interfaces'

@Injectable({
  providedIn: 'root'
})
export class RegionsService {
    constructor(private http: HttpClient) {       
    }

    fetch(params: any): Observable<Region[]> {
      return this.http.get<Region[]>('/api/regions', {
        params: new HttpParams({
          fromObject: params
        })
      })
    }

    getById(id: string): Observable<Region> {
      return this.http.get<Region>(`/api/regions/${id}`)
    }

    create(data: Region): Observable<Region> {
        data.name = data.name.trim()
        let json = JSON.stringify(data)
        const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
        return this.http.post<Region>(`/api/regions`, json, {headers: myHeaders})
    }

    update(id: string, data: Region): Observable<Region> {
      data.name = data.name.trim()
        let json = JSON.stringify(data)
        const myHeaders = new HttpHeaders().set('Content-Type', 'application/json')
        return this.http.patch<Region>(`/api/regions/${id}`, json, {headers: myHeaders})
    }

    delete(id: string): Observable<MessageFromServer> {
      return this.http.delete<MessageFromServer>(`/api/regions/${id}`)
    }
}