import m4 from './matrix'
import getWebGLContext from './webglutils'
import * as dat from 'dat.gui'
import floodfill from './flood-fill'

const glsl = x => x[0] // makes the glsl-literal VS Code extention work
const sqrt3 = Math.sqrt(3.0)

// grid dimensions for projected images
const gridWidth = 20
const gridHeight = 20

class GlobalScopeClass {
  constructor () {
    this.canvas = document.createElement('canvas')
    // new global.Canvas()
    this.canvas.width = 344 * 2 // 1.5
    this.canvas.height = 216 * 2 // 1.5
    this.context = getWebGLContext(this.canvas, {
      alpha: true,
      antialias: false
    })
    this.canvases = {}
    this.openRequests = []
    this.runningAnimations = 0
  }

  loadCanvas (canvas, textureNum) {
    let tex = this.canvases[canvas]
    if (tex) return tex

    tex = this.context.loadCanvas(canvas, textureNum)
    this.imageTexture = tex
    this.canvases[canvas] = tex
    return tex
  }

  handleOpenRequests = () => {
    const requests = this.openRequests
    let totalTime = 0
    this.openRequests = []
    while (requests.length > 0) {
      const aanroep = requests.shift() // Somebody reserved callback as reserved word
      const start = window.performance.now()
      aanroep(requests.length > 8)
      const stop = window.performance.now()
      totalTime += stop - start
      if (totalTime > 14) {
        // Takes to long, rescedule
        Array.prototype.push.apply(this.openRequests, requests)
        window.requestAnimationFrame(this.handleOpenRequests)
        return
      }
      // console.log('render time: ', stop - start)
    }
  }

  requestAnimationFrame (callback) {
    // window.requestAnimationFrame(callback)

    if (callback) {
      const oldLen = this.openRequests.length
      this.openRequests.push(callback)
      if (oldLen === 0) {
        window.requestAnimationFrame(this.handleOpenRequests)
      }
    }
  }
}

let globalScope = null

function getGlobalScope () {
  if (globalScope === null) {
    globalScope = new GlobalScopeClass()
  }
  return globalScope
}

class ProjectedImage {
  // The shader that transforms the input coordinates to gl_Postion on a per vertex basis
  static vertexShader = glsl`
    attribute vec2 textureCoord;
    attribute vec4 vertexPosition;
    uniform mat4 projection;
    varying vec2 vTextureCoord; // This value wil be used in the fragment shader, webgl automaticly interpolates it for each pixel 
  
    void main(void) {
      vTextureCoord = textureCoord;
      vec4 vp = vertexPosition;
      gl_Position = projection * vp;
    }
  `

  // The shader that calculates the pixel values for the filled triangles
  static fragmentShader = glsl`
    precision mediump float;
    varying vec2 vTextureCoord;  // Interpolated version of the values set in the vertexshader
    uniform vec2 canvasResolution;
    uniform sampler2D imageTexture;
    uniform sampler2D logoTexture;
    uniform vec3 displace;
    uniform vec3 highlight;
    uniform vec3 whiteBalance;
    void main(void) {
      // get the background images from screen space which is in gl_FragCoord
      vec2 imageCoord = gl_FragCoord.xy/canvasResolution;
      imageCoord.y = 1.0 - imageCoord.y;
      vec4 imagePixel = texture2D(imageTexture, imageCoord);
  
      // Adjust from gamma value to linear
      imagePixel.rgb = pow(imagePixel.rgb,vec3(2.2));
  
      // get the logo texture coordinates
      vec2 texCoord = vTextureCoord;
  
      // get brightness from length of imagepixel
      float light = length(imagePixel.rgb);
  
      // Add displacement based on part of lightcurve
      float disp = smoothstep(displace.x,displace.y,light) * 6.283185307179586;
      texCoord.x += cos(disp) * displace.z * 0.01;
      texCoord.y += sin(disp) * displace.z * 0.01;

      // get the logo pixel and remove gamma
      vec4 logoPixel = texture2D(logoTexture, texCoord);
      logoPixel.rgb = pow(logoPixel.rgb,vec3(2.2))*whiteBalance;
  
      // logoPixel.rgb *= 0.1+2.7*(clamp(length(imagePixel.rgb)-0.8,0.0,1.0))/1.732;
  
      // Make the pixel more transparent based on lightness curve
      float a = clamp(logoPixel.a-pow(smoothstep(highlight.x,highlight.y,light),5.0)*highlight.z,0.0,1.0);
  
      // Merge the 2 pixels an apply gamma again
      gl_FragColor = vec4(pow((imagePixel.rgb*(1.0-a)+logoPixel.rgb*a),vec3(1.0/2.2)),1.0);
    }
  `

