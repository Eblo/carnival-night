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

  @ViewChild('sceneCanvas') sceneCanvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;

  @ViewChild('bgm') audio!: ElementRef;
  audioIcon: string;

  @ViewChild('characterSprite') characterSprite!: AnimatedSpriteComponent;
  @ViewChild('barrelSprite') barrel!: AnimatedSpriteComponent;

  zoom: number = 1;

  barrelSpeed: number;
  barrelPos: number = 0;
  barrelAmplitude: number;

  currentCharacter: any;
  characterOptions: any[];
  songOptions: any[] = [];
  currentSong: any;
  about: any;
  appConfigService: AppConfigService;

  aboutVisible = false;
  optionsVisible = false;

  constructor(appConfigService: AppConfigService) {
    this.appConfigService = appConfigService;
    this.characterOptions = this.appConfigService.getCharacterOptions();
    this.characterOptions.forEach(c => c.class = "disabled");
    this.setCharacter(this.characterOptions[Math.floor((Math.random()*this.characterOptions.length))]);
    this.initializeAudio();
    this.barrelSpeed = this.appConfigService.getBarrelSpeed();
    this.barrelAmplitude = this.appConfigService.getBarrelAmplitude();
    this.about = this.appConfigService.getAbout();
    this.audioIcon = this.appConfigService.getMutedAudioIcon();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const context = this.sceneCanvas.nativeElement.getContext('2d');
    this.context = context!;
    this.context.scale(this.zoom, this.zoom);
    this.tick();
  }

  tick(): void {
    this.sceneCanvas.nativeElement.width = window.innerWidth;
    this.sceneCanvas.nativeElement.height = window.innerHeight;
    let time = performance.now();
    this.context.clearRect(0, 0, this.sceneCanvas.nativeElement.width, this.sceneCanvas.nativeElement.height);
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
    return (this.sceneCanvas.nativeElement.width - sprite.width / sprite.frames) / 2;
  }

  centerSpriteY(sprite: AnimatedSpriteComponent): number {
    return (this.sceneCanvas.nativeElement.height - sprite.height) / 4;
  }

  characterPosition(): number {
    // TODO: This would be used for the character's position on the barrel. Farther from the center
    // means horizontal movement
    return 0;
  }

  toggleAbout(): void {
    this.aboutVisible = !this.aboutVisible;
    this.optionsVisible = false;
  }

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
    this.aboutVisible = false;
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

  setCharacter(character: any): void {
    if(this.currentCharacter === character) {
      // Selected same character, so toggle the super form
      this.characterSprite.toggleSuperForm();
    } else {
      // Selected different character
      if(this.currentCharacter) this.currentCharacter.class = "disabled";
      this.currentCharacter = character;
      this.currentCharacter.class = "enabled";
    }
  }

  setSong(song: any): void {
    if(this.currentSong === song) return;
    if(this.currentSong) this.currentSong.class = "disabled";
    this.currentSong = song;
    this.currentSong.class = "enabled";
    if(this.audio?.nativeElement) {
      this.audio.nativeElement.setAttribute('src', this.currentSong.source);
      this.audio.nativeElement.pause();
      this.audio.nativeElement.play();
      this.audioIcon = this.appConfigService.getAudioIcon();
    }
  }

  initializeAudio(): void {
    this.songOptions = this.appConfigService.getSongOptions();
    this.songOptions.forEach(song => song.class = "disabled");

    // Perform a weighted sample
    const totalWeight = this.songOptions.reduce((sum, song) => sum + song.weight, 0);
    const randomWeight = Math.random() * totalWeight;    
    let firstSong = null;
    let accumulatedWeight = 0;    
    for (const song of this.songOptions) {
      accumulatedWeight += song.weight;
    
      if (randomWeight <= accumulatedWeight) {
        firstSong = song;
        break;
      }
    }    
    this.setSong(firstSong);
  }

}
