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
    this.sonicCanvas.nativeElement.width = window.innerWidth;
    this.sonicCanvas.nativeElement.height = window.innerHeight;
    let context = this.sonicCanvas.nativeElement.getContext('2d');
    // Angular will bitch if we don't do this check
    if(context != null) {
      this.context = context;
      this.context.scale(this.zoom, this.zoom);
    }
    this.tick();
  }

  tick(): void {
    let time = Date.now();    
    this.context.clearRect(0, 0, this.sonicCanvas.nativeElement.width, this.sonicCanvas.nativeElement.height);
    this.drawSprite(this.barrel, 0, this.character.sprite.height, time);
    let x = (this.barrel.width / this.barrel.frames + this.character.width / this.character.frames) / 2;
    this.drawSprite(this.character, x, 0, time);
    requestAnimationFrame(() => this.tick());
  }

  drawSprite(sprite: AnimatedSpriteComponent, x: number, y: number, time: number): void {
    sprite.animate(time);
    this.context.drawImage(sprite.sprite, sprite.width * sprite.frame, 0, sprite.width, sprite.height, x, y, sprite.width, sprite.height);
  }
}
