import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Event, User, Institution, BotButton } from '../../shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { EventsService } from 'src/app/shared/services/events.service';
import { Observable, of, Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PicturesService } from 'src/app/shared/services/pictures.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { formatDate } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { BotService } from 'src/app/shared/services/bot.service';
import { PeopleService } from 'src/app/shared/services/people.service';

@Component({
  selector: 'app-admin-events-form',
  templateUrl: './admin-events-form.component.html',
  styleUrls: ['./admin-events-form.component.css']
})
export class AdminEventsFormComponent implements OnInit, OnDestroy {

  form: FormGroup
  id: string
  image: File
  photolikes: File[]
  imagePreview = ''
  event: Event
  session$: Subscription
  session: User
  users$: Subscription
  users: User[]
  institutions$: Subscription
  institutions: Institution[]
  buttons$: Observable<BotButton[]>
  queryI = ''
  whomShow = 0
  wait: string[]
  now: Date
  photolikesPreview: string[] = []
  wait_inst: string[] = []
  roles: string[] = ['1', '2', '3', '4', '5']



  constructor(private loginService: LoginService,
              private eventsService: EventsService,
              private picturesService: PicturesService,
              private peopleService: PeopleService,
              private route: ActivatedRoute,
              private router: Router,
              private botService: BotService) { }

  ngOnInit(): void {
    this.now = new Date()

    this.session$ = this.loginService.getUser().subscribe(user => {
      this.session = user

      this.form = new FormGroup({
        date: new FormControl(null),
        type: new FormControl(null, [Validators.required]),
        description: new FormControl(null),
        address: new FormControl(null),
        cost: new FormControl(null),
        chatImage: new FormControl(null),
        institution: new FormControl(this.session.institution),
        whomShow: new FormControl(2),
        chatTitle: new FormControl(null),
        photolikesImage: new FormControl(null),
        p_status: new FormControl('1'),
        sex: new FormControl('0')
      })
  
      this.form.disable()
  
      this.route.params
        .pipe(
          switchMap(
            (params: Params) => {
              this.id = params['id']
              if (this.id) return this.eventsService.getById(this.id)
              return of(null)
            }
          )
        )
        .subscribe(
          (event: Event) => {
            if (event) {
              this.event = event
              this.form.patchValue({
                type: event.type,
                description: event.description,
                address: event.address,
                cost: event.cost,
                chatTitle: event.chatTitle,
                sex: event.sex ? event.sex.toString() : '0',
                p_status: event.p_status ? '0' : (event.wait && event.wait.length) ? '2' : '1'
              })
              if (event.date) this.form.patchValue({date: formatDate(event.date, 'yyyy-MM-ddTHH:mm', 'en')})
              this.imagePreview = event.chatImage
              if (event.wait) this.wait = event.wait
              if (event.roles) {
                this.roles = []
                for (let role of event.roles) {
                  this.roles.push(role.toString())
                }
              }
              if (event.institutions) this.wait_inst = event.institutions
              if (event.photolikes) this.photolikesPreview = event.photolikes
            }
            this.form.enable()
          },
          error => alert(error.error.message)
        )
    })

    this.route.queryParams.subscribe((queryParam: any) => {
      this.users$ = this.picturesService.users(queryParam.institution).subscribe(users => {
        this.users = users
      })
      this.queryI = queryParam.institution
    }) 

    this.institutions$ = this.peopleService.getInstitutions().subscribe(value => {
      this.institutions = value
    })

    this.buttons$ = this.botService.fetch()
  }

  changeInstitution() {
    let id = this.form.value.institution
    this.router.navigate([], {queryParams: { 'institution': id}})
    this.queryI = id
  }

  changeWhomShow() {
    this.whomShow = this.form.value.whomShow
  }

  checkUser(id) {
    if (this.wait.includes(id)) {
      let index = this.wait.indexOf(id, 0)
      this.wait.splice(index, 1)
    }
    else {
      this.wait.push(id)
    }
  }

  checkAll() {
    for (let user of this.users) {
      this.wait.push(user._id)
    }
  }

  checkNobody() {
    for (let user of this.users) {
      let index = this.wait.indexOf(user._id, 0)
      if (index != -1) this.wait.splice(index, 1)
    }
  }

  checkAll_1() {
    for (let inst of this.institutions) {
      this.wait_inst.push(inst._id)
    }
  }

  checkNobody_1() {
    this.wait_inst = []
  }

  checkInst(id) {
    if (this.wait_inst.includes(id)) {
      let index = this.wait_inst.indexOf(id, 0)
      this.wait_inst.splice(index, 1)
    }
    else {
      this.wait_inst.push(id)
    }
  }
  checkRole(role) {
    if (this.roles.includes(role)) {
      let index = this.roles.indexOf(role, 0)
      this.roles.splice(index, 1)
    }
    else {
      this.roles.push(role)
    }
  }

  onPhotolikesUpload(event: any) {
    this.photolikes = event.target.files
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

  onSubmit(newStatus?: number) {
    this.form.disable()
    this.eventsService.update(this.id, 
      null, 
      newStatus ? newStatus : null, 
      (this.form.value.p_status == '2' && this.wait.length) ? this.wait : null, 
      this.form.value.date ? (new Date(this.form.value.date)).toISOString() : null,
      this.form.value.description,
      this.form.value.address,
      this.image,
      this.form.value.cost,
      this.form.value.chatTitle,
      this.photolikes,
      (this.form.value.p_status == '1' && this.wait_inst.length) ? this.wait_inst : null,
      this.form.value.p_status == '0' ? true : false,
      (this.form.value.p_status == '1' && this.roles.length) ? this.roles : null,
      (this.form.value.p_status == '1' ? this.form.value.sex : '0'))

    .subscribe(event => {
      this.event = event
      this.image = null
      this.photolikesPreview = event.photolikes
      this.photolikes = []
      this.form.enable()
    },
    error => {
      alert(error.error.message)
      this.form.enable()
    })
  }

  ngOnDestroy() {
    this.users$.unsubscribe()
    this.session$.unsubscribe()
  }
}
