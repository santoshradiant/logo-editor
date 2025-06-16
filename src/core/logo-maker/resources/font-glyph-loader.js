// Base on logo-chars-blob from logo-builder-tools repo
const blobVersionNumber = 0
const commandCoordsCount = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  Q: 4,
  T: 2,
  S: 4,
  Z: 0
}

function BytesToUInt32 (bytes) {
  const result = []
  for (let ix = 0; ix < bytes.length; ix++) {
    let val = bytes[ix]
    let uint32val = 0
    let sl = 0
    while (val > 127) {
      uint32val |= (val & 0x7f) << sl
      sl += 7
      ix++
      val = bytes[ix]
    }
    uint32val |= (val & 0x7f) << sl
    // if (ix>0) {
    //   uint32val += result[result.length-1];
    // }
    result.push(uint32val)
  }
  return result
}

class GlyphData {
  constructor (char) {
    this.commands = []
    this.coordinates = []
    this.advance = ~~0
    this.kerningCharBytes = []
    this.kerningChars = []
    this.kerningValues = []
    this.pathStr = ''
    this.char = char
  }

  getBoundingBox () {
    if (this.bbox) {
      return this.bbox
    }

    const pathStr = this.toPathData()

    const div = document.createElement('div')

    div.innerHTML = '<svg><path d="' + pathStr + '"></path></svg>'
    div.style.opacity = 0
    div.style.position = 'fixed'
    div.style.top = 0
    div.style.left = 0

    document.body.appendChild(div)

    // unboxBox = b => ({ x: b.x, y: b.y, width: b.width, height: b.height })
    const box = div.firstElementChild.firstElementChild.getBBox()
    this.bbox = {
      x1: box.x,
      y1: box.y,
      x2: box.x + box.width,
      y2: box.y + box.height
    }

    div.remove()

    return this.bbox
  }

  toPathData () {
    if (this.pathStr) {
      return this.pathStr
    }

    let pathStr = ''
    // const points = []
    // const addPoint = (x, y) => {
    //   if ((points.length === 0) ||
    //       (x !== points[points.length - 1].x) ||
    //       (y !== points[points.length - 1].y)) {
    //     points.push({ x, y })
    //     return true
    //   } else {
    //     return false
    //   }
    // }

    let cix = 0
    // console.log('Character: ', this.char)
    for (const cmd of this.commands) {
      const cmdCh = String.fromCharCode(cmd)
      const cmdChUp = cmdCh.toUpperCase()

      const cLen = commandCoordsCount[cmdChUp]
      // let isDouble = false
      // if (cLen >= 2) {
      //   if (cmdChUp === 'C') {
      //     isDouble = !addPoint(this.coordinates[cix + 4], this.coordinates[cix + 5])
      //   } else if (cmdChUp === 'S' || cmdChUp === 'Q') {
      //     isDouble = !addPoint(this.coordinates[cix + 2], this.coordinates[cix + 3])
      //   } else {
      //     isDouble = !addPoint(this.coordinates[cix + 0], this.coordinates[cix + 1])
      //   }
      // }

      // if (cmdChUp === 'Z') {
      //   this.geometryPoints.push(points)
      //   points = []
      // }

      // // TODO: Have the font tool remove these double coordinates
      // if (isDouble) {
      //   cix += cLen
      //   console.log('Double coord filtered ')
      // } else {
      pathStr += cmdCh
      for (let ix = 0; ix < cLen; ix++) {
        pathStr += this.coordinates[cix++].toFixed(2) + (ix % 1 === 1 ? ',' : ' ')
      }
      // }
    }

    this.pathStr = pathStr
    return this.pathStr
  }

  getByteLength () {
    return (
      2 +
      2 +
      this.kerningCharBytes.length +
      this.kerningValues.length * 2 +
      this.commands.length * 1 +
      1 +
      this.coordinates.length * 2
    )
  }

