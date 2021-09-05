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
  rootEditId: string = null
  childEditId: string = null

  constructor(private tableService: TableService,
    private loginService: LoginService) { }

  ngOnInit(): void {
    this.reloading = true
    this.session$ = this.loginService.getUser()
    this.rootForm = new FormGroup({
      item: new FormControl('', Validators.required)
    })
    this.childForm = new FormGroup({
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

    if (!this.rootEditId) {
      this.tableService.create(this.rootForm.value.item, this.rootImage).subscribe(
        item => {
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
    } else {
      this.tableService.update(this.rootEditId, this.rootForm.value.item, this.rootImage).subscribe(
        newItem => {
          this.items = this.items.map(item => item._id === this.rootEditId ? newItem : item)
          this.rootItems = this.items.filter(item => !item.parent)
          this.rootForm.reset()
          this.rootImage = null
          this.rootEditId = null
          this.rootForm.enable()
        },
        error => {
          console.log(error.error.message)
          this.rootForm.enable()
        }
      )
    }
  }

  newChildItem() {
    
    this.childForm.disable()

    if (!this.childEditId) {
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
    } else {
      this.tableService.update(this.childEditId, this.childForm.value.item, this.childImage, this.check).subscribe(
        newItem => {
          this.items = this.items.filter(item => item.parent == this.check)
          this.childItems = this.childItems.map(item => item._id === this.childEditId ? newItem : item)
          this.childForm.reset()
          this.childImage = null
          this.childEditId = null
          this.childForm.enable()
        },
        error => {
          console.log(error.error.message)
          this.rootForm.enable()
        }
      )
    }
  }

  editRoot(item) {
    this.rootForm.patchValue({item: item.item})
    this.rootEditId = item._id
    this.rootPreview = item.src
    document.getElementById('rootScroll').scrollIntoView(true)
  }

  editChild(item) {
    this.childForm.patchValue({item: item.item})
    this.childEditId = item._id
    this.childPreview = item.src
    document.getElementById('childScroll').scrollIntoView(true)
  }

  deleteRoot(id, item) {
    const decision = window.confirm(`Вы уверены, что хотите удалить пункт ${item}?`)

    if (decision) {
      this.tableService.delete(id)
        .subscribe(
          response => {
            this.rootItems = this.rootItems.filter(item => item._id !== id)
            this.check = null
          },
          error => {console.log(error.error.message)}
        )
    }
  }

  deleteChild(id, item) {
    const decision = window.confirm(`Вы уверены, что хотите удалить пункт ${item}?`)

    if (decision) {
      this.tableService.delete(id)
        .subscribe(
          response => {
            this.childItems = this.childItems.filter(item => item._id !== id)
          },
          error => {console.log(error.error.message)}
        )
    }
  }

  ngOnDestroy() {
    this.oSub$.unsubscribe()
  }

}
