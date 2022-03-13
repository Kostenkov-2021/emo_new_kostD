import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-picture-zoom',
  templateUrl: './picture-zoom.component.html',
  styleUrls: ['./picture-zoom.component.css']
})
export class PictureZoomComponent implements AfterViewInit {

  @Input() image: string
  @Input() text_top: string
  @Input() text_bottom: string
  @Output() result = new EventEmitter<boolean>()

  @ViewChild('bottom') bottom: ElementRef
  @ViewChild('top') top: ElementRef
  @ViewChild('img') img: ElementRef<HTMLElement>

  ngAfterViewInit(): void {
    const th = this.top.nativeElement.offsetHeight
    const bh = this.bottom.nativeElement.offsetHeight
    this.img.nativeElement.setAttribute('style', `height: calc(${this.img.nativeElement.offsetHeight}px - ${th}px - ${bh}px - 6px);`)
  }

  close() {
    this.result.emit(true)
  }
}
