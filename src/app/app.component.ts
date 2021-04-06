import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { AnimatedSpriteComponent } from './animated-sprite/animated-sprite.component';
import { AppConfigService } from './app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'carnival-night';

  @ViewChild('sonicCanvas') sonicCanvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;

  @ViewChild('bgm') audio!: ElementRef;
  audioIcon: string = '/assets/audiomute.png';

  @ViewChild('characterSprite') characterSprite!: AnimatedSpriteComponent;
  @ViewChild('barrelSprite') barrel!: AnimatedSpriteComponent;

  zoom: number = 1;

  barrelSpeed: number;
  barrelPos: number = 0;
  barrelAmplitude: number;

  character: string;
  songSource: string;
  about: any;
  appConfigService: AppConfigService;

  aboutVisible = false;

  constructor(appConfigService: AppConfigService) {
    this.appConfigService = appConfigService;
    this.character = this.appConfigService.getRandomCharacter();
    this.songSource = this.appConfigService.getSongSource();
    this.barrelSpeed = this.appConfigService.getBarrelSpeed();
    this.barrelAmplitude = this.appConfigService.getBarrelAmplitude();
    this.about = this.appConfigService.getAbout();
  }

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
    this.sonicCanvas.nativeElement.width = window.innerWidth;
    this.sonicCanvas.nativeElement.height = window.innerHeight;
    let time = Date.now();    
    this.context.clearRect(0, 0, this.sonicCanvas.nativeElement.width, this.sonicCanvas.nativeElement.height);
    this.advanceBounce(time);
    let baseY = this.centerSpriteY(this.barrel) + this.characterSprite.height + this.barrelPos;
    this.barrel.drawToCanvas(this.context, this.centerSpriteX(this.barrel), baseY, time);
    this.characterSprite.drawToCanvas(this.context, this.centerSpriteX(this.characterSprite), baseY-this.characterSprite.height, time);
    requestAnimationFrame(() => this.tick());
  }

  advanceBounce(time: number): void {
    this.barrelPos = this.barrelAmplitude * Math.cos(this.barrelSpeed * time);
  }

  centerSpriteX(sprite: AnimatedSpriteComponent): number {
    return (this.sonicCanvas.nativeElement.width - sprite.width / sprite.frames) / 2;
  }

  centerSpriteY(sprite: AnimatedSpriteComponent): number {
    return (this.sonicCanvas.nativeElement.height - sprite.height) / 4;
  }

  characterPosition(): number {
    // TODO: This would be used for the character's position on the barrel. Farther from the center
    // means horizontal movement
    return 0;
  }

  toggleAbout(): void {
    this.aboutVisible = !this.aboutVisible;
  }

  toggleAudio(): void {
    if(this.audio.nativeElement.paused) {
      this.audio.nativeElement.play();
      this.audioIcon = this.appConfigService.getAudioIcon();
    } else {      
      this.audio.nativeElement.muted = !this.audio.nativeElement.muted;
      this.audioIcon = this.audio.nativeElement.muted ? this.appConfigService.getMutedAudioIcon() : this.appConfigService.getAudioIcon();
    }
  }

}
