import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { WebGLService } from '../web-gl.service';

@Component({
  selector: 'app-animated-sprite',
  templateUrl: './animated-sprite.component.html',
  styleUrls: ['./animated-sprite.component.css']
})
export class AnimatedSpriteComponent implements OnInit {

  @Input() normalGraphic: string = '';
  @Input() superGraphic: string = null!;
  currentGraphic: string = ''; // The graphic currently used between the above two
  superMode: boolean = false;

  @Input() frames: number = 0;
  @Input() frameRate: number = 0;
  @Input() superShader: string = null!; // Shader used for super form color palette rotation
  frame: number = 0;
  width: number = 0;
  height: number = 0;
  zoom: number = 3.0; // TODO: Config property? Scale to screen?

  @ViewChild('webGlCanvas') webGlCanvas!: ElementRef<HTMLCanvasElement>;

  currentTime: number = 0;
  frameDuration: number = 0;
  ready: boolean = false;
  // Barrel reference: https://youtu.be/dZQy1vO1naQ?t=2421

  sprite!: HTMLImageElement;
  texture!: WebGLTexture;
  gl!: WebGLRenderingContext;

  program!: WebGLProgram;
  superShaderProgram!: WebGLProgram;
  activeProgram: WebGLProgram = this.program;
  webGLService: WebGLService;

  constructor(webGLService: WebGLService) {
    this.webGLService = webGLService;
  }

  ngOnInit(): void {
    this.sprite = new Image();
    this.sprite.onload = () => {
      this.frameDuration = 1000.0 / this.frameRate;
      this.width = this.zoom * this.sprite.width / this.frames;
      this.height = this.zoom * this.sprite.height;
      this.ready = true;

      const existingProgram = this.webGLService.getCachedShader(this.normalGraphic);

      // We already have a shader for this graphic, so load that and return
      if(existingProgram != null) {
        this.program = existingProgram;
        if(this.superShader) {
          this.superShaderProgram = this.webGLService.getCachedShader(this.superShader);
        }
        this.activeProgram = this.superMode ? this.superShaderProgram : this.program;
        this.gl.useProgram(this.activeProgram);
        return;
      }

      const canvasElement = this.webGlCanvas.nativeElement;
      canvasElement.width = this.sprite.width * this.zoom;
      canvasElement.height = this.sprite.height * this.zoom;

      this.gl = canvasElement.getContext('webgl')!;
      if(this.gl) {        
        this.gl.clearColor(1.0, 0.0, 0.0, 0.01);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.activeProgram = this.program = this.webGLService.createShaderProgram(this.gl);
        this.gl.useProgram(this.activeProgram);
        if(this.superShader != null) {
          this.superShaderProgram = this.webGLService.createShaderProgram(this.gl, this.superShader);
          this.webGLService.cacheShader(this.superShader, this.superShaderProgram);
        }
        this.texture = this.gl.createTexture()!;
        this.webGLService.generateShader(this.gl, this.program, this.texture, this.sprite);
        this.webGLService.cacheShader(this.normalGraphic, this.program);
      } else {
        console.error('NO WAY! NO WAY?');
      }
    };
    this.sprite.src = this.currentGraphic = this.normalGraphic;
  }

  drawToCanvas(context: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    if(this.ready == false) {
      return;
    }
    // Input binding character mess to make the sprite graphic change event fire
    if(this.currentGraphic !== this.superGraphic && this.currentGraphic !== this.normalGraphic) {
      this.superMode = false;
      this.activeProgram = this.program;
      this.gl.useProgram(this.activeProgram);
      this.sprite.src = this.currentGraphic = this.normalGraphic;
    }
    this.glDraw(time);
    this.animate(time);
    context.drawImage(this.webGlCanvas.nativeElement, this.width * this.frame, 0, this.width, this.height, x, y, this.width, this.height);
  }

  toggleSuperForm(): void {
    if(this.superMode) {
      this.superMode = false;
      this.activeProgram = this.program;
      this.sprite.src = this.currentGraphic = this.normalGraphic;
    } else {
      this.superMode = true;
      if(this.superGraphic) this.sprite.src = this.currentGraphic = this.superGraphic;
      this.activeProgram = this.superShaderProgram;
    }
    this.gl.useProgram(this.activeProgram);
  }

  private animate(newTime: number) {
   const elapsedTime = newTime - this.currentTime;       
    // This lets us keep the frame rate consistent regardless of refresh rate
    if((elapsedTime) >= this.frameDuration) {
      this.currentTime = newTime;
      if( (this.frame++) >= this.frames - 1) {
        this.frame = 0;
      }
    }
  }

  private glDraw(time: number): void {
    // This would be necessary if the character sprites ever have different dimensions, or if the zoom level changes
    // this.gl.viewport(0, 0, this.sprite.width * this.zoom, this.sprite.height * this.zoom);

    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.sprite);

    const timeUniformLocation = this.gl.getUniformLocation(this.activeProgram, 'u_time');
    this.gl.uniform1i(timeUniformLocation, time);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

}
