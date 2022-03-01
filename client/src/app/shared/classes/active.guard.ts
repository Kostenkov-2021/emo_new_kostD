import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router'
import {Injectable} from '@angular/core'
import {LoginService} from '../services/login.service'

@Injectable({
    providedIn: 'root'
  })
export class ActiveUserGuard implements CanActivate, CanActivateChild {
    role: number 

    constructor(private auth: LoginService,
                private router: Router){}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        
        const thisuser = await this.auth.getUser().toPromise()
        this.role = thisuser.levelStatus
        if (this.role !== 4 && this.role !== 6) {
            return (true)
        }
        else {
            this.router.navigate(['/people/games'])
            return (false)
        }
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.canActivate(route, state)
    }
}