  loadFromDataView (/* DataView */ view, ofs) {
    this.advance = view.getInt16(ofs)
    ofs += 2

    const kerningCharBytesLen = view.getUint16(ofs)
    ofs += 2
    this.kerningCharBytes = new Array(kerningCharBytesLen)
    for (let i = 0; i < kerningCharBytesLen; i++) {
      this.kerningCharBytes[i] = view.getUint8(ofs)
      ofs += 1
    }
    this.kerningChars = BytesToUInt32(this.kerningCharBytes)
    this.kerningValues = new Array(this.kerningChars.length)
    for (let i = 0; i < this.kerningValues.length; i++) {
      this.kerningValues[i] = view.getInt16(ofs)
      ofs += 2
    }

    let cmd
    this.commands = []
    while ((cmd = view.getUint8(ofs++)) !== 0) {
      this.commands.push(cmd)
    }
    this.coordinates = []
    for (let i = 0; i < this.commands.length; i++) {
      const cmd = this.commands[i]
      const coordCount = commandCoordsCount[String.fromCharCode(cmd).toUpperCase()]
      for (let j = 0; j < coordCount; j++) {
        this.coordinates.push(view.getInt16(ofs) / 100)
        ofs += 2
      }
    }
    return ofs
  }
}

function fetchCharGlyphs (url, /* FontGlyphLoader */ loader) {
  return new Promise((resolve, reject) => {
    window.fetch(url).then(response => {
      response.arrayBuffer().then(buffer => {
        loader.addFontData(buffer)
        resolve(true)
      })
    })
  })
}

class FontGlyphLoader {
  constructor () {
    this.fonts = {}
    this.fetchers = {}
  }

  getGlyph (fontId, unicode) {
    const fontChars = this.fonts[fontId]
    if (!fontChars) {
      return null
    }
    const glyph = fontChars[unicode]
    return glyph
  }

  load (version, fontRec, text) {
    for (let i = 0; i < text.length; i++) {
      const unicode = text.charCodeAt(i)
      const fileName = 'v' + version + '-' + unicode

      if (!Object.prototype.hasOwnProperty.call(this.fetchers, fileName)) {
        this.fetchers[fileName] = fetchCharGlyphs('https://logo.builderservices.io/font/' + fileName, this)
        // this.fetchers[fileName] = fetchCharGlyphs('https://lmstoragedev.blob.core.windows.net/font/' + fileName, this)
      }
    }
    return Promise.all(Object.values(this.fetchers))
  }

  addFontData (/* ArrayBuffer */ buffer) {
    const bufferView = new DataView(buffer)
    let ofs = 0
    /* UInt16   version    */
    const versionNumber = bufferView.getUint16(ofs)
    ofs += 2
    if (versionNumber > blobVersionNumber) {
      throw new Error('Unkown file format for character blob')
    }
    /* UInt16   charcount  */
    const charCount = bufferView.getUint16(ofs)
    ofs += 2
    if (charCount > 16000) {
      throw new Error('Unrealisticly high number of character in character blob')
    }
    const charData = new Array(charCount)
    for (let i = 0; i < charCount; i++) {
      /* byte[] UTF8 chars */
      charData[i] = bufferView.getUint8(ofs++)
    }
    const availableChars = BytesToUInt32(charData)
    /* UInt16   fontCount  */
    const fontCount = bufferView.getUint16(ofs)
    ofs += 2
    if (fontCount > 2000) {
      throw new Error('Unrealisticly high number of fonts in character blob')
    }
    const fontIds = new Array(fontCount)
    for (let i = 0; i < fontIds.length; i++) {
      /* UInt32[] fontIds  */
      fontIds[i] = bufferView.getUint32(ofs)
      ofs += 4
    }

    for (let fontIx = 0; fontIx < fontCount; fontIx++) {
      const fontBlobId = fontIds[fontIx]
      const glyphs = (this.fonts[fontBlobId] = this.fonts[fontBlobId] || {})
      for (let charIx = 0; charIx < availableChars.length; charIx++) {
        const ch = availableChars[charIx]
        const glyphData = new GlyphData(ch)
        ofs = glyphData.loadFromDataView(bufferView, ofs)
        glyphs[ch] = glyphData
      }
    }
  }
}

export default FontGlyphLoader
