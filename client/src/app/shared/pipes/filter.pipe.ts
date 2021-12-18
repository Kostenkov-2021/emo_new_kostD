import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../interfaces';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(users: User[], search: string = '', field: string): User[] {
    search = search.trim().toLowerCase()
    if (!search) {
      return users
    }
    return users.filter(user => {
      if (field == 'surname') {
        return user.surname.toLowerCase().slice(0, search.length) === search
      }
      else {
        return user.name.toLowerCase().slice(0, search.length) === search
      }
    })
  }
}
