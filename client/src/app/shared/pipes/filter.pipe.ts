
import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../interfaces';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {


  transform(users: User[], search: string = '', online: boolean = false, birthday: boolean = false): User[] {
    
    search = search.trim().toLowerCase()
    
    if (!search && !online && !birthday) {
      return users
    }
    let arrName = search.split(' ')
    
    return users.filter(user => {
      
      if (birthday && !user.bd) return false
      if (online && !user.active) return false
      let i = 0    
      for (let word of arrName) {
        if (user.surname.toLowerCase().slice(0, word.length) === word || user.name.toLowerCase().slice(0, word.length) === word) i++
      }
      if (i === arrName.length) return true
      return false
    })
  }
}
