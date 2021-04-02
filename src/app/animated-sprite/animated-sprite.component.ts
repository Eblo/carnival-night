import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-animated-sprite',
  templateUrl: './animated-sprite.component.html',
  styleUrls: ['./animated-sprite.component.css']
})
export class AnimatedSpriteComponent implements OnInit {

  @Input() graphic: string = '';
  @Input() frames: number = 0;
  @Input() frameRate: number = 0;
  frame: number = 0;
  width: number = 0;
  height: number = 0;

  currentTime: number = Date.now();
  frameDuration: number = 0; // TODO: May also depend on character's distance from barrel and if it moves
  // Barrel reference: https://youtu.be/dZQy1vO1naQ?t=2421

  sprite = new Image();


  constructor() { }

  ngOnInit(): void {
    this.sprite.src = this.graphic;
    this.frameDuration = 1000 / this.frameRate;
    this.width = this.sprite.width / this.frames;
    this.height = this.sprite.height;
  }

  animate(newTime: number) {
   let elapsedTime = newTime - this.currentTime;       
    // This lets us keep the frame rate consistent regardless of refresh rate
    if((elapsedTime) >= this.frameDuration) {
      this.currentTime = newTime;
      if( (this.frame++) >= this.frames - 1) {
        this.frame = 0;
      }
    }
  }

}
