import {Injectable} from '@angular/core'
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'
import {Observable} from 'rxjs'
import {Institution, MessageFromServer} from '../interfaces'

@Injectable({
  providedIn: 'root'
})
export class InstitutionsService {
    constructor(private http: HttpClient) {
    }

    fetch(params?: any): Observable<Institution[]> {
      if (!params) params = {}
      return this.http.get<Institution[]>('/api/manage/institutions', {
        params: new HttpParams({
          fromObject: params
        })
      })
    }

    getById(id: string): Observable<Institution> {
      return this.http.get<Institution>(`/api/manage/institutions/${id}`)
    }

    create(name: string, region?: string, img?: File): Observable<Institution> {
      const fd = new FormData()
      fd.append('name', name)
      if (region) fd.append('region', region)
      if (img) fd.append('image', img, img.name)
      return this.http.post<Institution>(`/api/manage/institutions`, fd)
    }

    update(id: string, name: string, region?: string, img?: File): Observable<Institution> {
      const fd = new FormData()
      fd.append('name', name)
      if (region) fd.append('region', region)
      if (img) fd.append('image', img, img.name)
      return this.http.patch<Institution>(`/api/manage/institutions/${id}`, fd)
    }

    delete(id: string, newID: string): Observable<MessageFromServer> {
      return this.http.delete<MessageFromServer>(`/api/manage/institutions/${id}/${newID}`)
    }
}