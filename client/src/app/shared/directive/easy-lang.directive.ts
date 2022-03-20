import { Directive, ElementRef, AfterViewInit, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavService } from '../services/nav.service';

@Directive({
  selector: '[appEasyLang]'
})
export class EasyLangDirective implements AfterViewInit, OnDestroy {

  @Input() appEasyLang
  navSub: Subscription
  text

  constructor(
    private elementRef: ElementRef,
    private navService: NavService,
  ) {
    this.navSub = this.navService.newSettings.subscribe((user) => {
      if (this.appEasyLang.easyLang != user.easyLang || this.appEasyLang.invert != user.invert) {
        this.appEasyLang = user
        this.render()
      }
    })
  }
  

  ngAfterViewInit() {
    this.text = this.elementRef.nativeElement.innerText
    this.render()
  }

  render() {
    let str = this.text
    if (this.appEasyLang && this.appEasyLang.easyLang) {
      str = str.toUpperCase()

      if (this.appEasyLang && !this.appEasyLang.invert) {
        str = str.replaceAll('А', "<span class='red'>А</span>").replaceAll('О', "<span class='red'>О</span>")
        .replaceAll('У', "<span class='red'>У</span>").replaceAll('Ы', "<span class='red'>Ы</span>")
        .replaceAll('Ю', "<span class='red'>Ю</span>").replaceAll('Ё', "<span class='red'>Ё</span>")
        .replaceAll('Э', "<span class='red'>Э</span>").replaceAll('Я', "<span class='red'>Я</span>")
        .replaceAll('И', "<span class='red'>И</span>").replaceAll('Е', "<span class='red'>Е</span>")
      }
    }
    this.elementRef.nativeElement.innerHTML = str
  }

  ngOnDestroy(): void {
      this.navSub.unsubscribe()
  }
}
