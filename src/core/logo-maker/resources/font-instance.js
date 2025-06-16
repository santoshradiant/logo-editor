import ResourceInstance from './resource-instance'
import Shape from '../vector-math/shape'
import replacementChars from './replacementChars'

class FontInstance extends ResourceInstance {
  constructor (fontGlyphLoader, blobVersion, fontDefinition, text) {
    super()
    this.fontGlyphLoader = fontGlyphLoader
    this.id = fontDefinition.id
    this.fontDefinition = fontDefinition
    this.blobVersion = blobVersion
    this.text = text
    if (this.fontDefinition.category === 'handwritten') {
      let newText = ''
      let skip = 1
      for (let i = 0; i < this.text.length; i++) {
        const ch = this.text[i]
        if (skip > 0) {
          newText += ch
          skip--
        } else {
          const cc = ch.charCodeAt(0)
          if (cc <= 47 || (cc >= 58 && cc <= 64) || (cc >= 91 && cc <= 96) || (cc >= 123 && cc <= 127)) {
            skip = 1
            newText += ch
          } else {
            newText += ch.toLowerCase()
          }
        }
      }
      this.text = newText
    }
  }

  getPaths = function () {
    const glyphPaths = []
    let currentX = 0.0
    let lastRecord
    for (const ch of this.text) {
      let newUnicode = ch.charCodeAt(0)
      let glyphData = this.fontGlyphLoader.getGlyph(~~this.fontDefinition.blobid, newUnicode)
      if (!glyphData && Object.prototype.hasOwnProperty.call(replacementChars, newUnicode)) {
        newUnicode = replacementChars[newUnicode].charCodeAt(0)
        glyphData = this.fontGlyphLoader.getGlyph(~~this.fontDefinition.blobid, newUnicode)
      }
      if (glyphData) {
        if (lastRecord && lastRecord.ch !== -1) {
          const kix = glyphData.kerningChars.indexOf(lastRecord.ch)
          if (kix !== -1) {
            currentX += glyphData.kerningValues[kix] / 100
          }
        }
        let shape = glyphData.shape
        if (!shape) {
          glyphData.shape = shape = new Shape()
          shape.addPath(glyphData.toPathData())
        }
        lastRecord = {
          x: currentX,
          path: glyphData,
          shape,
          ch: newUnicode
        }
        glyphPaths.push(lastRecord)

        // Space needs some space
        currentX += glyphData.advance / 100
      }
    }

    return glyphPaths
  }

  getPathInfo = inputLines => {
    return this.getPaths(inputLines)
  }

  load = loadFinished => {
    if (!this.isLoaded) {
      this.pushLoadFinished(loadFinished)
    }

    if (this.state === 'none') {
      // console.log('!!AK Loading: ', this.count)
      this.state = 'loading'
      let text = this.text
      for (let ix = 0; ix < text.length; ix++) {
        if (Object.prototype.hasOwnProperty.call(replacementChars, text.charCodeAt(ix))) {
          text += replacementChars[text.charCodeAt(ix)]
        }
      }

      this.fontGlyphLoader.load(this.blobVersion, this.fontDefinition, text).then(result => {
        // console.log('!!AK Loaded: ', this.count)
        // SLOW LOADING SIMULATING
        // setTimeout(() => this.handleLoadFinished(''), 3000)
        this.handleLoadFinished('')
      })

      // LoadFont(this.url, (error, font) => {
      //   this.openType = font

      //   let pathInfo = this.openType.getPath('WMFGHfgx', 0, 0, 100, {
      //     kerning: true,
      //     letterSpacing: 0,
      //     tracking: false
      //   })
      //   let box = pathInfo.getBoundingBox()
      //   let fi = {
      //     height: box.y2 - box.y1,
      //     aboveBaseLine: -box.y1,
      //     belowBaseLine: box.y2
      //   }

      //   pathInfo = this.openType.getPath('x', 0, 0, 100, {
      //     kerning: true,
      //     letterSpacing: 0,
      //     tracking: false
      //   })
      //   box = pathInfo.getBoundingBox()
      //   fi.xHeight = box.y2 - box.y1
      //   fi.xHeightPerc = fi.xHeight / fi.height

      //   // let margin = fi.height * 0.02
      //   // fi.height += margin * 2
      //   // fi.aboveBaseLine += margin
      //   // fi.belowBaseLine += margin
      //   this.fontInfo = fi

      //   this.handleLoadFinished(error)
      // })
    }
  }
}

export default FontInstance
