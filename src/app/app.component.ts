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
    this.sonicCanvas.nativeElement.width = window.innerWidth * 0.9;
    this.sonicCanvas.nativeElement.height = window.innerHeight * 0.67;
    let time = Date.now();    
    this.context.clearRect(0, 0, this.sonicCanvas.nativeElement.width, this.sonicCanvas.nativeElement.height);
    let baseY = this.centerSpriteY(this.character);
    this.character.drawToCanvas(this.context, this.centerSpriteX(this.character), baseY, time);
    this.barrel.drawToCanvas(this.context, this.centerSpriteX(this.barrel), baseY+ this.character.height, time);
    requestAnimationFrame(() => this.tick());
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
