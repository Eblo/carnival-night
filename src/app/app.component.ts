import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { AnimatedSpriteComponent } from './animated-sprite/animated-sprite.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'carnival-night';

  @ViewChild('sonicCanvas') sonicCanvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;

  @ViewChild('characterSprite') character!: AnimatedSpriteComponent;
  @ViewChild('barrelSprite') barrel!: AnimatedSpriteComponent;

  zoom: number = 1;
  currentTime = Date.now();

  barrelConstant: number = 1.0;
  barrelBaseline: number = 0;
  barrelSpeed: number = 0.0;
  barrelPos: number = 0;
  maxBarrelPos: number = 100;
  minBarrelPos: number = -100;
  barrelAcceleration: number = 0.075;

  songSource: string = 'https://a.tumblr.com/tumblr_m7h6wq4sy31rau0lpo1.mp3'; // TODO: Make this a config property

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let context = this.sonicCanvas.nativeElement.getContext('2d');
    // Angular will bitch if we don't do this check
    if(context != null) {
      this.context = context;
      this.context.scale(this.zoom, this.zoom);
      this.tick();
    }
  }

  tick(): void {
    this.sonicCanvas.nativeElement.width = window.innerWidth * 0.95;
    this.sonicCanvas.nativeElement.height = window.innerHeight * 0.90;
    let time = Date.now();    
    this.context.clearRect(0, 0, this.sonicCanvas.nativeElement.width, this.sonicCanvas.nativeElement.height);
    this.advanceBounce(time);
    let baseY = this.centerSpriteY(this.barrel) + this.character.height + this.barrelPos;
    this.barrel.drawToCanvas(this.context, this.centerSpriteX(this.barrel), baseY, time);
    this.character.drawToCanvas(this.context, this.centerSpriteX(this.character), baseY-this.character.height, time);
    requestAnimationFrame(() => this.tick());
  }

  advanceBounce(time: number): void {
    let elapsedTime = time - this.currentTime;
    this.currentTime = time;
    this.barrelPos = Math.max(this.minBarrelPos, Math.min(elapsedTime * this.barrelSpeed, this.maxBarrelPos));
    this.barrelSpeed += elapsedTime * this.barrelAcceleration;
    if((this.barrelPos == this.maxBarrelPos && this.barrelAcceleration > 0) ||
        (this.barrelPos == this.minBarrelPos && this.barrelAcceleration < 0)) {
      this.barrelAcceleration *= -1;
    }
  }

  centerSpriteX(sprite: AnimatedSpriteComponent): number {
    return (this.sonicCanvas.nativeElement.width - sprite.width / sprite.frames) / 2;
  }

  centerSpriteY(sprite: AnimatedSpriteComponent): number {
    return (this.sonicCanvas.nativeElement.height - sprite.height) / 2;
  }

  characterPosition(): number {
    return 0;
  }
}
