import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PicturesService } from 'src/app/shared/services/pictures.service';
import { switchMap } from 'rxjs/operators';
import { of, Observable, Subscription } from 'rxjs';
import { Picture, PictureAndFolder, User, Institution } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { PeopleService } from 'src/app/shared/services/people.service';

@Component({
  selector: 'app-pictures-form',
  templateUrl: './pictures-form.component.html',
  styleUrls: ['./pictures-form.component.css']
})
export class PicturesFormComponent implements OnInit, OnDestroy {

  form: FormGroup
  whatDo = ''
  many = ''
  folder = ''
  id = ''
  system = false
  image1: File
  image2: File
  image3: File
  image4: File
  image1Preview = ''
  image2Preview = ''
  image3Preview = ''
  image4Preview = ''
  picture: Picture
  picturesAndFolder$: Observable<PictureAndFolder>
  session: User
  users$: Observable<User[]>
  institutions$: Observable<Institution[]>
  institution: string
  pictureAndFolder: PictureAndFolder
  answers = []
  exceptions = []
  queryF = ''
  queryI = ''
  invisible: boolean

  oSub: Subscription
  reloading = false

  constructor(private route: ActivatedRoute,
              private picturesService: PicturesService,
              private peopleService: PeopleService,
              private router: Router,
              private loginService: LoginService) {}

  ngOnInit(): void {
    this.reloading = true
    this.oSub = this.loginService.getUser().subscribe(user => {
      this.session = user
      this.reloading = false
      this.route.queryParams.subscribe((queryParam: any) => {
        this.users$ = this.picturesService.users(queryParam.institution)
        this.queryI = queryParam.institution
        this.picturesAndFolder$ = this.picturesService.fetch(queryParam.folder)
        this.queryF = queryParam.folder
      }) 
    })

    this.institutions$ = this.peopleService.getInstitutions()

    this.form = new FormGroup({
      many: new FormControl('0', [Validators.required]),
      boysGreyPicture: new FormControl(null),
      girlsGreyPicture: new FormControl(null),
      boysColorPicture: new FormControl(null),
      girlsColorPicture: new FormControl(null),
      text: new FormControl(null),
      textForGirls: new FormControl(null),
      invisible: new FormControl('false'),
      clean1: new FormControl(false), 
      clean2: new FormControl(false), 
      clean3: new FormControl(false), 
      clean4: new FormControl(false),
      institution: new FormControl(null)
    })

    this.form.disable()

    this.route.params
      .pipe(
        switchMap(
          (params: Params) => {
            this.whatDo = params['do']
            this.many = params['many']
            this.folder = params['folder']
            this.id = params['_id']
            if (this.id !== 'null') {
              return this.picturesService.getById(this.id)
            }

            return of(null)
          }
        )
      )
      .subscribe(
        (picture: Picture) => {
          if (picture) {
            this.picture = picture
            this.form.patchValue({
              text: picture.text,
              textForGirls: picture.textForGirls,
              invisible: picture.invisible === true ? 'true' : 'false',
            })
            if (picture.many) this.form.patchValue({many: picture.many.toString()})
            this.image1Preview = picture.boysGreyPicture
            this.image2Preview = picture.girlsGreyPicture
            this.image3Preview = picture.boysColorPicture
            this.image4Preview = picture.girlsColorPicture
            this.answers = picture.answers
            this.exceptions = picture.exceptions
            this.invisible = picture.invisible
            if (picture.system === true) this.system = true
            
          }

          this.form.enable()
        },
        error => {}
      )
  }

  ngOnDestroy() {
    this.oSub.unsubscribe()
  }

  answerChange(folder, id) {
    if (folder && 
      id !== '5f1309e3962c2f062467f854' && 
      id !== '5f1309f1962c2f062467f855' && 
      id !== '5f130a00962c2f062467f856' && 
      id !== '5f130a0d962c2f062467f857' ) {
      this.router.navigate([], {queryParams: { 'folder': id, 'institution': this.queryI }})
      this.queryF = id
    }
  }

  checkAnswer(id) {
    if (this.answers.includes(id)) {
      let index = this.answers.indexOf(id, 0)
      this.answers.splice(index, 1)
    }
    else {
      this.answers.push(id)
    }
  }

  changeInstitution() {
    let id = this.form.value.institution
    this.router.navigate([], {queryParams: { 'folder': this.queryF, 'institution': id }})
    this.queryI = id
  }

  checkUser(id) {
    if (this.exceptions.includes(id)) {
      let index = this.exceptions.indexOf(id, 0)
      this.exceptions.splice(index, 1)
    }
    else {
      this.exceptions.push(id)
    }
  }

  deletePicture() {
    let type = ''
    if (this.picture.folder === true) type = 'папку'
    else type = 'картинку'
    const decision = window.confirm(`Вы уверены, что хотите удалить ${type}?`)

    if (decision) {
      this.picturesService.delete(this.picture._id)
        .subscribe(
          response => {},
          error => {},
          () => this.router.navigate([`/manage/pictures/${this.folder}`], {queryParams: {answersFolder: this.queryF}})
        )
    }
  }

  onFile1Upload(event: any) {
    const file = event.target.files[0]
    this.image1 = file
    const reader = new FileReader()
    reader.onload = () => {
      this.image1Preview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }

  onFile2Upload(event: any) {
    const file = event.target.files[0]
    this.image2 = file
    const reader = new FileReader()
    reader.onload = () => {
      this.image2Preview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }

  onFile3Upload(event: any) {
    const file = event.target.files[0]
    this.image3 = file
    const reader = new FileReader()
    reader.onload = () => {
      this.image3Preview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }

  onFile4Upload(event: any) {
    const file = event.target.files[0]
    this.image4 = file
    const reader = new FileReader()
    reader.onload = () => {
      this.image4Preview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }
  
  onSubmit() {
    let obs$
    this.form.disable()

    if (this.whatDo === 'edittrue' || this.whatDo === 'editfalse') {
      obs$ = this.picturesService.update(
        this.picture._id, 
        this.form.value.invisible,
        this.whatDo === 'edittrue' ? true : false, 
        this.form.value.text,
        this.form.value.many,
        this.form.value.textForGirls,
        this.form.value.clean1,
        this.form.value.clean2,
        this.form.value.clean3,
        this.form.value.clean4,
        this.image1,
        this.image2,
        this.image3,
        this.image4,
        this.answers,
        this.exceptions
        )
    } else {
      obs$ = this.picturesService.create(
        this.folder,
        this.form.value.invisible,
        this.whatDo === 'newfolder' ? true : false, 
        false, 
        this.form.value.many,
        this.form.value.textForGirls,
        this.form.value.clean1,
        this.form.value.clean2,
        this.form.value.clean3,
        this.form.value.clean4,
        this.form.value.text ? this.form.value.text : '',
        this.image1,
        this.image2,
        this.image3,
        this.image4,
        this.answers,
        this.exceptions
        )
    }

    obs$.subscribe(
      picture => {
        this.picture = picture      
        this.form.enable()
        this.router.navigate([`/manage/pictures/${this.folder}`], {queryParams: {answersFolder: this.queryF}})
      },
      error => {
        alert(error.error.message)
        this.form.enable()
      }
    )
  }

}
