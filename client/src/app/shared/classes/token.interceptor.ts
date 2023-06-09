import {Injectable} from '@angular/core'
import {LoginService} from '../services/login.service'
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {Observable, throwError} from 'rxjs'
import {catchError} from 'rxjs/operators'
import {ActivatedRoute, Router} from '@angular/router'

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: LoginService, private router: Router, private route: ActivatedRoute) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.auth.isAuthenticated()) {
      req = req.clone({
        setHeaders: {
          Authorization: this.auth.getToken()
        }
      })
    }
    return next.handle(req).pipe(
      catchError(
        (error: HttpErrorResponse) => this.handleAuthError(error)
      )
    )
  }

  private handleAuthError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 401) {
      this.route.queryParams.subscribe((param: any) => {
        if (param.auth != 'false') this.router.navigate(['/login'], {queryParams: {sessionFailed: true}})
      })
    }
    return throwError(error)
  }
}