  settings = {
    curve: 0.5,
    translateX: 0.0,
    translateY: 0.0,
    translateZ: 7.0,
    fieldOfView: 90,
    rotateX: 0.0,
    rotateY: 0.0,
    rotateZ: 0.0,
    displaceStart: 0.8,
    displaceEnd: 1.0,
    displaceAmount: 0.3,
    highlightStart: 0.8,
    highlightEnd: 1.0,
    highlightAmount: 0.3,
    whiteBalanceR: 1.0,
    whiteBalanceG: 1.0,
    whiteBalanceB: 1.0
  }

  imageTexture = 0

  constructor (gl, outputCanvas, textureNum, settings, onLoad) {
    this.gl = gl
    this.textureNum = textureNum
    this.settings = { ...this.settings, ...settings }
    this.outputCanvas = outputCanvas

    this.imageAspect = 1.0
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight

    const vertexPos = new Float32Array(this.gridWidth * this.gridHeight * 3)
    const texturePos = new Float32Array(this.gridWidth * this.gridHeight * 2)

    const xMax = this.gridWidth - 1
    const yMax = this.gridHeight - 1

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const yy = this.gridHeight - y - 1
        const ofs = (y * this.gridWidth + x) * 2
        texturePos[ofs] = x / xMax
        texturePos[ofs + 1] = yy / yMax
      }
    }

    let ofs = 0
    const triangleElements = new Uint16Array(this.gridWidth * this.gridHeight * 2)
    for (let y = 0; y < this.gridHeight - 1; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        triangleElements[ofs++] = (y + 1) * this.gridWidth + x
        triangleElements[ofs++] = y * this.gridHeight + x
      }
    }

    this.vertexPos = vertexPos

    this.vertexPosB = gl.updateOrCreateFloatArray(0, vertexPos)
    this.texturePosB = gl.updateOrCreateFloatArray(0, texturePos)
    this.triangleElemB = gl.staticElementArray(triangleElements)

    if (typeof settings.imageSrc === 'object') {
      this.imageTexture = globalScope.loadCanvas(settings.imageSrc, textureNum)
      this.imageAspect = settings.imageSrc.width / settings.imageSrc.height
    } else {
      gl.loadImage(
        settings.imageSrc,
        (tex, image) => {
          this.imageTexture = tex
          this.imageAspect = image.width / image.height
          if (onLoad) {
            onLoad(this)
          }
        },
        textureNum,
        1,
        settings.dimensions
      )
    }

    this.shader = gl.getShaderProgram(ProjectedImage.vertexShader, ProjectedImage.fragmentShader)
  }

  updateCurveShape () {
    const settings = this.settings
    const vertexPos = this.vertexPos
    const xMax = this.gridWidth - 1
    const yMax = this.gridHeight - 1

    let xScale = 1.0
    let yScale = 1.0 / this.imageAspect
    if (yScale > 1.0) {
      xScale = this.imageAspect
      yScale = 1.0
    }

    if (settings.curve > 0.01) {
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          const ofs = (y * gridWidth + x) * 3
          const progress = Math.PI * 0.5 + ((x / xMax) * settings.curve - settings.curve * 0.5) * Math.PI * xScale

          vertexPos[ofs + 0] = -Math.cos(progress) / settings.curve
          vertexPos[ofs + 1] = (-0.5 + y / yMax) * Math.PI * yScale
          vertexPos[ofs + 2] = Math.sin(progress) / settings.curve
        }
      }
    } else {
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          const posOfs = (y * gridWidth + x) * 3
          vertexPos[posOfs + 0] = (-1 + (x / xMax) * 2) * xScale
          vertexPos[posOfs + 1] = (-1 + (y / yMax) * 2) * yScale
          vertexPos[posOfs + 2] = 0.0
        }
      }
    }
    this.vertexPosB = this.gl.updateOrCreateFloatArray(this.vertexPosB, vertexPos)
  }

  copyToClipboard () {
    const el = document.createElement('textarea')
    // el.style.display = 'none' // Does not work anymore if you do this
    el.value = JSON.stringify(this.settings)
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  addControls (gui, onChange) {
    const settings = this.settings
    gui.add(settings, 'curve', 0.0, 1.0).onChange(onChange)
    gui.add(settings, 'translateX', -5, 5).onChange(onChange)
    gui.add(settings, 'translateY', -5, 5).onChange(onChange)
    gui.add(settings, 'translateZ', -10, 1000).onChange(onChange)
    gui.add(settings, 'fieldOfView', 1, 180).onChange(onChange)
    gui.add(settings, 'rotateX', -180, 180).onChange(onChange)
    gui.add(settings, 'rotateY', -180, 180).onChange(onChange)
    gui.add(settings, 'rotateZ', -180, 180).onChange(onChange)
    gui.add(settings, 'displaceStart', 0.0, 1.0).onChange(onChange)
    gui.add(settings, 'displaceEnd', 0.0, 1.0).onChange(onChange)
    gui.add(settings, 'displaceAmount', 0.0, 2.0).onChange(onChange)
    gui.add(settings, 'highlightStart', 0.0, 1.0).onChange(onChange)
    gui.add(settings, 'highlightEnd', 0.0, 2.0).onChange(onChange)
    gui.add(settings, 'highlightAmount', 0.0, 3.0).onChange(onChange)
    gui.add(settings, 'whiteBalanceR', 0.5, 1.5).onChange(onChange)
    gui.add(settings, 'whiteBalanceG', 0.5, 1.5).onChange(onChange)
    gui.add(settings, 'whiteBalanceB', 0.5, 1.5).onChange(onChange)

    gui.add(this, 'copyToClipboard')
  }

  render () {
    if (this.imageTexture) {
      const gl = this.gl
      const shader = this.shader
      gl.useProgram(shader)

      this.updateCurveShape()

      const settings = this.settings

      // calculate the matrix for the logo based on the settings
      const aspect = this.outputCanvas.width / this.outputCanvas.height
      const zNear = 0
      const zFar = 2000
      let matrix = m4.perspective((settings.fieldOfView * Math.PI) / 180.0, aspect, zNear, zFar)
      matrix = m4.translate(matrix, settings.translateX, settings.translateY, -settings.translateZ)
      matrix = m4.zRotate(matrix, (settings.rotateZ * Math.PI) / 180.0)
      matrix = m4.xRotate(matrix, (settings.rotateX * Math.PI) / 180.0)
      matrix = m4.yRotate(matrix, (settings.rotateY * Math.PI) / 180.0)
      // matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

      // gl.activeTexture(gl.TEXTURE0+this.textureNum);
      // gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
      shader.u.imageTexture.set(0)

      // Bind logo texture
      gl.activeTexture(gl.TEXTURE0 + this.textureNum)
      gl.bindTexture(gl.TEXTURE_2D, this.imageTexture)
      if (typeof settings.imageSrc === 'object') {
        if (this.lastImage !== settings.imageSrc) {
          this.lastImage = settings.imageSrc
          // console.log('logo image update')
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, settings.imageSrc)
          this.imageAspect = settings.imageSrc.width / settings.imageSrc.height
        }
      }
      shader.u.logoTexture.set(this.textureNum)

      // Set the global variables for use in the shader
      shader.u.canvasResolution.set(this.outputCanvas.width, this.outputCanvas.height)

      // shader.u.canvasResolution.set(gl.drawingBufferHeight, gl.drawingBufferWidth); // these are wrong!!
      shader.u.displace.set(settings.displaceStart * sqrt3, settings.displaceEnd * sqrt3, settings.displaceAmount)
      shader.u.highlight.set(settings.highlightStart * sqrt3, settings.highlightEnd * sqrt3, settings.highlightAmount)
      shader.u.whiteBalance.set(settings.whiteBalanceR, settings.whiteBalanceG, settings.whiteBalanceB)
      shader.u.projection.set(matrix)

      // Draw the logo
      // Enable the attributes
      shader.a.textureCoord.en()
      shader.a.vertexPosition.en()

      shader.a.vertexPosition.set(this.vertexPosB, 3)
      shader.a.textureCoord.set(this.texturePosB, 2)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleElemB)
      for (let y = 0; y < gridHeight - 1; y++) {
        gl.drawElements(gl.TRIANGLE_STRIP, this.gridWidth * 2, gl.UNSIGNED_SHORT, y * 4 * this.gridWidth)
      }

      // Disable the attributes
      shader.a.textureCoord.dis()
      shader.a.vertexPosition.dis()
    }
  }
}

