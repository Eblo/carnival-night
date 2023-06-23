import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebGLService {

  private shaderCache: { [id: string]: WebGLProgram } = { }

  private vertices: number[] = [
    0.0,  0.0,
    1.0,  0.0,
    0.0,  1.0,
    0.0,  1.0,
    1.0,  0.0,
    1.0,  1.0
   ];

   private position: number[] = [
     -1.0, -1.0,
      1.0, -1.0,
     -1.0,  1.0,
     -1.0,  1.0,
      1.0, -1.0,
      1.0,  1.0
   ];

   private fragmentShaders: { [id: string]: string } = {
    'default': `
        precision mediump float;
    
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        
        void main() {
          gl_FragColor = texture2D(u_image, v_texCoord);
        }`,

    'superSonic': `
        precision mediump float;
    
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        uniform int u_time;
        
        void main() {
          gl_FragColor = texture2D(u_image, v_texCoord);
          if(gl_FragColor.r == gl_FragColor.g && gl_FragColor.r > gl_FragColor.b) {
            float brightestColor = max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
            vec4 grayColor = vec4(brightestColor, brightestColor, brightestColor, gl_FragColor.a);
            float phase = sin(float(u_time) * 0.0075);
            float amount = 0.5 + 0.25 * phase;
            gl_FragColor = mix(gl_FragColor, grayColor, amount);
          }
        }`,

    'superTails': `
        precision mediump float;
    
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        uniform int u_time;
        
        void main() {
          gl_FragColor = texture2D(u_image, v_texCoord);
          if(gl_FragColor.r > 0.0 && gl_FragColor.g > 0.0 && gl_FragColor.b == 0.0) {
            float brightestColor = max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
            vec4 grayColor = vec4(brightestColor, brightestColor, brightestColor, gl_FragColor.a);
            float phase = sin(float(u_time) * 0.0067);
            float amount = 0.5 + 0.25 * phase;
            gl_FragColor = mix(gl_FragColor, grayColor, amount);
          }
        }`,

    'superKnuckles': `
        precision mediump float;

        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        uniform int u_time;
        
        void main() {
          gl_FragColor = texture2D(u_image, v_texCoord);
          if(gl_FragColor.g < gl_FragColor.r * 0.5 && gl_FragColor.b < gl_FragColor.r * 0.5 && (gl_FragColor.g > 0.0 || gl_FragColor.b > 0.0)) {
            vec4 grayColor = 1.5 * vec4(0.91, 0.6, 0.75, gl_FragColor.a);
            float phase = sin(float(u_time) * 0.0067);
            float amount = 0.5 + 0.4 * phase;
            gl_FragColor = mix(gl_FragColor, grayColor, amount);
          }
        }`,

      'superAmy': `
          precision mediump float;
    
          varying vec2 v_texCoord;
          uniform sampler2D u_image;
          uniform int u_time;
          
          void main() {
            gl_FragColor = texture2D(u_image, v_texCoord);
            if(gl_FragColor.g < gl_FragColor.r && gl_FragColor.g < gl_FragColor.b) {
              vec4 grayColor = 1.5 * vec4(0.91, 0.7, 0.91, gl_FragColor.a);
              float phase = sin(float(u_time) * 0.0067);
              float amount = 0.5 + 0.4 * phase;
              gl_FragColor = mix(gl_FragColor, grayColor, amount);
            }
          }`
   }
    
   private vertexShader: string = `
   attribute vec2 a_position;
   attribute vec2 a_texCoord;
   
   varying vec2 v_texCoord;
   
   void main() {
     gl_Position = vec4(a_position, 0, 1);
     v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
   }
   `;

  constructor() { }

  createShaderProgram(gl: WebGLRenderingContext, shader: string = 'default'): WebGLProgram {
    if(this.shaderCache[shader]) return this.shaderCache[shader];

    const program = gl.createProgram()!;
    const vertex = this.createShader(gl, program, gl.VERTEX_SHADER, this.vertexShader);
    const fragment = this.createShader(gl, program, gl.FRAGMENT_SHADER, this.fragmentShaders[shader]);
    gl.linkProgram(program);

    console.log('GL program info log:', gl.getProgramInfoLog(program));
    console.log('GL vertex shader info log:', gl.getShaderInfoLog(vertex));
    console.log('GL fragment shader info log:', gl.getShaderInfoLog(fragment));
    return program;
  }

  generateShader(gl: WebGLRenderingContext, program: WebGLProgram, texture: WebGLTexture, sprite: HTMLImageElement): void {
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position), gl.STATIC_DRAW);
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionLocation);
      
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

      const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
      gl.enableVertexAttribArray(texCoordAttributeLocation);
      gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Set Texture Data
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sprite);

      // Enable working with textures that do not have dimensions that are a power of two
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      console.log('GL context initialized', gl);
  }

  getCachedShader(name: string): WebGLProgram {
    return this.shaderCache[name];
  }

  cacheShader(name: string, program: WebGLProgram): void {
    this.shaderCache[name] = program;
  }

  private createShader(gl: WebGLRenderingContext, program: WebGLProgram, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    return shader;
  }
}
