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
  ready: boolean = false;
  // Barrel reference: https://youtu.be/dZQy1vO1naQ?t=2421

  sprite!: HTMLImageElement;


  constructor() { }

  ngOnInit(): void {
    this.sprite = new Image();
    this.sprite.onload = () => {
      this.frameDuration = 1000 / this.frameRate;
      this.width = this.sprite.width / this.frames;
      this.height = this.sprite.height;
      this.ready = true;
    };
    this.sprite.src = this.graphic;
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

  drawToCanvas(context: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    if(this.ready == false) {
      return;
    }
    this.sprite.src = this.graphic;
    this.animate(time);
    context.drawImage(this.sprite, this.width * this.frame, 0, this.width, this.height, x, y, this.width, this.height);
  }

}