class PreviewRender {
  imageTexture = 0

  settings = {
    translateX: 0.0,
    translateY: 0.0,
    scale: 1.0
  }

  static clearGlobalSettings () {
    globalScope = new GlobalScopeClass()
    // console.log('clearGlobalSettings')
  }

  // The shader that transforms the input coordinates to gl_Postion on a per vertex basis
  static vertexShader = glsl`
    attribute vec4 vertexPosition;
    void main(void) {
      vec4 vp = vertexPosition;
      gl_Position = vp;
    }
  `

  // The shader that calculates the pixel values for the filled triangles
  static fragmentShader = glsl`
    precision mediump float;
    uniform vec2 canvasResolution;
    uniform vec2 imageScale;
    uniform vec2 imageOffset;
    uniform sampler2D imageTexture;
    void main(void) {
      // get the background images from screen space which is in gl_FragCoord
      vec2 imageCoord = gl_FragCoord.xy / canvasResolution;
      imageCoord.y = 1.0 - imageCoord.y;
      imageCoord = ((imageCoord - 0.5) * imageScale)+0.5;
      imageCoord += imageOffset;
      
      // return the pixel from the image at the calculated coordinates
      gl_FragColor = texture2D(imageTexture, imageCoord);
    }
  `

  constructor (screenCanvas, backgroundImageSrc, settings, backgroundSettings) {
    this.settings = { translateX: 0, translateY: 0, scale: 1.0, ...backgroundSettings }
    this.screenCanvas = screenCanvas
    // console.log('PreviewRender constructor, ', settings)

    getGlobalScope()
    this.outputCanvas = globalScope.canvas
    const gl = globalScope.context
    this.gl = gl
    // getWebGLContext(this.outputCanvas, { alpha: true })

    this.imageAspect = 0

    this.canvasTextureIx = 0
    this.imageTextureIx = 1
    this.logoTextureIx = 2
    this.texCount = 0

    this.layers = []
    if (Array.isArray(settings)) {
      for (let i = 0; i < settings.length; i++) {
        this.layers.push(
          new ProjectedImage(gl, this.outputCanvas, this.logoTextureIx + i, settings[i], () => this.render())
        )
      }
    } else {
      this.layers.push(new ProjectedImage(gl, this.outputCanvas, this.logoTextureIx, settings, () => this.render()))
    }

    // Dont draw counter clockwise triangles
    gl.enable(gl.CULL_FACE)

    // Disable the depth buffer
    gl.disable(gl.DEPTH_TEST)

    this.canvasTexture = gl.loadCanvas(this.outputCanvas, this.canvasTextureIx)
    // console.log('Canvas loaded: ', outputCanvas.width, outputCanvas.height, outputCanvas)

    if (
      backgroundSettings &&
      backgroundSettings.fillPoint &&
      backgroundSettings.fillColor &&
      backgroundSettings.fillPoint.x
    ) {
      this.loadFilledBackground(
        backgroundImageSrc,
        backgroundSettings.fillPoint,
        backgroundSettings.fillColor,
        backgroundSettings.fillTollerance
      )
    } else {
      gl.loadImage(
        backgroundImageSrc,
        (tex, image) => {
          // console.log('Image loaded: ', image.width, image.height, image)
          this.imageAspect = image.width / image.height
          this.imageTexture = tex
          this.render()
        },
        this.imageTextureIx
      )
    }

    // Create two triangles to form a square that covers the whole canvas
    const imageVertexPos = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0]
    this.imageVertexPosB = gl.updateOrCreateFloatArray(0, imageVertexPos)

