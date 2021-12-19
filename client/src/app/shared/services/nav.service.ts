import { Injectable, EventEmitter } from '@angular/core';
import { User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  newSettings: EventEmitter<User> = new EventEmitter()
  textMessage: EventEmitter<any[]> = new EventEmitter()

  public sendToPeople(user) {
    this.newSettings.emit(user);
    
  }

  public sendTextMessage(message: string, type: number) {
    this.textMessage.emit([message, type])
  }

}
