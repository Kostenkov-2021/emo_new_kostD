import { Component, OnInit, OnDestroy } from '@angular/core';
import { TableService } from '../shared/services/table.service';
import { LoginService } from '../shared/services/login.service';
import { Observable, Subscription } from 'rxjs';
import { User, TBItem } from '../shared/interfaces';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-table-page',
  templateUrl: './admin-table-page.component.html',
  styleUrls: ['./admin-table-page.component.css']
})
export class AdminTablePageComponent implements OnInit, OnDestroy {

  session$: Observable<User>
  oSub$: Subscription
  items: TBItem[]
  check = ''
  reloading = false
  rootItems: TBItem[]
  childItems: TBItem[]
  rootForm: FormGroup
  childForm: FormGroup
  rootImage: File
  childImage: File
  rootPreview = ''
  childPreview = ''

  constructor(private tableService: TableService,
    private loginService: LoginService) { }

  ngOnInit(): void {
    this.reloading = true
    this.session$ = this.loginService.getUser()
    this.rootForm = new FormGroup({
      img: new FormControl(null),
      item: new FormControl('', Validators.required)
    })
    this.childForm = new FormGroup({
      img: new FormControl(null),
      item: new FormControl('', Validators.required)
    })
    this.oSub$ = this.tableService.fetch().subscribe(items => {
      this.items = items
      this.rootItems = items.filter(item => !item.parent)
      this.reloading = false
    })
  }

  onRootFileUpload(event: any) {
    const file = event.target.files[0]
    this.rootImage = file
    const reader = new FileReader()
    reader.onload = () => {
      this.rootPreview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }

  onChildFileUpload(event: any) {
    const file = event.target.files[0]
    this.childImage = file
    const reader = new FileReader()
    reader.onload = () => {
      this.childPreview = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }

  checkItem(id) {
    this.childItems = this.items.filter(item => item.parent == id)
    this.check = id
  }

  newRootItem() {
    this.rootForm.disable()

    this.tableService.create(this.rootForm.value.item, this.rootImage).subscribe(
      item => {
        console.log(item)
        this.rootItems.push(item)
        this.rootForm.reset()
        this.rootImage = null
        this.rootForm.enable()
      },
      error => {
        console.log(error.error.message)
        this.rootForm.enable()
      }
    )
  }

  newChildItem() {
    this.childForm.disable()

    this.tableService.create(this.childForm.value.item, this.childImage, this.check).subscribe(
      item => {
        this.items.push(item)
        this.childItems = this.items.filter(item => item.parent == this.check)
        this.childForm.reset()
        this.childImage = null
        this.childForm.enable()
      },
      error => {
        console.log(error.error.message)
        this.rootForm.enable()
      }
    )
  }

  ngOnDestroy() {
    this.oSub$.unsubscribe()
  }

}
