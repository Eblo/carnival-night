import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { runInThisContext } from 'node:vm';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private appConfig: any;
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  loadAppConfig() {
    return this.http.get('/assets/config/app-config.json')
      .toPromise()
      .then(config => {
        this.appConfig = config;
      });
  }

  getCharacterOptions(): any[] {
    return this.appConfig.characters;
  }

  getSongOptions(): any[] {
    return this.appConfig.songs;
  }

  getAbout(): string {
    return this.appConfig.about;
  }

  getBarrelSpeed(): number {
    return this.appConfig.barrelSpeed;
  }

  getBarrelAmplitude(): number {
    return this.appConfig.barrelAmplitude;
  }

  getAudioIcon(): string {
    return this.appConfig.audio.icon;
  }

  getMutedAudioIcon(): string {
    return this.appConfig.audio.mutedIcon;
  }
}