    // Loade the shader program
    this.shader = gl.getShaderProgram(PreviewRender.vertexShader, PreviewRender.fragmentShader)

    this.screenCanvas.width = this.outputCanvas.width
    this.screenCanvas.height = this.outputCanvas.height
    // this.screenCanvas.width = this. screenCanvas.offsetWidth
    // this.screenCanvas.height = this.screenCanvas.offsetHeight
    this.screenContext = this.screenCanvas.getContext('2d')
  }

  loadFilledBackground (backgroundImageSrc, fillPoint, fillColor, fillTollerance) {
    const canvas = document.createElement('canvas')
    const image = new window.Image()
    image.onload = () => {
      const w = (canvas.width = image.width)
      const h = (canvas.height = image.height)
      const context = canvas.getContext('2d')

      context.drawImage(image, 0, 0, w, h)
      const imageData = context.getImageData(0, 0, w, h)
      floodfill(
        imageData.data,
        ~~(fillPoint.x * w),
        ~~(fillPoint.y * h),
        // Javascript doesn't define a default color type
        // leading to conversions between frameworks
        {
          r: fillColor[0],
          g: fillColor[1],
          b: fillColor[2],
          a: 255
        },
        fillTollerance || 35,
        w,
        h
      )
      // for (let x = 299; x < w * h - 500; x++) {
      //   imageData.data[x] = 255
      // }
      context.putImageData(imageData, 0, 0) // dirtyX, dirtyY, dirtyWidth, dirtyHeight);
      this.imageAspect = w / h
      this.imageTexture = this.gl.loadCanvas(canvas, this.imageTextureIx)
      this.render()
    }
    image.crossOrigin = 'anonymous'
    image.src = backgroundImageSrc
    return canvas
  }

  showControls () {
    const gui = (this.gui = new dat.GUI())
    const settings = this.settings
    const rerender = () => this.render()
    gui.add(settings, 'translateX', -3, 3).onChange(rerender)
    gui.add(settings, 'translateY', -3, 3).onChange(rerender)
    gui.add(settings, 'scale', -3, 3).onChange(rerender)
    gui.domElement.parentElement.style.zIndex = 10000
    for (let i = 0; i < this.layers.length; i++) {
      const sub = gui.addFolder('LAYER_' + i)
      this.layers[i].addControls(sub, rerender)
    }
    gui.add(this, 'animateRotate')
    gui.add(this, 'animateHighlight')
    return gui
  }

  animateRotate () {
    this.animate({
      param: 'rotateY',
      start: -180,
      speed: 0.05,
      stopOnDelta: 0.3
    })
  }

  animateHighlight () {
    this.animate({
      param: 'highlightEnd',
      start: this.layers[0].settings.highlightStart,
      speed: 0.01,
      stopOnDelta: 0.001
    })
  }

  animate (params) {
    let { param, start, speed, stopOnDelta, delay, goal } = params
    delay = ~~delay
    if (typeof start === 'string') {
      start = this.layers[0].settings[start]
    }
    let animateStarted = false

    this.layers[0].settings[param] = start
    const step = skipRender => {
      if (!globalScope) {
        return
      }
      if (!animateStarted) {
        if (globalScope.runningAnimations > 3) {
          globalScope.requestAnimationFrame(step)
          return
        }
        globalScope.runningAnimations++
        animateStarted = true
      }
      if (delay-- < 0) {
        this.layers[0].settings[param] = this.layers[0].settings[param] * (1.0 - speed) + goal * speed
        if (Math.abs(this.layers[0].settings[param] - goal) > stopOnDelta) {
          if (!skipRender) {
            this.render()
          }
          globalScope.requestAnimationFrame(step)
        } else {
          if (animateStarted) {
            globalScope.runningAnimations--
          }
          this.layers[0].settings[param] = goal
          this.render()
        }
      } else {
        globalScope.requestAnimationFrame(step)
      }
    }
    globalScope.requestAnimationFrame(step)
  }

  render () {
    // if (this.outputCanvas.offsetWidth <= 0) {
    //   return
    // }
    const gl = this.gl
    // this.outputCanvas.width = this.outputCanvas.offsetWidth
    // this.outputCanvas.height = this.outputCanvas.offsetHeight

    gl.viewport(0, 0, this.outputCanvas.width, this.outputCanvas.height)

    this.canvasAspect = this.outputCanvas.width / this.outputCanvas.height
    if (this.imageTexture) {
      const shader = this.shader

      // Clear existing image
      // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(shader)

      // Bind background image texture to texture 0
      gl.activeTexture(gl.TEXTURE0 + this.imageTextureIx)
      gl.bindTexture(gl.TEXTURE_2D, this.imageTexture)
      shader.u.imageTexture.set(this.imageTextureIx)

      shader.u.canvasResolution.set(this.outputCanvas.width, this.outputCanvas.height)
      // Set the global variables for use in the shader
      if (this.canvasAspect < this.imageAspect) {
        shader.u.imageScale.set((this.canvasAspect / this.imageAspect) * this.settings.scale, this.settings.scale)
      } else {
        shader.u.imageScale.set(this.settings.scale, (this.imageAspect / this.canvasAspect) * this.settings.scale)
      }
      shader.u.imageOffset.set(this.settings.translateX, this.settings.translateY)

      // Enable the attributes for the vertex shader and give it our coordinates
      shader.a.vertexPosition.en()
      shader.a.vertexPosition.set(this.imageVertexPosB, 3 /* elements per vertex */)
      // uniform vec2 imageScale;
      // uniform vec2 imageOffset;

      // Draw triangles from 4 points in a strip this gives 2 triangles 123 and 234
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // Finished, disable the attributes
      shader.a.vertexPosition.dis()

      for (let i = 0; i < this.layers.length; i++) {
        // Bind background texture
        gl.activeTexture(gl.TEXTURE0 + this.canvasTextureIx)
        gl.bindTexture(gl.TEXTURE_2D, this.canvasTexture)

        // update background texture
        if (this.texCount < 3) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.outputCanvas)
          this.texCount++
        }
        this.layers[i].render()
      }

      // this.screenContext.fillText(this.texCount++, 10, 10)
      this.screenContext.drawImage(this.outputCanvas, 0, 0) // , this.screenCanvas.width, this.screenCanvas.height)
    }
  }
}

export default PreviewRender
