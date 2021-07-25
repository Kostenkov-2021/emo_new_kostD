import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';
import {TBItem, MessageFromServer} from '../interfaces'

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(private http: HttpClient) { }

  fetch(): Observable<TBItem[]> {
    return this.http.get<TBItem[]>('/api/table')
  }

  create(text: string, image?: File, parent?: string): Observable<TBItem> {
    const fd = new FormData()
    fd.append('item', text)
    if (image) fd.append('image', image, image.name)
    if (parent) fd.append('parent', parent)
    return this.http.post<TBItem>('/api/table', fd)
  }

  update(id: string, text?: string, image?: File, parent?: string): Observable<TBItem> {
    const fd = new FormData()
    if (text) fd.append('item', text)
    if (image) fd.append('image', image, image.name)
    if (parent) fd.append('parent', parent)
    return this.http.post<TBItem>(`/api/table/${id}`, fd)
  }

  delete(id: string): Observable<MessageFromServer> {
    return this.http.delete<MessageFromServer>(`/api/table/${id}`)
   }
}
