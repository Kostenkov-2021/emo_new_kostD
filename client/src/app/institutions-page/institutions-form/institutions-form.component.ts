import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { InstitutionsService } from 'src/app/shared/services/institutions.service';
import { of, Observable } from 'rxjs';
import { Institution, Region, User } from 'src/app/shared/interfaces';
import { LoginService } from 'src/app/shared/services/login.service';
import { RegionsService } from 'src/app/shared/services/region.service';

@Component({
  selector: 'app-institutions-form',
  templateUrl: './institutions-form.component.html',
  styleUrls: ['./institutions-form.component.css']
})
export class InstitutionsFormComponent implements OnInit {

  form: FormGroup
  whatDo = ''
  session$: Observable<User>
  image: File
  imagePreview = ''
  regions$: Observable<Region[]>

  constructor(private route: ActivatedRoute,
    private regionsService: RegionsService,
    private institutionsService: InstitutionsService,
    private router: Router,
    private loginService: LoginService) { }

  ngOnInit(): void {
    this.session$ = this.loginService.getUser()

    this.form = new FormGroup({
      region: new FormControl('', Validators.required),
      new_region: new FormControl(''),
      name: new FormControl(null, Validators.required)
    })

    this.regions$ = this.regionsService.fetch({})

    this.form.disable()

    this.route.params
    .pipe(
      switchMap(
        (params: Params) => {
          this.whatDo = params['do']
          if (this.whatDo !== 'new') {
            return this.institutionsService.getById(this.whatDo)
          }
          return of(null)
        }
      )
    )
    .subscribe(
      (institution: Institution) => {
        if (institution) {
          this.form.patchValue({
            name: institution.name,
            region: institution.region ? institution.region : ''
          })
          if (institution.img) this.imagePreview = institution.img
        }
      }
    )

    this.form.enable()
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
    if (this.form.value.region === 'add' || this.form.value.new_region) this.saveRegion()
    else if (this.form.value.region != 'add') this.saveInstitution()
    else alert("Укажите учреждение")
  }

  saveRegion() {
    this.regionsService.create({name: this.form.value.new_region}).subscribe(region => {
      this.form.patchValue({region: region._id})
      this.saveInstitution()
    })
  }

  saveInstitution() {
    let obs$
    this.form.disable()
    if (this.whatDo == 'new') {
      obs$ = this.institutionsService.create(this.form.value.name, this.form.value.region, this.image)
    }
    else {
      obs$ = this.institutionsService.update(this.whatDo, this.form.value.name, this.form.value.region, this.image)
    }
    obs$.subscribe(
      institution => {    
        this.form.enable()
        this.router.navigate([`/manage/institutions`])
      },
      error => {
        alert(error.error.message)
        this.form.enable()
      }
    )  
  }

}
