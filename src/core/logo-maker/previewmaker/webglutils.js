function AddUtilsToContext (context) {
  context.getShader = function (str, shaderType) {
    const sdr = this.createShader(shaderType)
    this.shaderSource(sdr, str)
    this.compileShader(sdr)
    if (!this.getShaderParameter(sdr, this.COMPILE_STATUS)) {
      const m = /ERROR: [\d]+:([\d]+): (.+)/gim.exec(this.getShaderInfoLog(sdr))
      console.log('shadererror "[' + m[1] + ']"\r\n' + str.split('\n')[m[1] - 1] + '\r\n' + m[2])
    }
    return sdr
  }
  const uniformSetters = new function () {
    const t = this
    t.f = function (fnc, UL, gl) {
      const ul = UL
      const g = gl
      return function (x, y, z, w) {
        g['uniform' + fnc](ul, x, y, z, w)
      }
    }
    t.m = function (fnc, UL, gl) {
      const ul = UL
      const g = gl
      return function (x) {
        g['uniformMatrix' + fnc](ul, false, x)
      }
    }
    t[0x8b50] = t.f.bind(t, '2f')
    t[0x8b51] = t.f.bind(t, '3f')
    t[0x8b52] = t.f.bind(t, '4f')
    t[0x8b57] = t[0x8b53] = t.f.bind(this, '2i')
    t[0x8b58] = t[0x8b54] = t.f.bind(this, '3i')
    t[0x8b59] = t[0x8b55] = t.f.bind(this, '4i')
    t[0x8b5a] = t.m.bind(t, '2fv')
    t[0x8b5b] = t.m.bind(t, '3fv')
    t[0x8b5c] = t.m.bind(t, '4fv')
    t[0x8b56] = t[0x8b5e] = t[0x8b60] = t[0x1400] = t[0x1401] = t[0x1402] = t[0x1403] = t[0x1404] = t[0x1405] = t.f.bind(
      t,
      '1i'
    )
    t[0x1406] = t.f.bind(t, '1f')
  }()
  context.loadUniforms = function (shaderProgram) {
    shaderProgram.u = {}
    shaderProgram.a = {}
    const uniformCount = this.getProgramParameter(shaderProgram, this.ACTIVE_UNIFORMS)
    for (let i = 0; i < uniformCount; ++i) {
      const uniformInfo = this.getActiveUniform(shaderProgram, i)
      const uniformLoc = this.getUniformLocation(shaderProgram, uniformInfo.name)
      shaderProgram.u[uniformInfo.name] = uniformLoc
      if (Object.hasOwnProperty.call(uniformSetters, uniformInfo.type)) {
        shaderProgram.u[uniformInfo.name].set = uniformSetters[uniformInfo.type](uniformLoc, this)
      }
    }
    const attribCount = this.getProgramParameter(shaderProgram, this.ACTIVE_ATTRIBUTES)
    for (let i = 0; i < attribCount; ++i) {
      const attribInfo = this.getActiveAttrib(shaderProgram, i)
      const attribLoc = this.getAttribLocation(shaderProgram, attribInfo.name)

      // eslint-disable-next-line no-new-wrappers
      shaderProgram.a[attribInfo.name] = new Number(attribLoc) // IT NEEDS TO BE A NUMBER OBJECT, I DO THAT ON PURPOSE
      shaderProgram.a[attribInfo.name].set = (function (gl, AL) {
        return function (buffer, size) {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
          gl.vertexAttribPointer(AL, size, gl.FLOAT, false, 0, 0)
        }
      })(this, attribLoc)
      shaderProgram.a[attribInfo.name].en = (function (gl, AL) {
        return function () {
          gl.enableVertexAttribArray(AL)
        }
      })(this, attribLoc)
      shaderProgram.a[attribInfo.name].dis = (function (gl, AL) {
        return function () {
          gl.disableVertexAttribArray(AL)
        }
      })(this, attribLoc)
    }
  }
  context.getShaderProgram = function (vertexShader, fragmentShader) {
    const shaderProgram = this.createProgram()
    this.attachShader(shaderProgram, this.getShader(vertexShader, this.VERTEX_SHADER))
    this.attachShader(shaderProgram, this.getShader(fragmentShader, this.FRAGMENT_SHADER))
    this.linkProgram(shaderProgram)
    this.loadUniforms(shaderProgram)
    return shaderProgram
  }
  context.floatArray = function (data, dynamic) {
    const b = this.createBuffer()
    this.bindBuffer(this.ARRAY_BUFFER, b)
    if (!(data instanceof Float32Array)) {
      data = new Float32Array(data)
    }
    this.bufferData(this.ARRAY_BUFFER, data, dynamic ? this.DYNAMIC_DRAW : this.STATIC_DRAW)
    return b
  }
  context.updateOrCreateFloatArray = function (b, data) {
    const doCreate = !b
    if (doCreate) {
      b = this.createBuffer()
    }
    if (!(data instanceof Float32Array)) {
      data = new Float32Array(data)
    }
    this.bindBuffer(this.ARRAY_BUFFER, b)
    if (doCreate) {
      this.bufferData(this.ARRAY_BUFFER, data, this.DYNAMIC_DRAW)
    } else {
      this.bufferSubData(this.ARRAY_BUFFER, 0, data)
    }
    return b
  }
  context.staticElementArray = function (data) {
    const b = this.createBuffer()
    if (!(data instanceof Uint16Array)) {
      data = new Uint16Array(data)
    }
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, b)
    this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.STATIC_DRAW)
    return b
  }
  context.loadCanvas = function (canvas, texNum) {
    const gl = this
    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + ~~texNum)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
  }
  context.loadMipmap = function (src, callback) {
    const gl = this
    const texture = gl.createTexture()
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.bindTexture(gl.TEXTURE_2D, null)
      if (callback) {
        callback(texture)
      }
    }
    image.src = src
    return texture
  }
  context.loadFromImage = function (image, texture) {
    const gl = this
    const tex = texture || gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    // gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return tex
  }
  context.loadImage = function (src, callback, texNum, scale, dimensions) {
    const gl = this
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    gl.activeTexture(gl.TEXTURE0 + ~~texNum)
    const texture = gl.createTexture()
    image.onload = function () {
      gl.activeTexture(gl.TEXTURE0 + ~~texNum)
      if ((!image.width || !image.height) && dimensions) {
        image.width = dimensions.width
        image.height = dimensions.height
      }
      if (scale) {
        image.width = image.width * scale
        image.height = image.height * scale
      }
      gl.loadFromImage(image, texture)
      callback(texture, image)
    }
    image.src = src
  }
  return context
}

export default function getWebGLContext (canvas, options) {
  const opt = options || { alpha: false }
  let glCtx
  const contextNames = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']
  for (let i = 0; i < contextNames.length; i++) {
    glCtx = canvas.getContext(contextNames[i], opt)
    if (glCtx) {
      return AddUtilsToContext(glCtx)
    }
  }
}
