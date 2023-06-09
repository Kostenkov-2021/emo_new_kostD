import { Component, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { User } from '../../interfaces';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-record-audio',
  templateUrl: './record-audio.component.html',
  styleUrls: ['./record-audio.component.css']
})
export class RecordAudioComponent implements OnInit {

  @Input() group: string
  @Input() session: User
  @Output() audio = new EventEmitter<any[]>()

  recording = false
  mediaRecorder: MediaRecorder
  reloading = false
  chunks: Blob[] = []

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.reloading = true
    this.record()
  }

  record() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      
        const constraints = { audio: true };
        const options = {mimeType : 'audio/webm'}
        
        this.reloading = false
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream, options);
          this.mediaRecorder.start(200);
          this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data)
            
          this.recording = true
        }, (err) => console.log('The following error occured: ' + err));
   } else {
      console.log('navigator.mediaDevices', navigator.mediaDevices)
      console.log('getUserMedia not supported on your browser!');
   }
  }

  pause() {
    this.mediaRecorder.pause()
    this.recording = false
  }

  resume() {
    this.mediaRecorder.resume()
    this.recording = true
  }

  break() {
    this.mediaRecorder.stop()
    this.recording = false
    this.audio.emit([false])
  }

  exit() {
    this.audio.emit([false])
  }

  stop(send) {
    this.mediaRecorder.stop()
    this.recording = false
    const blob = new Blob(this.chunks, {'type': 'audio/webm'})
    
    if (this.group == "true") {
      this.chatService.newVoteInGroup(blob).subscribe(vote => {
        if (send) {
          this.audio.emit([true, true, vote])
        }
        else {
          this.audio.emit([true, false, vote])
        }
      }) 
    }
    else {
      this.chatService.newVote(blob).subscribe(vote => {
        if (send) {
          this.audio.emit([true, true, vote])
        }
        else {
          this.audio.emit([true, false, vote])
        }
      })  
    }
     
  }

}
