import { Component, OnDestroy, OnInit } from '@angular/core';
import { Institution, Region, User } from '../shared/interfaces';
import { Observable, Subscription } from 'rxjs';
import {InstitutionsService} from '../shared/services/institutions.service'
import { LoginService } from '../shared/services/login.service'
import { RegionsService } from '../shared/services/region.service'
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-institutions-page',
  templateUrl: './institutions-page.component.html',
  styleUrls: ['./institutions-page.component.css']
})
export class InstitutionsPageComponent implements OnInit, OnDestroy {

  loading = false
  reloading = false
  institutions$: Subscription
  regions$: Subscription
  institutions: Institution[] = []
  regions: Region[] = []
  id: string
  session$: Observable<User>
  form: FormGroup
  region: string = ''

  constructor(private institutionsService: InstitutionsService,
    private regionsService: RegionsService,
    private loginService: LoginService) {}

  ngOnInit(): void {
    this.reloading = true
    this.form = new FormGroup({
      name: new FormControl('')
    })
    this.session$ = this.loginService.getUser()
    this.institutions$ = this.institutionsService.fetch().subscribe(institutions => {
      this.institutions = institutions
      this.reloading = false
      this.regions$ = this.regionsService.fetch({count: true}).subscribe(regions => {
        this.regions = regions
      })
    })
  }

  onFilter() {
    this.reloading = true
    const region = this.regions.find(reg => reg._id == this.region)
    if (region) this.form.patchValue({name: region.name})
    const params: any = {} 
    if (this.region) params.region = this.region
    this.institutions$ = this.institutionsService.fetch(params).subscribe(institutions => {
      this.institutions = institutions
      this.reloading = false
    })
  }

  round(num) {
    return Math.round(num)
  }

  update() {
    if (this.form.value.name && this.region) {
      this.regionsService.update(this.region, this.form.value).subscribe(region => {
        const new_region = this.regions.find(reg => reg._id == region._id)
        new_region.name = region.name
        this.loading = true
        this.institutions$ = this.institutionsService.fetch({region: region._id}).subscribe(institutions => {
          this.institutions = institutions
          this.loading = false
        })
      })
    }
  }

  findRegion(id) {
    const region = this.regions.find(reg => reg._id == id)
    if (region) return region.name
  }

  ngOnDestroy(): void {
      if (this.institutions$) this.institutions$.unsubscribe()
      if (this.regions$) this.regions$.unsubscribe()
  }
}
