import AMCore from '../amcore'
import AMLayerBase from './amlayerbase'
import SvgHelper from './../utils/svg-helper'
import Placement from './../vector-math/placement'

const logoMakerColors = ['#F53B57', '#10bcf9', '#ffa800', '#09c46b', '#3c40c6']

function AMTextLayer (settings) {
  const base = AMCore.inherit(this, AMLayerBase, settings)

  const self = this
  const options = {}

  let lastLetterSpacing = -1.0

  self.letterSpacingFont = false
  self.textChanged = false

  self.fontInstance = null
  self.lastFontInstance = null

  self.pathInfo = null
  self.pathText = null
  self.lastInputLines = ''
  self.letterText = ''

  self.letters = null
  self.pathScale = null

  self.boxInfo = {
    x1: 0,
    x2: 10,
    y1: 0,
    y2: 10
  }
  self.pathInfo = null
  self.rootOffset = {
    x: 0,
    y: 0
  }

  // self.lastFontData = ''
  // self.lastText = ''

  settings = AMCore.extendRecursive(
    self.settings,
    {
      type: AMTextLayer.layerType,
      text: '',
      align: {
        horizontal: 'left',
        vertical: 'top'
      },
      font: {
        family: 'Open Sans',
        size: 36,
        color: [255, 255, 255]
      }
    },
    false,
    true
  )

  self.getBoxInfo = function () {
    if (!self.pathInfo) {
      self.boxInfo = {
        x1: 0,
        x2: 10,
        y1: 0,
        y2: 10
      }
      return
    }

    self.boxInfo = {
      x1: 1000000,
      x2: -1000000,
      y1: 1000000,
      y2: -1000000
    }

    for (let ix = 0; ix < self.pathInfo.length; ix++) {
      const pathInfo = self.pathInfo[ix]
      let letterX = pathInfo.x
      if (!self.letterSpacingFont) {
        if (isFinite(pathInfo.shapeX)) {
          letterX = pathInfo.shapeX
        } else {
          // Make it recalculate letter spacing
          lastLetterSpacing = -1
        }
      }
      // Caching the box gives render errors on reuse in other textlayer instance
      const box = /* pathInfo.BBBOX = pathInfo.BBBOX || */ pathInfo.path.getBoundingBox()
      self.boxInfo.x1 = Math.min(self.boxInfo.x1, box.x1 + letterX)
      self.boxInfo.x2 = Math.max(self.boxInfo.x2, box.x2 + letterX)
      self.boxInfo.y1 = Math.min(self.boxInfo.y1, box.y1)
      self.boxInfo.y2 = Math.max(self.boxInfo.y2, box.y2)
    }
    if (settings.font.letterSpacing && settings.font.letterSpacing !== -1) {
      if (self.letterSpacingFont) {
        self.boxInfo.x2 += (settings.font.letterSpacing - 1.0) * 100 * (self.pathInfo.length - 1)
      }
    }
  }

  function buildPathDeco (inputLines) {
    const pathDeco = []

    let ix = 0
    let inbracket = false
    let inmiddle = false
    for (let i = 0; i < self.pathInfo.length; i++) {
      let ch
      while (true) {
        ch = inputLines[ix++]

        if (ch === '[') {
          inbracket = true
          inmiddle = false
        } else if (ch === ']') {
          inbracket = false
          if (inmiddle) {
            inmiddle = false
          } else {
            inmiddle = inputLines.indexOf('|') !== -1
          }
        } else if (ch === '|') {
          inmiddle = !inmiddle
        } else {
          break
        }
      }

      pathDeco.push(inbracket * 1 + inmiddle * 2)
    }
    return pathDeco
  }

  self.getTextPathInfo = function () {
    let inputLines = settings.text
    if (options.textReplacer) {
      self.inputLines = inputLines = options.textReplacer(inputLines)
      if (!inputLines) {
        self.inputLines = inputLines = settings.textDefault
      }
    }

    if (!inputLines) {
      return null
    }

    self.letterText = inputLines.replace(/\[|\]|\|/g, '')
    self.fontInstance = options.getFontInstance(settings.font, self.letterText)
    if (this.inputLines === 'LOGOMAKER') {
      settings.font.letterSpacing = 0.75
    }
    self.letterSpacingFont = settings.font.letterSpacingMethod === 'font'

    if (self.fontInstance?.isLoaded) {
      if (!self.pathInfo || self.lastInputLines !== inputLines || self.lastFontInstance !== self.fontInstance) {
        self.pathInfo = self.fontInstance.getPathInfo()
        self.pathDeco = buildPathDeco(inputLines)
        self.lastInputLines = inputLines
        self.lastFontInstance = self.fontInstance
      }
      return self.pathInfo
    }
    return null
  }

  function getFontModifier (name) {
    const modifier = settings.font[name]
    if (!modifier || modifier < 0) {
      return undefined
    }
    const ix = ~~modifier
    return {
      value: modifier,
      ix,
      progress: modifier - ix
    }
  }

  let lastPathInfo = null
  self.updateGroup = function () {
    // TODO add logic to only do this when needed
    const pathInfo = self.getTextPathInfo()

    self.rootOffset = self.getRootOffset()

    let letters = self.letters
    if (!letters) {
      letters = self.letters = []
    }

    let scale = settings.font.size / 100
    if (settings.font.fontScale) {
      scale *= settings.font.fontScale
    }

    if (pathInfo && self.fontInstance?.isLoaded) {
      if (!lastPathInfo || lastPathInfo !== pathInfo) {
        self.placements = []
        while (pathInfo.length < letters.length) {
          AMCore.removeChildCheck(letters.pop())
        }

        // while (pathInfo.length > letters.length) {
        //   AMCore.removeChildCheck(letters[letters.length])
        //   letters.push(SvgHelper.createElement('use'))
        // }
        for (let i = 0; i < pathInfo.length; i++) {
          // const idName = 'lt_' + self.fontInstance.id + '_' + self.pathInfo[i].ch
          let pathStrs
          if (self.pathInfo[i].ch === 105 || self.pathInfo[i].ch === 106) {
            pathStrs = self.pathInfo[i].shape.toPathStrsDotSeperate()
          } else {
            pathStrs = [self.pathInfo[i].shape.toPathStr()]
          }
          // const pathStr = pathStrs.length > 0 ? pathStrs[0] : '' // self.pathInfo[i].path.toPathData()
          // pathStr = 'M 10,10 L 50,10 Q 100,10 100,50 T 110,70 T 180,100 T 110,100 T 10,10 Z' // quadtratic curves
          // pathStr = 'M 10,10 L 50,10 C 100,10 100,50 110,70 S 150,80 180,100 S 110,100 20,70Z' // cubic curves
          // pathStr = 'M 10,10 l 50,10 v 10 c 10,40 120,50 10,70 s -50,-30 -18,-20 s -20,-10 -20,-30 s -20,10 -22,-10 v-10 h 20 z'

          if (!self.placements[i]) {
            self.placements[i] = new Placement()
            // const start = window.performance.now()
            self.placements[i].addShape(self.pathInfo[i].shape)
            self.placements[i].offset = {
              x: self.rootOffset.x,
              y: self.rootOffset.y
            }
            // const stop = window.performance.now()
            // console.log('Path parse time: ', (stop - start).toFixed(2), 'ms')
            // self.pathInfo[i].shape.updateMargins(4)
          }
          // pathStr += self.pathInfo[i].shape.toPathStr()

          // const group = options.addDef('g', idName)
          const group = (letters[i] = SvgHelper.createElement('g'))
          AMCore.removeAllChildren(group)
          if (pathStrs) {
            for (let ix = 0; ix < pathStrs.length; ix++) {
              const path = SvgHelper.createElement('path')
              SvgHelper.setAttributeValues(path, { d: pathStrs[ix] })
              AMCore.childCheck(group, path)
            }
          }
          // SvgHelper.setAttributeValues(letters[i], { 'xlink:href': '#' + idName })
        }
        lastLetterSpacing = -1.0
        lastPathInfo = pathInfo
      }
      if (lastLetterSpacing !== settings.font.letterSpacing) {
        lastLetterSpacing = settings.font.letterSpacing
        // const start = window.performance.now()
        let currentShapeX = 0
        for (let i = 0; i < pathInfo.length; i++) {
          const shape = self.placements[i].shapes[0]
          if (shape && !self.letterSpacingFont) {
            const letterMargin = Math.pow((settings.font.letterSpacing - 0.5) * 4, 2.0)
            shape.updateMargins(letterMargin)
            if (i > 0) {
              currentShapeX +=
                !shape.hasData() || !self.placements[i - 1].shapes[0].hasData()
                  ? self.pathInfo[i].x - self.pathInfo[i - 1].x + letterMargin * 2.0
                  : shape.getXAdvance(self.placements[i - 1].shapes[0])
            }
            self.pathInfo[i].shapeX = currentShapeX
          }
        }
        // const stop = window.performance.now()
        // console.log('Physical time: ', (stop - start).toFixed(2), 'ms')
      }

      self.getBoxInfo()

      self.textWidth = self.calculatedWidth = (self.boxInfo.x2 - self.boxInfo.x1) * scale
      const pw = self.getParentWidth()
      if (self.textWidth > pw) {
        // console.log('text to large ', settings.tag)
        scale *= pw / self.textWidth
        self.textWidth = self.calculatedWidth = (self.boxInfo.x2 - self.boxInfo.x1) * scale
      }

      // self.textHeight = settings.font.fontScale * settings.font.fontSize // (self.boxInfo.y2 - self.boxInfo.y1) * scale
      self.calculatedLineSpace = (settings.font.lineSpacing - 1.0) * 100 * scale
      self.textHeight = self.calculatedHeight = (self.boxInfo.y2 - self.boxInfo.y1) * scale + self.calculatedLineSpace
      self.textBaseLine = (-self.boxInfo.y1 * scale) / self.textHeight

      if (!settings.position.stretch) {
        settings.position.aspect = self.calculatedWidth / self.calculatedHeight
      }
    } else {
      AMCore.removeAllChildren(self.layerElement)
      self.pathScale = scale
      if (self.inputLines) {
        SvgHelper.AddLoaders(self.layerElement, self.inputLines)
      }
      const box = {
        x: 0,
        y: 0,
        width: ((self.inputLines?.length || 5) * 40 + 50) * scale,
        height: 60 * scale
      }

      self.boxInfo.x1 = box.x
      self.boxInfo.x2 = box.x + box.width
      self.boxInfo.y1 = box.y
      self.boxInfo.y2 = box.y + box.height

      self.placements = [new Placement()]
      self.placements[0].addShapeFromBox(box, 1.0)
      self.placements[0].offset = {
        x: self.rootOffset.x,
        y: self.rootOffset.y
      }

      self.textWidth = self.calculatedWidth = box.width
      self.textHeight = self.calculatedHeight = box.height
      self.textBaseLine = 8
      return
    }

    const outline = getFontModifier('outline')

    let fill = AMCore.colorToStyle(settings.font.color)
    let stroke = AMCore.colorToStyle(settings.font.color)
    const strokeWidth = outline ? 0.15 + outline.progress * 7.85 : 0

    if (outline) {
      switch (outline.ix % 4) {
        case 0:
          fill = 'none'
          break
        case 1:
          fill = 'white'
          break
        case 2:
          fill = 'black'
          break
        case 3:
          fill = AMCore.colorToStyle(settings.font.color)
          break
      }
      switch (~~(outline.ix / 4)) {
        case 0:
          stroke = AMCore.colorToStyle(settings.font.color)
          break
        case 1:
          stroke = 'black'
          break
        case 2:
          stroke = 'white'
          break
      }
    }

    const group = self.layerElement
    self.pathScale = scale

    let translateX = 0
    // let translateY = 0
    AMCore.removeAllChildren(group)
    for (let ix = 0; ix < letters.length; ix++) {
      // for (let path of paths) {
      const path = letters[ix] // this hasn't been a path for a long time :) it was USE now it's GROUP
      // if (self.pathDeco) {
      //   let deco = self.pathDeco[ix]
      //   if ((deco & 0x2) !== 0) {
      //     fill = 'rgb(96,96,96)'
      //     stroke = AMCore.colorToStyle(settings.font.color)
      //     strokeWidth = 2
      //   } else if ((deco & 0x1) !== 0) {
      //     fill = 'none'
      //     stroke = AMCore.colorToStyle(settings.font.color)
      //     strokeWidth = 2
      //   } else {
      //     fill = AMCore.colorToStyle(settings.font.color)
      //     stroke = 'none'
      //     strokeWidth = 0
      //   }
      // }

      if (self.pathInfo) {
        const letterX = (self.letterSpacingFont ? self.pathInfo[ix].x : self.pathInfo[ix].shapeX) + translateX
        self.pathInfo[ix].letterX = letterX
        SvgHelper.setAttributeValues(path, {
          transform: `translate(${letterX.toFixed(3)},0)`
          // x: letterX.toFixed(3)
        })
        if (self.letterSpacingFont) {
          translateX += 100 * (settings.font.letterSpacing - 1.0)
        }
      }

      if (self.patternId) {
        fill = 'url(#' + self.patternId + ')'
      }

      if (this.inputLines === 'LOGOMAKER') {
        if (ix % 2 === 1) {
          SvgHelper.setAttributeValues(path, {
            fill: 'none',
            stroke,
            'stroke-width': 0.3
          })
        } else {
          SvgHelper.setAttributeValues(path, {
            fill: logoMakerColors[~~(ix / 2) % logoMakerColors.length],
            stroke: 'none',
            'stroke-width': 0
          })
        }
      } else {
        for (let i = 0; i < path.children.length; i++) {
          const innerPath = path.children[i]
          const colorPositionMatch = settings.font.duoColorPosition > 0 && settings.font.duoColorPosition < 0.999
          const pathMatch1 = ix < settings.font.duoColorPosition * pathInfo.length - 0.5
          const pathMatch = pathMatch1 !== ((path.children.length === 1 || i > 0) && self.letterText[ix] !== '.')
          if (colorPositionMatch && pathMatch) {
            SvgHelper.setAttributeValues(innerPath, { fill: AMCore.colorToStyle(settings.font.colorAlt) })
          } else {
            SvgHelper.setAttributeValues(innerPath, { fill: undefined })
          }
        }
        SvgHelper.setAttributeValues(path, {
          fill,
          stroke,
          'stroke-width': strokeWidth
        })
      }
      AMCore.childCheck(group, path)
    }
  }

  self.updateElementsSizeAndPosition = function (left, top, width, height) {
    // if (!self.fontInstance || !self.fontInstance.isLoaded || !self.pathScale) {
    //   self.textWidth = self.calculatedWidth = 0
    //   self.textHeight = self.calculatedHeight = 0
    //   self.textBaseLine = 0
    //   return
    // }
    if (width < 0.0001) {
      AMCore.removeAllChildren(self.layerElement)
      return
    }

    let scaleX = self.pathScale
    let scaleY = self.pathScale

    if (Math.abs(width - self.textWidth) > 0.0001) {
      // console.log('resize text: ', width, self.textWidth)
      scaleX *= width / self.textWidth
    }

    if (Math.abs(height - self.textHeight) > 0.0001) {
      // console.log('resize text: ', width, self.textWidth)
      scaleY *= height / self.textHeight
    }

    self.scaleX = scaleX
    self.scaleY = scaleY

    const aboveBaseLine = self.boxInfo ? -self.boxInfo.y1 : 0 // ; self.fontInstance && self.fontInstance.fontInfo ? self.fontInstance.fontInfo.aboveBaseLine : 0
    const x = left / scaleX - self.boxInfo.x1
    let y = top / scaleY + aboveBaseLine
    if (settings.font.lineSpacingTop) {
      // y += self.calculatedHeight - self.textHeight
      y += self.calculatedLineSpace / scaleY
      // console.log('extraSpace: ', settings.font.lineSpacing)
    }

    self.rootOffset = self.getRootOffset()
    if (self.fontInstance?.isLoaded) {
      if (self.pathInfo) {
        for (let ix = 0; ix < self.pathInfo.length; ix++) {
          const placement = self.placements[ix]
          if (placement) {
            placement.layer = self
            placement.offset.y = y * scaleY - top
            placement.offset.x = x * scaleX - left + self.pathInfo[ix].letterX * scaleX
            placement.scale.x = scaleX
            placement.scale.y = scaleY
          }
        }
      }
    } else {
      y = y || 0
      // const placement = self.placements[0]
      // placement.offset.y = y * scaleY - top
      // placement.scale.x = scaleX
      // placement.scale.y = scaleY
    }

    if (AMCore.validateNumbers(scaleX, scaleY, x, y)) {
      SvgHelper.setAttributeValues(self.layerElement, {
        transform: `scale(${scaleX} ${scaleY}) translate(${x} ${y})`
      })
    } else {
      // console.log('WRONG: ', scaleX, scaleY, x, y)
    }
    base.updateElementsSizeAndPosition(left, top, width, height)
  }

  // self.hasColor = function () {
  //   if (settings.font.color !== '#000000' && settings.font.color !== '#ffffff') {
  //     return true
  //   }
  //   return false
  // }

  self.updatePosition = function () {
    self.traceIn()

    if (settings.font.colorFrom) {
      settings.font.color = options.getColor(settings.font.colorFrom)
      if (settings.font.colorFromAlt) {
        settings.font.colorAlt = options.getColor(settings.font.colorFromAlt, settings.font.colorFrom)
      } else {
        settings.font.colorAlt = settings.font.color
      }
    }

    self.updateGroup()
    base.updatePosition()

    self.traceOut()
  }

  self.initialize = function (container, opt) {
    AMCore.extend(options, opt)
    self.layerElement = SvgHelper.createElement('g')
    base.initialize(container, opt)
  }
}

AMTextLayer.layerType = 'text'

export default AMTextLayer
