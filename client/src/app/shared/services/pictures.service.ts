import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {Observable} from 'rxjs'
import {PictureAndFolder, Picture, MessageFromServer, User} from '../interfaces'

@Injectable({
  providedIn: 'root'
})
export class PicturesService {
    constructor(private http: HttpClient) {       
    }
    
  getById(_id: string): Observable<Picture> {
    return this.http.get<Picture>(`/api/manage/pictures/one/${_id}`)
  }

  getGame1(count: number): Observable<Picture[]> {
    return this.http.get<Picture[]>(`/api/manage/pictures/game1/${count}`)
  }


  fetch(_id: string): Observable<PictureAndFolder> {
    return this.http.get<PictureAndFolder>(`/api/manage/pictures/${_id}`)
  }

  create(
    parent: string,
    invisible: boolean,
    folder: boolean,
    system: boolean,
    many?: string,
    textForGirls?: string,
    clean1?: boolean,
    clean2?: boolean,
    clean3?: boolean,
    clean4?: boolean,  
    text?: string, 
    boysGreyPicture?: File,
    girlsGreyPicture?: File,
    boysColorPicture?: File,
    girlsColorPicture?: File,
    answers?: string[],
    exceptions?: string[]
    ): Observable<Picture> {
    const fd = new FormData()

    if (boysGreyPicture && !clean1) fd.append('boysGreyPicture', boysGreyPicture, boysGreyPicture.name)   
    if (girlsGreyPicture && !clean2) fd.append('girlsGreyPicture', girlsGreyPicture, girlsGreyPicture.name)
    if (boysColorPicture && !clean3) fd.append('boysColorPicture', boysColorPicture, boysColorPicture.name)
    if (girlsColorPicture && !clean4) fd.append('girlsColorPicture', girlsColorPicture, girlsColorPicture.name)
    if (answers && answers !== []) fd.append('answers', answers.toString())
    if (exceptions && exceptions !== []) fd.append('exceptions', exceptions.toString())
    fd.append('text', text)
    if (textForGirls) fd.append('textForGirls', textForGirls)
    if (many && folder) fd.append('many', many)
    fd.append('invisible', invisible.toString())
    fd.append('folder', folder.toString())
    fd.append('system', system.toString())

    return this.http.post<Picture>(`/api/manage/pictures/${parent}`, fd)
  }

  update(
    id: string,
    invisible: boolean, 
    folder: boolean,
    text: string, 
    many?: string,
    textForGirls?: string,
    clean1?: boolean,
    clean2?: boolean,
    clean3?: boolean,
    clean4?: boolean,
    boysGreyPicture?: File,
    girlsGreyPicture?: File,
    boysColorPicture?: File,
    girlsColorPicture?: File,
    answers?: string[],
    exceptions?: string[]
    ): Observable<Picture> {
    const fd = new FormData()

    if (boysGreyPicture && !clean1) fd.append('boysGreyPicture', boysGreyPicture, boysGreyPicture.name)   
    if (girlsGreyPicture && !clean2) fd.append('girlsGreyPicture', girlsGreyPicture, girlsGreyPicture.name)
    if (boysColorPicture && !clean3) fd.append('boysColorPicture', boysColorPicture, boysColorPicture.name)
    if (girlsColorPicture && !clean4) fd.append('girlsColorPicture', girlsColorPicture, girlsColorPicture.name)
    if (answers && answers !== []) fd.append('answers', answers.toString())
    if (exceptions && exceptions !== []) fd.append('exceptions', exceptions.toString())
    if (clean1) fd.append('boysGreyPicture', 'clean')
    if (clean2) fd.append('girlsGreyPicture', 'clean')
    if (clean3) fd.append('boysColorPicture', 'clean')
    if (clean4) fd.append('girlsColorPicture', 'clean')
    fd.append('text', text)
    if (textForGirls) fd.append('textForGirls', textForGirls)
    fd.append('invisible', invisible.toString())
    if (many && folder) fd.append('many', many)

    return this.http.patch<Picture>(`/api/manage/pictures/${id}`, fd)
  }

  delete(id: string): Observable<MessageFromServer> {
   return this.http.delete<MessageFromServer>(`/api/manage/pictures/${id}`)
  }

  users(id: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/people/toPictures/${id}`)
  }
  
}