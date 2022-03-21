import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Institution, User } from '../shared/interfaces';
import { LoginService } from '../shared/services/login.service';
import { PeopleService } from '../shared/services/people.service';
import { UsersService } from '../shared/services/users.service';

@Component({
  selector: 'app-registr-page',
  templateUrl: './registr-page.component.html',
  styleUrls: ['./registr-page.component.css']
})
export class RegistrPageComponent implements OnInit {

  form: FormGroup
  image: File = null
  imagePreview = '/images/boy.png'
  imageText = '/images/boy.png'
  institutions$: Observable<Institution[]>
  user: User
  birthday: Date
  oSub: Subscription
  aSub: Subscription

  constructor(private usersService: UsersService,
    private router: Router,
    private peopleService: PeopleService,
    private loginService: LoginService) { }

  @ViewChild('password_control') password_control: ElementRef
  @ViewChild('password') password: ElementRef
  
  ngOnInit(): void {
    this.institutions$ = this.peopleService.getInstitutions()

    this.form = new FormGroup({
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      sex: new FormControl('1'),
      photo: new FormControl(null),
      institution: new FormControl(''),
      info: new FormControl(''),
      birthDate: new FormControl(null)
    })

    this.imagePreview = '/images/boy.png'

  }

  ngOnDestroy() {
    if (this.oSub) this.oSub.unsubscribe()
    if (this.aSub) this.aSub.unsubscribe()
  
  }

  show_hide_password() {
    let input = this.password.nativeElement;
    let target = this.password_control.nativeElement;
    if (input.getAttribute('type') == 'password') {
      target.classList.add('view');
      target.classList.remove('no_view');
      input.setAttribute('type', 'text');
    } else {
      target.classList.add('no_view');
      target.classList.remove('view');
      input.setAttribute('type', 'password');
    }
  }

  changeSex() {
    if ((this.imagePreview == '/images/boy.png') || (this.imagePreview == '/images/girl.png')) {
      if (this.form.value.sex == '1') {
        this.imagePreview = '/images/boy.png'
        this.imageText = '/images/boy.png'
      }
      else {
        this.imagePreview = '/images/girl.png'
        this.imageText = '/images/girl.png'
      }
    }
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.image = file
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }


  onSubmit() {
    this.form.disable()
      
    let obs$ = this.usersService.createRequest(
        this.form.value.login.trim(),
        this.form.value.password.trim(),
        this.form.value.name.trim(),
        this.form.value.surname.trim(),
        this.form.value.sex,
        this.form.value.institution,
        this.form.value.birthDate ? (new Date(this.form.value.birthDate)).toISOString() : null,
        this.image,
        this.form.value.info
      )

    obs$.subscribe(
      user => {
        this.form.enable()
        this.aSub = this.loginService.login({login: user.login, password: this.form.value.password.trim()}).subscribe(
          () => this.router.navigate(['/people/friends']),
          error => {
            console.log(error)
            this.form.enable()
          }
        )
      },
      error => {
        alert(error.error.message)
        this.form.enable()
      },
      () => {this.form.enable()}
    )
  }
}
