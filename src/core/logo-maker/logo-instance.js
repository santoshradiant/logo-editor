/* eslint-disable no-use-before-define */
import AMGroupLayer from './layers/amgrouplayer'
import AMCore from './amcore'
import LogoLayout from './layouts/logo-layout'
import CardLayout from './layouts/card-layout'
import LogoAnimate from './logo-animate'
import DecorationLayout from './layouts/decoration-layout'
import SymbolLayout from './layouts/symbol-layout'
import SloganLayout from './layouts/slogan-layout'
import BrandLayout from './layouts/brand-layout'
// import { colorNames } from './resources/color-names.json'

// import { findIconsByKeyword } from '../store/actions'

import SymbolResources from './resources/symbol-resources'
import FontResources from './resources/font-resources'
import random from './utils/weighted-random'
import md5 from 'md5'
import * as JSZip from 'jszip'
import * as dat from 'dat.gui'

import WordResources from './resources/word-resources'
import ColorTheme from '../../logomaker/config/color-theme.json'
import DownloadConfig from './resources/logo-save-config.json'
import SvgHelper from './utils/svg-helper'
import { saveAs } from 'file-saver'

const waterMarkStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<def><style>.cls-1 { fill: rgba(0,0,0,0.0); stroke: rgba(255,255,255,0.0); stroke-width:1px;) }</style></def>
<path class="cls-1" d="M79.07,104.71V93.43h1.65v9.9h5.47v1.38Z"/>
<path class="cls-1" d="M89.3,104.13a4.69,4.69,0,0,1-1.82-2,6.83,6.83,0,0,1-.64-3.06A7,7,0,0,1,87.48,96a4.56,4.56,0,0,1,1.82-2,5.95,5.95,0,0,1,5.58,0,4.57,4.57,0,0,1,1.82,2,7.74,7.74,0,0,1,0,6.13,4.62,4.62,0,0,1-1.82,2,5.37,5.37,0,0,1-2.8.7A5.3,5.3,0,0,1,89.3,104.13Zm5.42-1.79a6.18,6.18,0,0,0,0-6.55,3.23,3.23,0,0,0-2.65-1.14,3.19,3.19,0,0,0-2.62,1.14,6.2,6.2,0,0,0,0,6.55,3.18,3.18,0,0,0,2.62,1.15A3.22,3.22,0,0,0,94.72,102.34Z"/>
<path class="cls-1" d="M108.72,98.72V104a7,7,0,0,1-1.81.58,11.35,11.35,0,0,1-2.21.22,6,6,0,0,1-3-.69,4.56,4.56,0,0,1-1.9-2,7.62,7.62,0,0,1,0-6.18,4.6,4.6,0,0,1,1.88-2,5.8,5.8,0,0,1,2.89-.69,6.66,6.66,0,0,1,2.21.35,4.68,4.68,0,0,1,1.71,1l-.59,1.22a5.52,5.52,0,0,0-1.58-.94,5,5,0,0,0-1.73-.29,3.48,3.48,0,0,0-2.79,1.13,6,6,0,0,0,0,6.59,3.65,3.65,0,0,0,2.9,1.13,8.44,8.44,0,0,0,2.46-.37V100h-2.62V98.72Z"/>
<path class="cls-1" d="M113.29,104.13a4.68,4.68,0,0,1-1.82-2,6.83,6.83,0,0,1-.64-3.06,7,7,0,0,1,.63-3.08,4.57,4.57,0,0,1,1.82-2,5.95,5.95,0,0,1,5.58,0,4.57,4.57,0,0,1,1.82,2,7.74,7.74,0,0,1,0,6.13,4.62,4.62,0,0,1-1.82,2,5.37,5.37,0,0,1-2.8.7A5.3,5.3,0,0,1,113.29,104.13Zm5.42-1.79a6.18,6.18,0,0,0,0-6.55,3.23,3.23,0,0,0-2.65-1.14,3.19,3.19,0,0,0-2.62,1.14,6.2,6.2,0,0,0,0,6.55,3.18,3.18,0,0,0,2.62,1.15A3.22,3.22,0,0,0,118.7,102.34Z"/>
<polygon class="cls-1" points="3.09 197.44 1.4 199.14 0.54 200 0 200 0 199.46 0.32 199.14 2.56 196.91 3.09 197.44"/>
<path class="cls-1" d="M10.89,188.58l-5.55,5.55.53.53,5.55-5.55Zm8.33-8.33-5.55,5.55.53.53,5.55-5.55Zm8.33-8.33L22,177.47l.53.53,5.55-5.55Zm8.33-8.33-5.55,5.55.53.53,5.55-5.55Zm8.33-8.33-5.55,5.55.53.53,5.55-5.55Zm8.33-8.33L47,152.49l.54.53,5.55-5.56Zm8.33-8.33-5.56,5.56.53.53,5.56-5.56Zm8.33-8.33-5.56,5.56.53.53,5.56-5.55ZM77.52,122,72,127.5l.53.53L78,122.48Zm8.33-8.33-5.55,5.55.53.53,5.55-5.55ZM119.17,80.3l-5.55,5.55.53.53,5.55-5.55ZM127.5,72,122,77.52l.53.53L128,72.5Zm8.33-8.33-5.56,5.56.54.53,5.55-5.56Zm8.33-8.33-5.56,5.56.53.53,5.56-5.56ZM152.49,47l-5.56,5.56.53.53L153,47.52Zm8.32-8.32-5.55,5.55.53.53,5.56-5.55Zm8.33-8.33-5.55,5.55.53.53,5.55-5.55ZM177.47,22l-5.55,5.55.53.53L178,22.53Zm8.33-8.33-5.55,5.55.53.53,5.55-5.55Zm8.33-8.33-5.55,5.55.53.53,5.55-5.55Z"/>
<polygon class="cls-1" points="197.44 3.09 196.91 2.56 199.47 0 200 0 200 0.53 197.44 3.09"/>
<polygon class="cls-1" points="2.56 3.09 0 0.53 0 0 0.53 0 3.09 2.56 2.56 3.09"/>
<path class="cls-1" d="M194.13,194.66l-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55ZM177.47,178l-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55ZM152.49,153l-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55ZM127.5,128l-5.55-5.55.53-.53L128,127.5Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55ZM85.85,86.38,80.3,80.83l.53-.53,5.55,5.55Zm-8.33-8.33L72,72.5,72.5,72l5.55,5.55ZM69.2,69.73l-5.55-5.55.53-.53,5.55,5.55ZM60.87,61.4l-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33L47,47.52l.53-.53,5.55,5.55Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33-5.55-5.55.53-.53,5.55,5.55Zm-8.33-8.33L22,22.53l.53-.53,5.55,5.55Zm-8.33-8.33L13.67,14.2l.53-.53,5.55,5.55Zm-8.33-8.33L5.34,5.87l.53-.53,5.55,5.55Z"/>
<polygon class="cls-1" points="199.47 200 196.91 197.44 197.44 196.91 200 199.47 200 200 199.47 200"/>
</svg>`

const transitionTime = 350
const rgbRegex = /^rgba?\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*(,\s*(-?\d+)(%?)\s*)?\)$/i
const componentFromStr = (numStr, percent) => {
  const num = Math.max(0, parseInt(numStr, 10))
  return percent ? Math.floor((255 * Math.min(100, num)) / 100) : Math.min(255, num)
}

const colorModes = ['original', 'grayscale', 'negativegrayscale', 'black', 'white']
const defaultImageConfig = {
  type: 'png',
  background: 'transparent',
  colorMode: 'original',
  animate: false,
  isCircle: false,
  width: -1,
  height: -1,
  margin: 0.001,
  quality: 90 // Image quality for jpeg in percentage
}

// https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
// but slightly upgraded to handle rgba
function rgbToBytes (rgb) {
  if (Array.isArray(rgb) || rgb.length === 3 || rgb.length === 4) {
    return rgb
  }
  if (rgb.startsWith('#')) {
    return AMCore.hexToBytes(rgb)
  }
  let result
  if ((result = rgbRegex.exec(rgb))) {
    const r = componentFromStr(result[1], result[2])
    const g = componentFromStr(result[3], result[4])
    const b = componentFromStr(result[5], result[6])

    return [r, g, b]
  }
  return [0, 0, 0]
}

// const worker = new WebWorker(variation => {})
function fixPalette (palette) {
  return palette.map(x => rgbToBytes(x))
}

function checkPaletteContrast (palette) {
  for (let i = 0; i < palette.length - 1; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      if (AMCore.getContrast(palette[i], palette[j]) < 0.01) {
        return false
      }
    }
  }
  return true
}

const fullPalette = []
const setFullPalette = () => {
  // Flatten grouped color sets (Beauty, etc) to single full pallette list.
  // eslint-disable-next-line no-unused-vars

  // let allPalettes = 0
  // let goodPalettes = 0
  // let start = window.performance.now()
  for (const colors of Object.values(ColorTheme.ColorGroups)) {
    for (const color of colors) {
      // allPalettes++
      const palette = fixPalette(color.palette)
      if (checkPaletteContrast(palette)) {
        fullPalette.push(palette)
        // goodPalettes++
      } else {
        // console.log('%c 0000 ' + AMCore.colorToStyle(palette[0]) + ' ' +
        //             '%c 0000 ' + AMCore.colorToStyle(palette[1]) + ' ' +
        //             '%c 0000 ' + AMCore.colorToStyle(palette[2]) + ' ' +
        //             '%c 0000 ' + AMCore.colorToStyle(palette[3]) + ' ',
        // 'background: ' + AMCore.colorToStyle(palette[0]) + '; color: black',
        // 'background: ' + AMCore.colorToStyle(palette[1]) + '; color: white',
        // 'background: ' + AMCore.colorToStyle(palette[2]) + '; color: white',
        // 'background: ' + AMCore.colorToStyle(palette[3]) + '; color: white'
        // )
        // for (let i = 0; i < palette.length - 1; i++) {
        //   for (let j = i + 1; j < palette.length; j++) {
        //     if (AMCore.getContrast(palette[i], palette[j]) < 0.01) {
        //       return false
        //     }
        //   }
        // }
      }
    }
  }
  // let stop = window.performance.now()
  // console.log('setFullPalette time: ', stop - start)
  // console.log(`Removed ${allPalettes - goodPalettes} from ${allPalettes} palettes`)
}
setFullPalette()

let debugUnlockedStage = 0
let debugUI = null

class LogoInstance {
  constructor (templateData, parentElement, options) {
    // console.log('new instance')
    this.templateData = AMCore.clone(templateData)
    if (!Object.prototype.hasOwnProperty.call(this.templateData, 'logoVersion')) {
      this.templateData.logoVersion = 3
    }

    this.parentElement = parentElement
    this.options = options || {}
    if (templateData._zoomTo !== undefined) {
      options.zoomTo = templateData._zoomTo
    }

    this.previewRenderList = []
    this.previewImage = null

    this.fontResources = FontResources.getInstance()
    this.symbolResources = SymbolResources.getInstance()
    this.wordResources = WordResources.getInstance()

    this.wordinstance = null

    this.usedResources = []
    this.logoLayout = []
    this.rootLayer = []
    this.updateNeeded = false
    this.isLoaded = false
    this.colorMode = 0

    this.randomSymbol = null
    this.randomRetries = 0

    this.cardLayoutShown = 0

    // Fix wrong palettes to always have rgb byte arrays
    if (this.templateData?.color?.palette) {
      this.templateData.color.palette = fixPalette(this.templateData.color.palette)
    }

    this.addDefaultTemplateData()

    // this.fixInvisbleColors(this.templateData, true)
    this.updateColorRestrictions()

    // Do this just in time if there is no parentelement so we cn use the randomizer without to much overhead
    if (!parentElement) {
      this.generatePreviewDiv()
    }
  }

  static fixPalette (palette) {
    fixPalette(palette)
  }

  isDebugUnlocked = () => debugUnlockedStage >= 2

  // fixInvisbleColors = (templateData, alsoLowContrast) => {
  //   for (let i = 0; i < templateData.color.palette.length; i++) {
  //     let clr = templateData.color.palette[i]
  //     if (typeof clr === 'string') {
  //       templateData.color.palette[i] = rgbToBytes(clr)
  //     }
  //   }

  //   let ix = 0
  //   const check = (name) => {
  //     let elIx = templateData.color[name]
  //     if (elIx === ix) {
  //       if (ix === 0) {
  //         templateData.color[name] = 1
  //       } else {
  //         templateData.color[name] = 0
  //       }
  //     } else {
  //       if (alsoLowContrast) {
  //         let clr1 = templateData.color.palette[ix]
  //         if (ix === 0) {
  //           clr1 = '#ffffff'
  //         }
  //         let clr2 = templateData.color.palette[elIx]
  //         if (AMCore.getContrast(clr1, clr2) < 0.4) {
  //           let OkIxes = []
  //           let maxContrast = 0
  //           let maxContrastIx = 0
  //           for (let i = 0; i < 4; i++) {
  //             clr2 = templateData.color.palette[i]
  //             let contrast = AMCore.getContrast(clr1, clr2)
  //             if (contrast >= 0.4) {
  //               OkIxes.push(i)
  //             }
  //             if (contrast >= maxContrast) {
  //               maxContrast = contrast
  //               maxContrastIx = i
  //             }
  //           }
  //           if (OkIxes.length === 0) {
  //             elIx = maxContrastIx
  //           } else {
  //             elIx = random(OkIxes)
  //           }
  //           // console.log('contrastfixed: ', name, elIx, templateData)
  //           templateData.color[name] = elIx || 0
  //         }
  //       }
  //     }
  //   }
  //   if (this.getInverseShapeActive()) {
  //     check('decoration')
  //     ix = templateData.color.decoration
  //   }
  //   ['brand1', 'brand2', 'slogan', 'symbol'].forEach(check)
  // }

  static updateMD5 = templateData => {
    if (!templateData) return undefined

    const data = LogoInstance.cleanTemplateData(templateData)
    delete data.md5

    const sortObject = object => {
      const ordered = {}
      Object.keys(object)
        .sort()
        .forEach(function (key) {
          if (typeof object[key] === 'object') {
            if (object[key] !== null && object[key] !== undefined) {
              ordered[key] = sortObject(object[key])
            } else {
              ordered[key] = null
            }
          } else {
            ordered[key] = object[key]
          }
        })
      return ordered
    }
    const sorted = JSON.stringify(sortObject(data))

    // ensure props are sorted!
    // This breaks on undefined values
    // const sorted = JSON.stringify(data, (k, v) => {
    //   const src = k === '' ? data : v
    //   if (typeof src === 'object') {
    //     return Object.keys(src).sort().reduce((o, p) => {
    //       o[p] = src[p]
    //       return o
    //     }, {})
    //   }
    //   return v
    // })

    templateData.md5 = md5(sorted)
    return templateData
  }

  static cleanTemplateData = (templateData = null) => {
    const data = AMCore.clone(templateData)

    delete data.color.restrictions
    // delete data.symbol.icon.url
    if (data.layout.symbol.position === 'none') {
      delete data.color.symbol
      delete data.font.symbol
      delete data.symbol
    }

    if (data.layout.decoration.style === 'none') {
      delete data.color.decoration
      delete data.font.decoration
    } else {
      if (data.layout.decoration.style !== 'decoration6') {
        delete data.font.decoration
      }
    }

    if (data.text.brandName.indexOf(' ') === -1) {
      delete data.color.brand2
      delete data.font.brand2
    }

    if (!data.text.slogan) {
      delete data.font.slogan
      delete data.color.slogan
      data.text.slogan = ''
    }

    return data
  }

  getCleanTemplateData = templateData => {
    return LogoInstance.cleanTemplateData(templateData || this.templateData)
  }

  getMD5 = (templateData = null) => {
    templateData = templateData || this.templateData
    return LogoInstance.updateMD5(templateData).md5
  }

  hasDecoration = templateData => {
    const data = this.getCleanTemplateData(templateData)
    return data && data.layout && (data.layout.decoration.style !== 'none' || data.layout.symbol.decoration !== 'none')
  }

  hasSupportColor = templateData => {
    const data = this.getCleanTemplateData(templateData)
    return (
      data &&
      data.color &&
      (data.color.brand1 > 1 ||
        data.color.brand2 > 1 ||
        data.color.slogan > 1 ||
        data.color.symbol > 1 ||
        data.color.decoration > 1)
    )
  }

  handleInitialsLoaded = (result, symbolRec, resolve) => {
    this.handleSymbolLoaded(result)
    symbolRec.stored = result.innerSvgStr
    resolve(symbolRec)
  }

  waitForSymbolLoad = async (initialSymbol, symbolRec, resolve) => {
    const resource = this.symbolResources.loadExternalRef(initialSymbol, symbolRec, result =>
      this.handleInitialsLoaded(result, symbolRec, resolve)
    )
    if (resource && resource.isLoaded) {
      symbolRec.stored = resource.innerSvgStr
      resolve(symbolRec)
    }
  }

  hasSvg = svg => {
    const temp = document.createElement('div')
    temp.innerHTML = svg
    const htmlObject = temp.firstChild
    return htmlObject.innerHTML.trim() !== ''
  }

  getInitialSearchIcons = queryString => {
    return new Promise((resolve, reject) => {
      const query = {
        brandName: queryString && queryString.trim() !== '' ? queryString : this.templateData.text.brandName
      }
      let initials = ''
      if (queryString && queryString.trim() !== '') {
        initials = this.symbolResources.getDefaultInitials(query)
      } else if (this.templateData.text.brandName !== '') {
        initials = this.symbolResources.getDefaultInitials(this.templateData.text)
      }
      const hasUnsupportedCharacter = initials?.split('').find(i => i.charCodeAt(0) > 1000)
      if (!initials || hasUnsupportedCharacter) {
        return resolve([])
      }
      const fonts = this.fontResources.getSymbolFonts()
      const ps = []
      for (let i = 0; i < fonts.length; i++) {
        const initialPromise = new Promise(resolve => {
          const symbolRec = {
            type: 'initials',
            id: fonts[i].id + '.' + initials,
            initials,
            fontId: fonts[i].id
          }
          const initialSymbol = this.symbolResources.getExternalRef(this.handleSymbolLoaded)
          this.waitForSymbolLoad(initialSymbol, symbolRec, resolve)
        })
        ps.push(initialPromise)
      }
      Promise.all(ps).then(initialResults => {
        const results = initialResults.filter(res => this.hasSvg(res.stored))
        resolve(results)
      })
    })
  }

  getSymbolSearchIcons = queryString => {
    const wi = this.wordInstance
    return new Promise((resolve, reject) => {
      const query = {
        brandName: queryString && queryString.trim() !== '' ? queryString : this.templateData.text.brandName
      }
      wi.getSymbolSearchWords(query).then(words => {
        const promisses = []
        for (const word of words) {
          promisses.push(this.symbolResources.startSearch(word))
        }
        Promise.all(promisses).then(results => {
          const result = results
            .filter(x => x.result)
            .map(x => x.result)
            .flat()
          resolve(result)
        })
      })
    })
  }

  getRandomParamsForDecoration = decorationName => {
    const decorationInfo = DecorationLayout.prototype.variations.style[decorationName]
    const params = {}
    if (decorationInfo && decorationInfo.params) {
      for (const par in decorationInfo.params) {
        params[par] = random(decorationInfo.params[par])
      }
    }
    if (decorationName.startsWith('rect')) {
      if (params.inverse && params.borderStyle !== 'none') {
        console.log('Reset cornerRadius if rectangle with borders.')
        params.borderRadius = 0.0
      }
    }
    params.strokeDistance = 0.75
    return params
  }

  getRandomColorIx = (contrastColor, templateData, highContrast, skipIx) => {
    templateData = templateData || this.templateData
    const colorOptions = []
    for (let ix = 0; ix < templateData.color.palette.length; ix++) {
      const color = templateData.color.palette[ix]
      let contrast = AMCore.getContrast(contrastColor, color)
      if (contrast > 0.25) {
        if (highContrast) {
          contrast = Math.pow(contrast, 8.0)
        }
        colorOptions.push({
          ix,
          weight: contrast
        })
      }
    }
    if (colorOptions.length === 0) {
      console.error('No available contrasting colors: ', contrastColor, templateData)
      return 1
    }

    if (isFinite(skipIx)) {
      for (const x of colorOptions) {
        if (x.ix !== skipIx) {
          return x.ix
        }
      }
    }
    return random(colorOptions).ix // [Math.random(255), Math.random(255), Math.random(255)]
  }

  getRandomDecorationIx = (contrastColor, templateData) => {
    templateData = templateData || this.templateData
    const colorOptions = []
    for (let ix = 0; ix < templateData.color.palette.length; ix++) {
      const color = templateData.color.palette[ix]
      const contrast = AMCore.getContrast(contrastColor, color)
      const hasColor =
        Math.abs(color[0] - color[1]) / 255 + Math.abs(color[1] - color[2]) / 255 + Math.abs(color[0] - color[2]) / 255
      if (contrast > 0.1) {
        colorOptions.push({
          ix,
          weight: 1.0 + contrast + hasColor * 8
        })
      }
    }
    if (colorOptions.length === 0) {
      console.error('No available contrasting colors: ', contrastColor, templateData)
      return 1
    }
    return random(colorOptions).ix // [Math.random(255), Math.random(255), Math.random(255)]
  }

  addDefaultTemplateData = () => {
    // If there is no brand font, this is the 1st time
    // console.time('create logoinstance')

    const randomizeFont = !this.templateData.font
    const randomizeLayout = !this.templateData.layout
    const randomizeColor = !this.templateData.color || this.templateData.color.brand1 === undefined
    const randomizeActive = randomizeFont || randomizeLayout || randomizeColor

    this.templateData.text = this.templateData.text || {}

    let originalWeight = 100
    if (!this.templateData.text.brandName) {
      this.templateData.text.brandName = this.wordResources.getRandomBrandName()
      originalWeight = 0
    }
    this.templateData.text.original = {
      brandName: this.templateData.text.brandName,
      slogan: this.templateData.text.slogan
    }

    if (this.templateData.text.original) {
      this.wordInstance = this.wordResources.getWordInstance(
        this.templateData.text.original.brandName,
        this.templateData.text.original.slogan,
        originalWeight
      )
    } else {
      this.wordInstance = this.wordResources.getWordInstance(
        this.templateData.text.brandName,
        this.templateData.text.slogan,
        originalWeight
      )
    }
    this.lastFullUpdateSequence = this.wordInstance.fullUpdateCounter

    if (!this.templateData.text.stopRandomize) {
      this.templateData.text.stopRandomize = true
      this.templateData.text.brandName = this.wordInstance.getRandomBrandName()
      this.templateData.text.slogan = this.templateData.text.slogan || this.wordInstance.getRandomSlogan()
    }

    this.brandWords = this.wordInstance.brandWords // templateData.text.brandName.replace(/\[|\]|\|/g, '').match(WordResources.wordSplitRegEx) || []

    let newTemplateData

    // Repeat for a Maximum times to filter double logo's
    for (let i = 0; i < 100; i++) {
      const fontPair = this.fontResources.getRandomFontPair(
        this.templateData.font ? this.templateData.font.brand1 : undefined,
        this.wordInstance
      )
      const fontPairCard = this.fontResources.getRandomFontPairForCard(
        this.templateData.font ? this.templateData.font.slogan : undefined
      )

      let preferedBrandLayout
      if (this.brandWords.length >= 2 && this.brandWords[0][0] === this.brandWords[1][0]) {
        preferedBrandLayout = 'vertical'
      }

      if (this.brandWords.length === 1 || fontPair.brand1.category === 'handwritten') {
        preferedBrandLayout = 'horizontal'
      }

      if (this.brandWords.length >= 2 && (this.brandWords[0].length <= 2 || this.brandWords[1].length <= 2)) {
        preferedBrandLayout = 'horizontal'
      }

      let decorationStyle

      if (
        this.templateData.layout &&
        this.templateData.layout.decoration &&
        this.templateData.layout.decoration.style
      ) {
        decorationStyle = this.templateData.layout.decoration.style
      }
      if (!decorationStyle) {
        const styles = {}

        for (const key of Object.keys(DecorationLayout.prototype.variations.style)) {
          const style = DecorationLayout.prototype.variations.style[key]
          if (!(style.fixedAspect && this.wordInstance.noFixedAspectShapes()) && style.weight > 0) {
            styles[key] = style
          }
        }

        decorationStyle = window.symbolOnly ? 'none' : random(styles)
      }

      if (
        this.templateData.symbol &&
        this.templateData.symbol.icon &&
        this.templateData.symbol.icon.type === 'initials'
      ) {
        if (!this.templateData.symbol.icon.fontId) {
          const fonts = FontResources.getInstance().getSymbolFonts()
          this.templateData.symbol.icon.fontId = fonts[~~(Math.random() * fonts.length)].id
        }
        if (!this.templateData.symbol.icon.initials) {
          this.templateData.symbol.icon.initials = this.symbolResources.getDefaultInitials(this.templateData.text)
          // this.templateData.symbol.icon.id = this.
        }
      }

      newTemplateData = AMCore.clone(this.templateData)
      const theme = random(fullPalette)
      const sloganFont = random(this.fontResources.getSloganFontsByBrandCategory(fontPair.brand1.category))

      AMCore.extendRecursive(
        newTemplateData,
        {
          background: this.getRandomParamsForDecoration(decorationStyle),
          layout: {
            decoration: {
              style: decorationStyle
            },
            brand: {
              alignment: preferedBrandLayout || random(BrandLayout.prototype.variations.alignment)
            },
            slogan: { style: random(SloganLayout.prototype.variations.style) },
            symbol: {
              position: window.symbolOnly ? 'top' : random(SymbolLayout.prototype.variations.position),
              decoration:
                decorationStyle !== 'none' || window.symbolOnly
                  ? 'none'
                  : random(SymbolLayout.prototype.variations.decoration)
            },
            card: {
              logoMode: random(CardLayout.prototype.variations.logoMode),
              justify: random(CardLayout.prototype.variations.justify),
              style: random(CardLayout.prototype.variations.style),
              showSymbol: random(CardLayout.prototype.variations.showSymbol),
              orientation: random(CardLayout.prototype.variations.orientation),
              colorMode: random(CardLayout.prototype.variations.colorMode)
            }
          },
          color: {
            palette: [...theme] // , // ['#FFFFFF', '#000000', color, color2],
            // paletteDark: [theme[1], theme[0], theme[2], theme[3]] // ['#000000', '#FFFFFF', '', ''],
          },
          font: {
            brand1: {
              id: fontPair.brand1.id,
              category: fontPair.brand1.category,
              fullName: fontPair.brand1.name,
              size: 1.0,
              lineSpacing: 1.0,
              letterSpacing: 1.0,
              duoColorPosition: 1.0,
              letterSpacingMethod: 'font'
            },
            brand2: {
              id: fontPair.brand2.id,
              category: fontPair.brand2.category,
              fullName: fontPair.brand2.name,
              size: 1.0,
              lineSpacing: 1.0,
              letterSpacing: 1.0,
              duoColorPosition: 1.0,
              letterSpacingMethod: 'font'
            },
            decoration: {
              id: random(this.fontResources.getBracketFonts(fontPair.brand1)).id
            },
            slogan: {
              id: sloganFont.id,
              category: sloganFont.category,
              fullName: sloganFont.name,
              size: 1.0,
              lineSpacing: 1.0,
              letterSpacing: 1.0,
              letterSpacingMethod: 'font'
            },
            card: {
              id: fontPairCard.card.id,
              category: fontPairCard.card.category,
              fullName: fontPairCard.card.name,
              size: 1.0,
              lineSpacing: 1.0,
              letterSpacing: 1.0,
              letterSpacingMethod: 'font'
            },
            cardTitle: {
              id: fontPairCard.cardTitle.id,
              category: fontPairCard.cardTitle.category,
              fullName: fontPairCard.cardTitle.name,
              size: 1.0,
              lineSpacing: 1.0,
              letterSpacing: 1.0,
              letterSpacingMethod: 'font'
            }
          },
          symbol: {
            icon: 'random',
            size: 1.0,
            spacing: 1.0,
            margin: 1.0
          }
        },
        false,
        true
      )

      if (newTemplateData.color.brand1 === undefined) {
        let bgColor = this.getBackgroundColor()
        const decorationIx = this.getRandomDecorationIx(bgColor, newTemplateData)
        newTemplateData.color.decoration = decorationIx
        if (this.getInverseShapeActive(newTemplateData)) {
          bgColor = newTemplateData.color.palette[decorationIx]
        }
        newTemplateData.color.brand1 = this.getRandomColorIx(bgColor, newTemplateData, true)
        for (let i = 0; i < 10; i++) {
          newTemplateData.color.brand2 = this.getRandomColorIx(bgColor, newTemplateData, true)
          if (newTemplateData.color.brand1 !== newTemplateData.color.brand2) {
            break
          }
        }
        newTemplateData.color.slogan = this.getRandomColorIx(bgColor, newTemplateData, true)
        newTemplateData.color.symbol = this.getRandomColorIx(bgColor, newTemplateData, false)
      }

      if (randomizeFont) {
        newTemplateData.font.singleFont = true
        if (fontPair.brand1.id === fontPair.brand2.id) {
          // If the font is the same add outline if possible
          // if (newTemplateData.layout.brand.fontStyle === 'multiple' && fontPair.brand1.category !== 'handwritten' && fontPair.brand1.id.indexOf('light') === -1) {
          //   if (newTemplateData.color.brand2 !== 0) {
          //     if (Math.random() < 0.5) {
          //       // drop shadow on colored font
          //       newTemplateData.font.brand2.outline = 7.26
          //       newTemplateData.font.brand2.decoration = 2.5
          //     } else {
          //       newTemplateData.font.brand2.outline = 7.13
          //     }
          //   }
          //   newTemplateData.font.brand1.outline = 0.2
          // }
        }
      }

      if (randomizeActive) {
        // if (Math.random() > 0.15) {
        //   newTemplateData.color.brand2 = newTemplateData.color.brand1
        // }
        if (newTemplateData.layout.symbol.position === 'behind') {
          newTemplateData.layout.decoration.style = 'none'
          newTemplateData.layout.symbol.decoration = 'none'
        }

        if (['none', 'rectangle'].indexOf(newTemplateData.layout.decoration.style) === -1) {
          if (newTemplateData.layout.symbol.position !== 'none') {
            newTemplateData.layout.symbol.position = 'top'
          }
          if (this.brandWords.length > 1 && !preferedBrandLayout) {
            newTemplateData.layout.brand.alignment = 'vertical'
          }
          newTemplateData.layout.slogan.style = random(['center', 'center-fill'])
        }

        const otherLogoHashes = this.options.otherLogoHashes
        if (otherLogoHashes) {
          const md5Hash = this.getMD5(newTemplateData)
          if (otherLogoHashes[md5Hash]) {
            // if (i >= 99) {
            //   console.log('out of random variations', i)
            // }
            continue
          }
        }
      }
      break
    }

    this.templateData = newTemplateData
  }

  updateBackground = darkTheme => {
    this.colorMode = darkTheme ? 1 : 0
  }

  setColorMode = colorMode => {
    this.colorMode = colorMode
    // if (this.colorMode === 2 ||
    //   this.colorMode === 4) {
    //   this.element.style.background = 'black'
    // } else {
    //   this.element.style.background = null
    // }
    if (this.rootLayer[this.cardLayoutShown]) {
      this.rootLayer[this.cardLayoutShown].updatePosition()
    }
  }

  generatePreviewDiv = () => {
    const element = document.createElement('div')
    element.classList.add('amreset')
    element.style.position = 'relative'
    element.style.width = '100%'
    element.style.height = '100%'
    element.style.transition = 'opacity 500ms ease-in-out'
    element.style.opacity = 0
    if (this.parentElement) {
      AMCore.childCheck(this.parentElement, element)
    }
    this.element = element
    element.addEventListener('mousedown', e => {
      if (debugUnlockedStage === 0) {
        if ((!e.metaKey && e.altKey) || document.location.hostname === 'localhost') {
          debugUnlockedStage = 1
          e.preventDefault()
          e.stopPropagation()
        }
      }
    })

    element.addEventListener('click', e => {
      if ((document.location.hostname === 'localhost' || e.metaKey) && e.altKey) {
        if (debugUnlockedStage > 0) {
          debugUnlockedStage = 2
          this.addDebugUI()
        }
        e.preventDefault()
        e.stopPropagation()
      }
    })

    this.updateLayout(true)
    // console.log('generate previewdiv')
    this.checkLoadingFinished()
  }

  getSVG = () => {
    return this.getSVGAgain()
    // AK: removed, this was more trouble then it's worth
    // Strip outer scalers
    // const mylogo = this.rootLayer.layerElement
    // let src = mylogo.innerHTML
    // const box = mylogo.getBBox()

    // // Add template colors as a palette, so they can be modded.
    // // This does not replace literal texts (white/black) or rgba(x,x,x,x) so you MUST use white/black in masks!
    // let palette = ''
    // let colors = this.templateData.color.palette
    // for (let idx in colors) {
    //   const hex = colors[idx]
    //   // patch: #fff and #ffffff are the same, but not always generated as such!
    //   if (hex.startsWith('#') && hex.length === 4) {
    //     const hex2 = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    //     const replacer2 = new RegExp(hex2, 'gi')
    //     src = src.replace(replacer2, hex)
    //   }

    //   const replacer = new RegExp(hex, 'gi')
    //   src = src.replace(replacer, `url('#clr${idx}')`)
    //   palette += `<lineargradient id="clr${idx}"><stop offset="100%" stop-color="${hex}" /></lineargradient>`
    // }

    // // string variant replaces first instance only!
    // src = src.replace('>', ` viewBox='${box.x} ${box.y} ${box.width} ${box.height}' ><defs>${palette}</defs>`)

    // return src
  }

  getPreviewSVG = () => {
    return this.getSVGAgain()
    // AK: removed, this was more trouble then it's worth
    // Strip outer scalers
    // const mylogo = this.element.firstChild.firstChild.firstChild
    // SvgHelper.colorSvg(mylogo, '#ffffff')

    // let src = mylogo.innerHTML
    // const box = mylogo.getBBox()

    // // Add template colors as a palette, so they can be modded.
    // // This does not replace literal texts (white/black) or rgba(x,x,x,x) so you MUST use white/black in masks!
    // let palette = ''
    // let colors = [...this.templateData.color.palette]
    // for (let idx in colors) {
    //   const hex = colors[idx]
    //   // patch: #fff and #ffffff are the same, but not always generated as such!
    //   if (hex.startsWith('#') && hex.length === 4) {
    //     const hex2 = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    //     const replacer2 = new RegExp(hex2, 'gi')
    //     src = src.replace(replacer2, hex)
    //   }

    //   const replacer = new RegExp(hex, 'gi')
    //   src = src.replace(replacer, `url('#clr${idx}')`)
    //   palette += `<lineargradient id="clr${idx}"><stop offset="100%" stop-color="${hex}" /></lineargradient>`
    // }

    // // string variant replaces first instance only!
    // src = src.replace('>', ` viewBox='${box.x} ${box.y} ${box.width} ${box.height}' ><defs>${palette}</defs>`)

    // return src
  }

  getSVGAgain = () => {
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    rootLayer.containerElement.style.opacity = 1
    if (rootLayer.containerElement.dataLogoAnimate) {
      rootLayer.containerElement.dataLogoAnimate.remove()
      AMCore.triggerDOMUpdate(rootLayer.containerElement)
    }
    return this.rootLayer[this.cardLayoutShown].containerElement.outerHTML
  }

  getCanvas = (width, height, callback, options) => {
    options = options || {}
    width = width || this.parentElement.clientWidth
    height = height || this.parentElement.clientHeight
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    if (rootLayer.containerElement.dataLogoAnimate) {
      rootLayer.containerElement.dataLogoAnimate.remove()
      AMCore.triggerDOMUpdate(rootLayer.containerElement)
      // console.log('****************ANIMATION REMOVED FOR SAVE *****************')
      // console.log(rootLayer.containerElement.outerHTML)
    }
    const svgBox = rootLayer.containerElement.getBBox()
    const logoAspect = svgBox.width / svgBox.height // this.rootLayer.containerElement.clientWidth / this.rootLayer.containerElement.clientHeight

    if (Number.isFinite(logoAspect) && logoAspect > 0.1 && logoAspect < 2.0) {
      if (width / height > logoAspect) {
        width = height * logoAspect
      } else {
        height = width / logoAspect
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    context.setTransform(1, 0, 0, 1, 0, 0)

    if (options.addBackground) {
      context.strokeStyle = 'none'
      context.fillStyle = options.backgroundColor || '#ffffff' // AMCore.colorToStyle(this.templateData.color.background)
      context.fillRect(-1, -1, width + 1, height + 1)
    }

    const image = new window.Image()
    image.onload = function () {
      try {
        context.drawImage(image, 1, 1, width, height)
      } catch (e) {
        console.error('Error rendering logo: ', e)
      }

      callback(canvas, context)
    }

    // For firefox because they won't fix an 8 year longstanding bug
    // https://bugzilla.mozilla.org/show_bug.cgi?id=700533
    SvgHelper.setAttributeValues(rootLayer.containerElement, {
      width: width + 'px',
      height: height + 'px'
    })

    const svgStr = rootLayer.containerElement.outerHTML
    image.src = 'data:image/svg+xml,' + window.escape(svgStr)

    image.onerror = function (e) {
      console.error('Error rendering logo: ', e)
      callback(canvas, context)
    }
  }

  getPng = (width, height, callback, addBackground = false) => {
    this.getCanvas(
      width,
      height,
      (canvas, context) => {
        callback(canvas.toDataURL('image/png', 100))
      },
      { addBackground }
    )
  }

  getPngPromise = (width, height, addBackground = false) => {
    return new Promise((resolve, reject) => {
      this.getCanvas(
        width,
        height,
        (canvas, context) => {
          resolve(canvas.toDataURL('image/png', 100))
        },
        { addBackground }
      )
    })
  }

  getPngAsBlob = (width, height, callback, options) => {
    this.getCanvas(
      width,
      height,
      (canvas, context) => {
        canvas.toBlob(blob => callback(blob), 'image/png', 100)
        // if (options.alsoFilledVersion) {
        //   context.globalCompositeOperation = "destination-over"
        //   context.fillStyle = "white"
        //   context.fillRect(-1, -1, canvas.width + 2, canvas.height + 2)
        //   canvas.toBlob(blob => callback(blob, true), 'image/png', 100)
        // }
      },
      options
    )
  }

  // Some test functions for console use
  renderLogoAsPng = () => {
    this.getPng(undefined, undefined, url => {
      window.renderResult = url
    })
  }

  renderAsSvg = () => {
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    rootLayer.containerElement.style.opacity = 1.0
    const svgStr = rootLayer.containerElement.outerHTML
    window.renderResult = 'data:image/svg+xml,' + window.escape(svgStr)
    return window.renderResult
  }

  getPreviewElement = () => {
    this.checkPreviewElement()
    return this.element
  }

  getCanvasFromConfig (config, canvasFinished) {
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    const svgBox = rootLayer.containerElement.getBBox()
    const logoAspect = svgBox.width / svgBox.height // this.rootLayer.containerElement.clientWidth / this.rootLayer.containerElement.clientHeight

    let width = config.width || 0
    let height = config.height || 0
    if (Number.isFinite(logoAspect) && logoAspect > 0.05 && logoAspect < 20.0) {
      if (width === -1) {
        if (height === -1) {
          height = rootLayer.box.height
        }
        width = height * logoAspect
      } else {
        if (height === -1) {
          height = width / logoAspect
        }
      }
    }

    if (config.isCircle) {
    }

    let svgWidth = width
    let svgHeight = height
    if (config.margin) {
      const maxSvgWidth = width / (1 + config.margin * 2)
      const maxSvgHeight = height / (1 + config.margin * 2)

      if (maxSvgWidth / maxSvgHeight > logoAspect) {
        svgHeight = maxSvgHeight
        svgWidth = svgHeight * logoAspect
      } else {
        svgWidth = maxSvgWidth
        svgHeight = svgWidth * logoAspect
      }
    } else {
      if (width / height > logoAspect) {
        svgHeight = height
        svgWidth = svgHeight * logoAspect
      } else {
        svgWidth = width
        svgHeight = svgWidth * logoAspect
      }
    }
    const marginX = (width - svgWidth) * 0.5
    const marginY = (height - svgHeight) * 0.5

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    context.setTransform(1, 0, 0, 1, 0, 0)

    if (config.background && config.background !== 'transparent' && config.background !== 'none') {
      let color = config.background || '#ffffff' // AMCore.colorToStyle(this.templateData.color.background)
      if (color === 'auto') {
        color = AMCore.colorToStyle(this.getBackgroundColor())
        if (this.getInverseShapeActive()) {
          const decorationIx = this.templateData.color.decoration
          color = AMCore.colorToStyle(this.templateData.color.palette[decorationIx])
        }
      }
      context.strokeStyle = 'none'
      context.fillStyle = color
      context.fillRect(-1, -1, width + 1, height + 1)
      //  Can also be done aftwards with
      // context.globalCompositeOperation = "destination-over"
    }

    const image = new window.Image()
    image.onload = function () {
      try {
        context.drawImage(image, marginX, marginY, svgWidth, svgHeight)
      } catch (e) {
        console.error('Error rendering logo: ', e)
      }
      canvasFinished(config, canvas, context)
    }

    // For firefox because they won't fix an 8 year longstanding bug
    // https://bugzilla.mozilla.org/show_bug.cgi?id=700533
    SvgHelper.setAttributeValues(rootLayer.containerElement, {
      width: svgWidth + 'px',
      height: svgHeight + 'px'
    })

    rootLayer.containerElement.style.opacity = 1.0
    const svgStr = rootLayer.containerElement.outerHTML
    image.src = 'data:image/svg+xml,' + window.escape(svgStr)

    image.onerror = function (e) {
      console.error('Error rendering logo: ', e)
      canvasFinished(config, canvas, context)
    }
  }

  // Remember to set colormode back after doing all the images by this.setColorMode(0)
  getImageFromConfig (config, imageFinished) {
    config = { ...defaultImageConfig, ...config }
    const type = config.type.toLowerCase()
    const colorMode = colorModes.indexOf(config.colorMode.toLowerCase())
    let extraDelayTime
    if (colorMode !== -1 && colorMode !== this.colorMode) {
      this.setColorMode(colorMode)
      extraDelayTime = Date.now()
    }
    const handleFinished = (config, data) => {
      if (extraDelayTime) {
        const expiredTime = Date.now() - extraDelayTime
        setTimeout(imageFinished.bind(this, config, data), Math.max(1, 250 - expiredTime))
      } else {
        imageFinished(config, data)
      }
    }
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    rootLayer.containerElement.style.opacity = 1.0

    if (config.animate) {
      if (!rootLayer.containerElement.dataLogoAnimate) {
        if (new LogoAnimate(rootLayer.containerElement)) {
          AMCore.triggerDOMUpdate(rootLayer.containerElement)
        }
      }
    } else if (rootLayer.containerElement.dataLogoAnimate) {
      rootLayer.containerElement.dataLogoAnimate.remove()
      AMCore.triggerDOMUpdate(rootLayer.containerElement)
    }

    if (type === 'png' || type === 'jpg') {
      this.getCanvasFromConfig(config, (config, canvas, context) => {
        if (type === 'jpg') {
          canvas.toBlob(blob => handleFinished(config, blob), 'image/jpeg', config.quality)
        } else {
          canvas.toBlob(blob => handleFinished(config, blob), 'image/png', 100)
        }
      })
    } else if (type === 'svg') {
      const svgStr = rootLayer.containerElement.outerHTML
      handleFinished(config, '<?xml version="1.0"?>' + svgStr.replaceAll('rgb(0, 0, 0)', this.svgColor))
    } else {
      console.error('Error in export config!')
      handleFinished(config, undefined)
    }
  }

  downloadLogoPack = onSuccess => {
    const configs = this.getConfigs(true)

    if (this.checkAllResourcesLoaded()) {
      this.updateLayout(false, () => {
        this.createLogoZip(configs, async (blob, zipName) => {
          saveAs(blob, zipName)
          onSuccess && onSuccess()
        })
      })
    }
  }

  getConfigs = (shouldGetAll, limitations = []) => {
    const allConfigs = []
    const legacyName = this.templateData.text.brandName
      .replace(/\[|\]|\|/g, '')
      .toLowerCase()
      .replace(/\s(\w)/g, (s, a) => a.toUpperCase())

    // Get all the appropriate configs in a flat list
    for (const groupName in DownloadConfig) {
      const groupConfig = DownloadConfig[groupName]
      const limitation = groupConfig._limitation
      let legacyFound = false
      if (
        shouldGetAll ||
        !limitation ||
        limitations.indexOf('logo_download_' + limitation) !== -1 ||
        limitations.indexOf('logobuilder_unlimited_account') !== -1
      ) {
        for (const fileName in groupConfig) {
          if (!fileName.startsWith('_')) {
            const config = groupConfig[fileName]
            if (groupConfig._useOldStyle) {
              legacyFound = true
              config.fileName = legacyName + (config.noExtension ? '' : '.' + config.type || 'png')
            } else {
              config.fileName = groupName + '/' + fileName + (config.noExtension ? '' : '.' + config.type || 'png')
            }
            allConfigs.push(config)
          }
        }
        if (legacyFound && limitations.indexOf('logobuilder_unlimited_account') === -1) {
          break
        }
      }
    }

    return allConfigs
  }

  createLogoZip = async (configs, onFinish) => {
    const zip = new JSZip()
    const zipName =
      this.templateData.text.brandName
        .replace(/\[|\]|\|/g, '')
        .toLowerCase()
        .replace(/\s(\w)/g, (s, a) => a.toUpperCase()) + '.zip'

    // We don't want to make them all at once, that would take way too much memory
    const icon = this.createSymbolLayout()

    for (let currentConfigIx = 0; currentConfigIx < configs.length; currentConfigIx++) {
      const config = configs[currentConfigIx]
      const blob = await new Promise(resolve => {
        if (config.isIcon) {
          const interval = setInterval(() => {
            icon.update()
            const div = document.createElement('div')
            div.setAttribute('id', 'symbol')
            div.style.position = 'absolute'
            div.style.top = -999999
            div.style.width = '100%'
            div.style.height = '100%'
            document.body.appendChild(div)
            div.innerHTML = ''
            div.appendChild(icon.getPreviewElement())
            if (icon.checkAllResourcesLoaded()) {
              if (config.type === 'svg') {
                const rootLayer = this.rootLayer[this.cardLayoutShown]
                const svgStr = rootLayer.containerElement.outerHTML
                this.svgColor = svgStr
                  .split('fill=')
                  .pop()
                  .slice(0, 9)
              }
              icon.getImageFromConfig(configs[currentConfigIx], (_, blob) => {
                zip.file(config.fileName, blob)
                resolve(blob)
              })
              clearInterval(interval)
              document.getElementById('symbol')?.remove()
            }
          }, 100)
        } else {
          this.getImageFromConfig(config, (_config, blob) => {
            resolve(blob)
          })
        }
      })
      zip.file(config.fileName, blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    onFinish(zipBlob, zipName)
    this.setColorMode(0)
  }

  addResource = resource => {
    if (!resource.isLoaded) {
      this.updateNeeded = true
    }

    let found = false
    for (let i = 0; i < this.usedResources.length; i++) {
      if (this.usedResources[i] === resource) {
        found = true
        return
      }
    }
    if (!found) {
      // if (!resource.isLoaded) {
      //   console.log('waiting for resource ', resource)
      // }
      this.usedResources.push(resource)
      // this.debugLog.push('added resource from add', resource)
    }
    // this.debugLog.push('added resource from replace', resource, newResource)

    // What is this newResource? its not defined
    // this.usedResources.push(newResource)
  }

  replaceResource = (resource, newResource) => {
    if (!newResource.isLoaded) {
      this.updateNeeded = true
    }

    for (let i = 0; i < this.usedResources.length; i++) {
      if (this.usedResources[i] === resource) {
        // this.debugLog.push('replaced resource', resource, newResource)
        this.usedResources[i] = newResource
        return
      }
    }
    // this.debugLog.push('added resource from replace', resource, newResource)
    this.usedResources.push(newResource)
  }

  checkAllResourcesLoaded = () => {
    for (let i = 0; i < this.usedResources.length; i++) {
      if (!this.usedResources[i].isLoaded) {
        // console.log('not loaded yet>>....', this.usedResources)
        return false
      }
    }
    this.isLoaded = true
    return true
  }

  matchSizes = () => {
    if (!this.sizesMatched) {
      let symbolInstance
      for (const res of this.usedResources) {
        if (res.isLoaded && res.analyzeData) {
          symbolInstance = res
        }
      }

      if (!symbolInstance) {
        return
      }

      this.sizesMatched = true
      const fontAnalyzed = x => {
        const scale = (fi.analyzeData.averageThickness / symbolInstance.analyzeData.averageThickness) * 0.15
        if (isFinite(scale) && symbolInstance.analyzeData.fillPercentage < 0.5) {
          // this.templateData.symbol.size = Math.min(Math.max(scale, 0.5), 2.0)
          // console.log('resized: ', symbolInstance.analyzeData.averageThickness, fi.analyzeData.averageThickness, this.templateData.symbol.size, scale)
        }
      }
      const fi = this.symbolResources.getSymbolInstance(
        {
          type: 'initials',
          id: 'dp',
          fontId: this.templateData.font.brand1.id,
          initials: 'dp' // abcdefghijklmnopqrstuvwxyz
        },
        fontAnalyzed
      )
      if (fi.isLoaded) {
        fontAnalyzed(fi)
      }
    }
  }

  handleSymbolLoaded = symbolInstance => {
    if (symbolInstance.isLoaded && this.randomSymbol === symbolInstance) {
      if (symbolInstance.getSymbolIsInverted()) {
        if (this.templateData.layout.symbol.decoration !== 'none') {
          this.templateData.layout.symbol.decoration = 'none'
        }
      }

      if (!symbolInstance.getSymbolOk()) {
        if (this.randomRetries < 3) {
          // this.debugLog.push('wrong symbol, do retry', symbolInstance)
          // console.log('symbol error, do retry')
          this.randomSymbol = null
          this.randomRetries++
          this.getSymbolInstance('random')
        } else {
          console.error('Problem getting a valid symbol after 3 tries!')
        }
      }
    }
    if (symbolInstance.symbolData !== this.templateData.symbol.icon) {
      AMCore.extendRecursive(this.templateData.symbol.icon, symbolInstance.symbolData, true, false)
    }
    // this.debugLog.push('handleSymbolLoaded', symbolInstance)
    // console.log('symbol loaded: ', symbolInstance)
    this.checkLoadingFinished()
  }

  handleFontLoaded = fontInstance => {
    // console.log('font loaded: ', fontInstance)
    this.checkLoadingFinished()
  }

  checkLoadingFinished = () => {
    if (this.updateNeeded) {
      this.updateNeeded = false
      this.updateLayout()
    }
  }

  animateLogo = () => {
    let maxTries = 50
    const startIfOnScreen = () => {
      const el = this.element // rootLayer.containerElement
      const onScreen = el && el.closest('body')
      if (onScreen) {
        // Done in timer after updateLayout
        // this.element.style.opacity = this.options.targetOpacity || 1
        if (new LogoAnimate(this.rootLayer[this.cardLayoutShown].containerElement)) {
          // Shut up jslint i can use new
        }
      } else {
        if (maxTries--) {
          setTimeout(startIfOnScreen, 100)
        }
      }
      return onScreen
    }

    startIfOnScreen()
  }

  getInverseShapeActive = templateData => {
    templateData = templateData || this.templateData
    return (
      templateData &&
      templateData.layout &&
      templateData.layout.decoration &&
      templateData.layout.decoration.style !== 'none' &&
      templateData.background &&
      templateData.background.inverse
    )
  }

  getColor = (name, notSameName) => {
    let ix = this.templateData.color[name]
    const nix = notSameName ? this.templateData.color[notSameName] : -1
    if (name !== 'decoration' && this.getInverseShapeActive()) {
      if (ix === this.templateData.color.decoration) {
        ix = 0
      }
    }
    if (nix === ix) {
      let bgColor = this.getBackgroundColor()
      if (this.getInverseShapeActive(this.templateData)) {
        const decorationIx = this.templateData.color.decoration
        bgColor = this.templateData.color.palette[decorationIx]
      }
      ix = this.getRandomColorIx(bgColor, this.templateData, false, nix)
    }
    let clr = this.templateData.color.palette[ix]
    if (this.colorMode !== 0) {
      if (this.colorMode === 1 || this.colorMode === 2) {
        // gray scale
        let l = AMCore.getLightness(AMCore.gammaToLinear(clr))
        if (this.colorMode === 2) {
          l = 1 - l // gray scale inverted
        }
        clr = AMCore.linearToGamma([l, l, l])
      } else if (this.colorMode === 3 || this.colorMode === 4) {
        // duo tone
        if (this.getInverseShapeActive()) {
          if (name !== 'decoration') {
            clr = [255, 255, 255]
          } else {
            clr = [0, 0, 0]
          }
        } else {
          clr = [0, 0, 0]
        }
        if (this.colorMode === 4) {
          if (clr[0] > 127) {
            clr = [0, 0, 0]
          } else {
            clr = [255, 255, 255]
          }
        }
      }
    }
    return clr
  }

  getBackgroundData = backgroundData => {
    backgroundData = AMCore.clone(backgroundData)
    AMCore.extendRecursive(backgroundData, this.templateData.background, true, false)
    return backgroundData
  }

  getSymbolData = symbolData => {
    symbolData = AMCore.clone(symbolData)
    symbolData.symbol = this.getSymbolInstance(this.templateData.symbol.icon)
    symbolData.decoration = this.templateData.layout.symbol.decoration
    symbolData.size = this.templateData.symbol.size
    symbolData.spacing = this.templateData.symbol.spacing
    return symbolData
  }

  getSymbolInstance = symbolRec => {
    if (symbolRec === 'random') {
      if (!this.randomSymbol) {
        this.randomSymbol = this.symbolResources.getExternalRef(this.handleSymbolLoaded)
        this.symbolResources.getRandomSymbol(this.wordInstance, this.templateData.text).then(icon => {
          // this.debugLog.push('loadExternalRef', icon)
          if (icon) {
            this.templateData.symbol.icon = icon
            const newResource = this.symbolResources.loadExternalRef(this.randomSymbol, icon, this.handleSymbolLoaded)
            this.replaceResource(this.randomSymbol, newResource)
            this.randomSymbol = newResource

            // console.log('random resolved, ', newResource)
            if (newResource.isLoaded) {
              this.handleSymbolLoaded(newResource)
            }
          }
        })
      }

      // this.debugLog.push('random add', this.randomSymbol)
      this.addResource(this.randomSymbol)
      return this.randomSymbol
    } else {
      const symbolInstance = this.symbolResources.getSymbolInstance(symbolRec, this.handleSymbolLoaded)
      if (symbolInstance) {
        // this.debugLog.push('normal add', symbolInstance)
        this.addResource(symbolInstance)
        return symbolInstance
      } else {
        return null
      }
    }
  }

  getFontInstance = (fontRec, text) => {
    const fontRec2 = { ...fontRec }
    if (fontRec.fontFrom) {
      let fontFrom = fontRec.fontFrom
      let lineHeight
      if (this.templateData.font.singleFont && fontRec.fontFrom === 'brand2') {
        fontFrom = 'brand1'
        const rec = this.templateData.font[fontFrom]
        lineHeight = rec ? rec.lineSpacing : undefined
      }

      const templateFontRec = this.templateData.font[fontFrom]
      if (templateFontRec) {
        if (templateFontRec.id && templateFontRec.id !== '') {
          fontRec2.id = templateFontRec.id
        }

        if (templateFontRec.size) {
          fontRec.fontScale = templateFontRec.size
          if (fontRec.fontFrom === 'brand1' && this.templateData.logoVersion >= 2 && text.length > 0) {
            fontRec.fontScale *= 8 / text.length
          }
        }
        if (templateFontRec.lineSpacing) {
          fontRec.lineSpacing = lineHeight || templateFontRec.lineSpacing
        }
        if (templateFontRec.letterSpacing) {
          fontRec.letterSpacing = templateFontRec.letterSpacing
        }
        if (templateFontRec.letterSpacingMethod) {
          fontRec.letterSpacingMethod = templateFontRec.letterSpacingMethod
        }
        if (templateFontRec.outline) {
          fontRec.outline = templateFontRec.outline
        }
        if (isFinite(templateFontRec.duoColorPosition)) {
          fontRec.duoColorPosition = templateFontRec.duoColorPosition
        }
      }
    }

    const fontInstance = this.fontResources.getFontInstance(fontRec2, text, this.handleFontLoaded)
    this.addResource(fontInstance)
    return fontInstance
  }

  textReplacer = textIn => {
    if (textIn && typeof textIn === 'string' && textIn !== '') {
      const varRegEx = new RegExp('\\{([^\\}]+)\\}', 'g')
      const varReplaceFunc = (m, varName) => {
        const split = varName.split(':')
        const value = this.templateData.text[split[0]] || ''
        const isBrandName = split[0] === 'brandName'
        const isSlogan = split[0] === 'slogan'
        if (split.length === 2) {
          let words
          if (isBrandName) {
            words = [...this.wordInstance.brandWords]
          } else {
            if (isSlogan) {
              const count = this.templateData.layout.slogan.lineCount || 1
              const step = Math.floor(value.length / count)
              words = value.match(WordResources.wordSplitRegEx)
              const lines = []
              let line = ''
              if (words) {
                for (let ix = 0; ix < words.length; ix++) {
                  line += (line === '' ? '' : ' ') + words[ix]
                  if (line.length + 1 >= step) {
                    lines.push(line)
                    line = ''
                  }
                }
              }
              if (line !== '') {
                lines.push(line)
              }
              words = lines
            } else {
              words = value.match(WordResources.wordSplitRegEx)
            }
          }
          const index = ~~split[1]
          if (words && words.length - 1 >= index) {
            if (index === 1 && isBrandName) {
              return words.splice(1).join(' ')
            } else {
              return words[index]
            }
          } else {
            return ''
          }
        }

        return value
      }
      return textIn.replace(varRegEx, varReplaceFunc)
    } else {
      return textIn
    }
  }

  getSloganColor = () => {
    const ix = this.templateData.color.slogan
    return this.templateData.color.palette[ix]
  }

  getSloganBackground = () => {
    if (!this.getInverseShapeActive()) {
      return this.getBackgroundColor()
    } else {
      const ix = this.templateData.color.decoration
      return this.templateData.color.palette[ix]
    }
  }

  getLogoBackgroundForDownload = () => {
    if (!this.getInverseShapeActive()) {
      return this.getBackgroundColor()
    } else {
      const ix = this.templateData.color.decoration
      return this.templateData.color.palette[ix]
    }
  }

  getBackgroundColor = () => {
    return [255, 255, 255]
  }

  updateColorRestrictions = () => {
    // Status for color pick reasons
    // 1: Contrast low (!) warn before click, click just changes
    // 2: No contrast with background (filled shape) (!) warn before click that shape color will be changed
    // 3: No contrast with shape elements on the shape (filled shape) (!) warn before click that elements with the same color will be changed
    // 4: No contrast with background (no shape or not filled) (X) can't click that color because it is the same as the background

    let bgColor = this.getBackgroundColor()
    let bgColorIx = -1
    const bgShapeActive = this.getInverseShapeActive()

    const check = name => {
      this.templateData.color.restrictions = this.templateData.color.restrictions || {}
      const contrastRec = this.templateData.color.restrictions[name] || []

      for (let i = 0; i < this.templateData.color.palette.length; i++) {
        const clr = this.templateData.color.palette[i]
        const c = AMCore.getContrast(bgColor, clr)
        contrastRec[i] = {
          reason: c > 0.2 ? 0 : c > 0.0001 ? 1 : !bgShapeActive || name === 'decoration' ? 4 : 2,
          contrast: c
        }
      }
      this.templateData.color.restrictions[name] = contrastRec
    }

    if (bgShapeActive) {
      check('decoration')
      bgColorIx = this.templateData.color.decoration
      bgColor = this.templateData.color.palette[bgColorIx]
      ;['brand1', 'brand2', 'slogan', 'symbol'].forEach(name => {
        check(name)
        const ix = this.templateData.color[name]
        const clr = this.templateData.color.palette[ix]
        // if (this.templateData.color.restrictions.decoration[ix].reason < 3) {
        //   this.templateData.color.restrictions.decoration[ix] = { reason: 3, contrast: 0 }
        // }
        for (let j = 0; j < this.templateData.color.palette.length; j++) {
          const newBgColor = this.templateData.color.palette[j]
          const c = AMCore.getContrast(newBgColor, clr)
          if (c < 0.2) {
            const reason = c < 0.001 ? 3 : 5
            const decorationRestriction = this.templateData.color.restrictions.decoration[j] || {
              reason,
              contrast: c
            }
            if (reason > decorationRestriction.reason) {
              decorationRestriction.reason = reason
              decorationRestriction.contrast = c
            }
            this.templateData.color.restrictions.decoration[j] = decorationRestriction
          }
        }
      })
    } else {
      ;['brand1', 'brand2', 'slogan', 'symbol', 'decoration'].forEach(check)
    }
  }

  getWordCount = () => {
    if (!this.wordInstance) {
      return 0
    }
    return this.wordInstance.getWordCount()
  }

  checkUpgradeLetterSpacing (templateData, part) {
    if (templateData.font && templateData.font[part]) {
      const fr = templateData.font[part]
      if (fr.letterSpacing !== 1.0) {
        if (this.templateData.font[part].letterSpacingMethod !== 'physical') {
          fr.letterSpacingMethod = 'physical'
        }
      }
    }
  }

  update = (templateData, fullUpdate = false, forceUpdate = false) => {
    // console.log('!!AK update(', templateData, fullUpdate, ')')
    const lastTemplateJSON = JSON.stringify(this.templateData)

    if (templateData) {
      if (templateData.symbol && templateData.symbol.icon === 'random') {
        delete templateData.symbol.icon
      }

      if (templateData?.text?.slogan) {
        if (templateData.layout?.slogan?.lineCount === undefined) {
          if (!templateData.layout) {
            templateData.layout = {}
          }
          if (!templateData.layout.slogan) {
            templateData.layout.slogan = {}
          }
          templateData.layout.slogan.lineCount = Math.min(Math.round(templateData.text.slogan.length / 15), 3)
        }
      }

      if (templateData._zoomTo !== undefined) {
        if (this.options.zoomTo !== templateData._zoomTo) {
          // console.log('Update zoom to: ', templateData._zoomTo)
          this.options.zoomTo = templateData._zoomTo
          fullUpdate = true
        }
      }

      if (this.templateData.logoVersion >= 3) {
        this.checkUpgradeLetterSpacing(templateData, 'brand1')
        this.checkUpgradeLetterSpacing(templateData, 'brand2')
        this.checkUpgradeLetterSpacing(templateData, 'slogan')
      }

      const layoutStr = JSON.stringify(this.templateData.layout)
      const iconStr = JSON.stringify(this.templateData.symbol.icon)
      const colorStr = JSON.stringify(this.templateData.color)
      const paletteStr = JSON.stringify(this.templateData.color.palette)

      const oldDecoration = this.templateData.layout.decoration.style
      const oldInverse = this.getInverseShapeActive()
      const oldHasSlogan = !!(this.templateData.text && this.templateData.text.slogan)

      // Update our template data
      this.templateData = AMCore.clone(AMCore.extendRecursive(this.templateData, templateData, true, false))
      if (this.wordInstance && this.templateData.text) {
        this.wordInstance.updateSlogan(this.templateData.text.slogan)
        this.wordInstance.updateBrandName(this.templateData.text.brandName)
      }

      if (iconStr !== JSON.stringify(this.templateData.symbol.icon)) {
        fullUpdate = true
      }
      if (layoutStr !== JSON.stringify(this.templateData.layout)) {
        fullUpdate = true
      }
      if (this.lastFullUpdateSequence !== this.wordInstance.fullUpdateCounter) {
        this.lastFullUpdateSequence = this.wordInstance.fullUpdateCounter
        fullUpdate = true
      }
      let shapeFillChanged = false
      if (oldInverse !== this.getInverseShapeActive()) {
        fullUpdate = true
        shapeFillChanged = true
      }
      if (oldHasSlogan !== !!(this.templateData.text && this.templateData.text.slogan)) {
        fullUpdate = true
      }
      const paletteChanged = paletteStr !== JSON.stringify(this.templateData.color.palette)
      if (oldDecoration !== this.templateData.layout.decoration.style) {
        this.templateData.background = AMCore.extendRecursive(
          this.templateData.background || {},
          this.getRandomParamsForDecoration(this.templateData.layout.decoration.style),
          false,
          true
        )
        shapeFillChanged = true
      }
      if (colorStr !== JSON.stringify(this.templateData.color) || shapeFillChanged) {
        // Normalize the new color palette if necessary
        this.templateData.color.palette = fixPalette(this.templateData.color.palette)

        const oldColor = JSON.parse(colorStr)
        const shapeChangedLast = oldColor.decoration !== this.templateData.color.decoration
        const decorationIx = this.templateData.color.decoration
        const decorationColor = this.templateData.color.palette[decorationIx]
        if (this.getInverseShapeActive()) {
          if (shapeChangedLast || shapeFillChanged || paletteChanged) {
            ;['brand1', 'brand2', 'slogan', 'symbol'].forEach(name => {
              const elementIx = this.templateData.color[name]
              const elementColor = this.templateData.color.palette[elementIx]
              const margin = paletteChanged ? 0.2 : 0.001
              if (AMCore.getContrast(elementColor, decorationColor) < margin) {
                this.templateData.color[name] = this.getRandomColorIx(decorationColor)
                // console.log('Element color changed: ', name, this.templateData.color[name])
              }
            })
          } else {
            const availableShapeColors = {
              0: true,
              1: true,
              2: true,
              3: true
            }
            ;['brand1', 'brand2', 'slogan', 'symbol'].forEach(name => {
              const elementIx = this.templateData.color[name]
              const elementColor = this.templateData.color.palette[elementIx]
              for (let j = 0; j < this.templateData.color.palette.length; j++) {
                if (AMCore.getContrast(elementColor, this.templateData.color.palette[j]) < 0.001) {
                  availableShapeColors[j] = false
                }
              }
            })
            if (!availableShapeColors[this.templateData.color.decoration]) {
              for (const k in Object.keys(availableShapeColors)) {
                if (availableShapeColors[k]) {
                  this.templateData.color.decoration = Number.parseInt(k)
                  // console.log('Decoration color changed: ', this.templateData.color)
                }
              }
            }
          }
        } else {
          const bgColor = this.getBackgroundColor()
          ;['brand1', 'brand2', 'slogan', 'symbol', 'decoration'].forEach(name => {
            const clrIx = this.templateData.color[name]
            if (AMCore.getContrast(this.templateData.color.palette[clrIx], bgColor) < 0.001) {
              this.templateData.color[name] = this.getRandomColorIx(bgColor)
              // console.log('Color changed: ', name, this.templateData.color[name])
            }
          })
        }
        this.updateColorRestrictions()
      }
    }

    if (templateData) {
      AMCore.extendRecursive(templateData, this.templateData, true, false)
    }
    if (lastTemplateJSON === JSON.stringify(this.templateData) && forceUpdate === false) {
      return
    }
    // this.element.parentElement.style.backgroundColor = this.templateData.color.background
    // console.clear()
    // console.log('---------------------------------- update logo, ', fullUpdate)
    this.usedResources = []
    this.updateLayout(fullUpdate)

    return fullUpdate
  }

  updateRandomFont (category) {
    const fonts = this.fontResources.getFontsByCategory(category)
    if (fonts) {
      this.templateData.font.brand1.id = fonts[Math.floor(Math.random() * fonts.length)].id
      this.templateData.font.brand2.id = fonts[Math.floor(Math.random() * fonts.length)].id

      this.updateLayout(false)
    }
  }

  handleLogoClick = (name, ev) => {
    if (!ev.altKey) {
      this.options.onclick(name, ev)
    }
  }

  showCardLayout (show, front) {
    let newShowIx = 0
    if (show) {
      if (front === undefined) {
        // Override 0(log0) with front of card(1) leave side otherwise
        newShowIx = this.cardLayoutShown || 1
      } else {
        newShowIx = front ? 1 : 2
      }
    }
    // console.log('showCardLayout (', show, front, this.cardLayoutShown, newShowIx, ')')
    if (this.cardLayoutShown !== newShowIx) {
      this.cardLayoutShown = newShowIx
      if (!this.rootLayer[this.cardLayoutShown]) {
        this.updateLayout(false)
      } else {
        this.showCurrentLayout()
      }
    }
  }

  showCurrentLayout () {
    if (this.rotateTimeOut) {
      clearTimeout(this.rotateTimeOut)
    }
    this.rotateTimeOut = setTimeout(() => {
      for (let ix = 0; ix < 3; ix++) {
        const rl = this.rootLayer[ix]
        if (rl) {
          if (!this.options.isVariation) {
            let transformStr = ''
            if (ix === 0 && this.cardLayoutShown !== 0) {
              transformStr += 'translate3D(0,-150%,0)'
            } else {
              if (this.cardLayoutShown === 0 && ix !== 0) {
                transformStr += 'translate3D(0,100%,0)'
              } else {
                transformStr += 'translate3D(0,0,0)'
              }

              if (ix === this.cardLayoutShown) {
                transformStr += 'rotate3D(1,1,0,0deg)'
              } else {
                transformStr += 'rotate3D(1,1,0,' + (ix === 2 ? '-' : '') + '180deg)'
              }
            }
            rl.containerElement.style.transform = transformStr
          }
          rl.containerElement.style.opacity = ix === this.cardLayoutShown ? 1.0 : 0.0
        }
      }
      this.rotateTimeOut = null
    }, 100)
  }

  createLayout () {
    if (this.cardLayoutShown !== 0) {
      this.logoLayout[this.cardLayoutShown] = new CardLayout(
        this.templateData,
        { wordInstance: this.wordInstance, isFront: this.cardLayoutShown === 1 },
        this
      )
    } else {
      this.logoLayout[0] = new LogoLayout(this.templateData, { wordInstance: this.wordInstance })
    }
    const layout = this.logoLayout[this.cardLayoutShown].getLayout()
    if (this.rootLayer[this.cardLayoutShown]) {
      const removeLayer = this.rootLayer[this.cardLayoutShown]
      // if (!this.options.isVariation) {
      //   removeLayer.containerElement.style.transform = 'rotate3D(1,1,0,180deg)'
      // }
      removeLayer.containerElement.style.opacity = 0
      setTimeout(() => {
        AMCore.removeChildCheck(removeLayer.containerElement)
      }, transitionTime + 50)
    }
    const rootLayer = (this.rootLayer[this.cardLayoutShown] = new AMGroupLayer(layout))

    let element = this.element
    let shadow
    // Use the shadow dom if it is supported to avoid conflict between styles and global defs
    if (element.attachShadow) {
      if (AMCore.checkOlder('safari', '12.1')) {
        // Safari broke svg in a shadow dom, it has a bug that was open for 2 YEARS!!! it was not fixed because of a (stupid) semantic discussion over the implementation
        console.warn('Shadow dom disabled, update safari for a fix https://bugs.webkit.org/show_bug.cgi?id=174977')
      } else {
        shadow = element.shadowRoot || element.attachShadow({ mode: 'open' })
        element = shadow
      }
    }

    // while (element.firstChild) {
    //   element.removeChild(element.firstChild)
    // }
    rootLayer.initialize(element, {
      templateData: this.templateData,
      textReplacer: this.textReplacer,
      getFontInstance: this.getFontInstance,
      getSymbolData: this.getSymbolData,
      getBackgroundData: this.getBackgroundData,
      getColor: this.getColor,
      intialWidth: this.options.intialWidth,
      intiaHeight: this.options.intialHeight,
      zoomTo: this.options.zoomTo,
      onclick: this.options.onclick ? this.handleLogoClick : undefined,
      readOnly: true
    })

    rootLayer.containerElement.style.position = 'absolute'
    rootLayer.containerElement.style.left = 0
    rootLayer.containerElement.style.top = 0
    rootLayer.containerElement.style.transition = 'all ' + transitionTime + 'ms ease-in-out'
    rootLayer.containerElement.style.backfaceVisibility = 'hidden'
    rootLayer.containerElement.style.opacity = 0.0
    if (!this.options.isVariation) {
      rootLayer.containerElement.style.transform = 'rotate3D(1,1,0,0deg)'
    }

    if (!this.waterMarkImage) {
      const image = new window.Image()
      image.src = 'data:image/svg+xml,' + window.escape(waterMarkStr)
      image.style.position = 'absolute'
      image.style.width = '100%'
      image.style.height = '100%'
      this.waterMarkImage = image
      this.waterMarkImage.style.zIndex = 1
    }

    this.waterMarkImage.remove()
    element.appendChild(this.waterMarkImage)

    // this.showCurrentLayout()
    // if (shadow) {
    //   shadow.appendChild(this.rootLayer.containerElement)
    // }
  }

  createSymbolLayout (templateData = this.templateData) {
    const template = {
      ...AMCore.clone(templateData),
      layout: {
        ...AMCore.clone(templateData.layout),
        decoration: {
          style: 'none'
        },
        symbol: {
          ...AMCore.clone(templateData.layout.symbol),
          position: 'top'
        }
      },
      noBrandLayout: true,
      noSloganLayout: true
    }

    if (templateData.layout.symbol.position === 'none') {
      AMCore.extendRecursive(
        template,
        {
          layout: {
            ...AMCore.clone(templateData.layout),
            decoration: {
              style: 'none'
            },
            symbol: {
              position: 'top'
            }
          },
          symbol: {
            icon: {
              type: 'initials'
            }
          }
        },
        true,
        false
      )
    }
    return new LogoInstance(template)
  }

  getDimensions = () => {
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    const svgBox = rootLayer.containerElement.getBBox()
    const width = svgBox.width || rootLayer.containerElement.viewBox.baseVal.width
    const height = svgBox.height || rootLayer.containerElement.viewBox.baseVal.height
    return { width, height }
  }

  updatePreviewImage = () => {
    // Live canvas update
    if (this.previewImage) {
      const rootLayer = this.rootLayer[this.cardLayoutShown]
      const { width, height } = this.getDimensions()
      // prevent feeding an empty canvas
      if (width && height) {
        try {
          // context.drawImage(this.previewImage, 1, 1, w, h)
          // Call everyone who wanted the canvas and make a list of removed elements
          const toBeRemoved = []
          for (const previewRender of this.previewRenderList) {
            if (previewRender.element && previewRender.element.closest('body')) {
              window.requestAnimationFrame(previewRender.callback)
            } else {
              toBeRemoved.push(previewRender)
            }
          }

          // Clean up the removed elements and previewImage if no one is listening
          if (toBeRemoved.length > 0) {
            if (this.previewRenderList.length === toBeRemoved.length) {
              this.previewRenderList = []
            } else {
              for (const pr of toBeRemoved) {
                const ix = this.previewRenderList.indexOf(pr)
                if (ix !== -1) {
                  this.previewRenderList.splice(ix, 1)
                }
              }
            }
            if (this.previewRenderList.length === 0) {
              this.previewImage = null
            }
          }
        } catch (e) {
          console.error('Error rendering logo: ', e)
        }
        // For firefox because they won't fix an 8 year longstanding bug
        // https://bugzilla.mozilla.org/show_bug.cgi?id=700533
        SvgHelper.setAttributeValues(this.rootLayer[this.cardLayoutShown].containerElement, {
          width: width + 'px',
          height: height + 'px'
        })
        if (rootLayer.containerElement.dataLogoAnimate) {
          rootLayer.containerElement.dataLogoAnimate.remove()
          AMCore.triggerDOMUpdate(rootLayer.containerElement)
          // console.log('****************ANIMATION REMOVED FOR SAVE *****************')
          // console.log(rootLayer.containerElement.outerHTML)
        }
        const svgStr = rootLayer.containerElement.outerHTML
        this.previewImage.src = 'data:image/svg+xml,' + window.escape(svgStr)
      }
    }
  }

  findTaggedLayer (name, type) {
    return this.rootLayer[0].findTaggedLayer(name, type)
    // const searchInLayer = layer => {
    //   const settings = layer.settings
    //   if (settings.tag === name) {
    //     if (settings.type === type) {
    //       return layer
    //     }
    //   }
    //   if (settings.type === 'group') {
    //     for (let ix = 0; ix < settings.layers.length; ix++) {
    //       const result = searchInLayer(settings.layers[ix]._owner)
    //       if (result) {
    //         return result
    //       }
    //     }
    //   }
    // }
    // return searchInLayer(this.rootLayer[0])
  }

  getSloganWidth = () => {
    const sloganLayer = this.findTaggedLayer('slogan', 'text')
    if (sloganLayer) {
      return sloganLayer.textWidth / sloganLayer.settings._parent._owner.calculatedWidth
    }

    // const sloganHover = this.rootLayer[this.cardLayoutShown].hoverElements.slogan
    // if (sloganHover) {
    //   const sloganSettings = this.rootLayer[this.cardLayoutShown].hoverElements.slogan.layer.dataSettings
    //   let childLayer
    //   for (const layer of sloganSettings.layers) {
    //     if (layer.tag && layer.tag === 'slogan') {
    //       console.log('getSloganWidth3')
    //       childLayer = layer
    //       break
    //     }
    //   }

    //   if (childLayer && childLayer._pos && childLayer._pos.width) {
    //     console.log('getSloganWidth4', childLayer._owner.textWidth / sloganSettings._owner.calculatedWidth)
    //     return childLayer._owner.textWidth / sloganSettings._owner.calculatedWidth
    //   }
    //   console.log('getSloganWidth2')
    //   return 0.1
    // }

    // console.log('getSloganWidth1')
    return 1.0 // Default to fullwitdth if no slogan so controls get disabled
  }

  rerender = (onFinish, fullUpdate) => {
    // if (this.checkAllResourcesLoaded()) {
    if (this.renderer) {
      this.renderer = null
    }

    // This times 3 works on all layouts, all double updates from amgrouplayer are removed, TODO: find a way to do just the right amount
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    const start = window.performance.now()
    if (fullUpdate) {
      rootLayer.updatePosition()
      rootLayer.updatePosition()
    }
    rootLayer.updatePosition()
    const stop = window.performance.now()
    this.renderTime += stop - start

    this.renderer = setTimeout(() => {
      // Done in timer after updateLayout
      const start = window.performance.now()
      rootLayer.updatePosition()
      rootLayer.lastPass = true
      rootLayer.updatePosition()
      if (this.templateData.layout.decoration.style === 'rectangle2') {
        // One extra for rectangle
        rootLayer.updatePosition()
      }
      rootLayer.lastPass = false
      const stop = window.performance.now()
      this.renderTime += stop - start
      // console.log('renderTime: ', this.logoInstanceId, this.renderTime.toFixed(2))

      this.element.style.opacity = this.options.targetOpacity || 1
      if (onFinish) {
        onFinish()
      }
      // rootLayer.containerElement.style.opacity = 1.0

      this.updatePreviewImage()
      this.showCurrentLayout()

      if (this.options.animate) {
        this.options.animate = false
        if (this.cardLayoutShown === 0) {
          this.animateLogo()
        }
      }
    }, 0)
    // }
  }

  checkPreviewElement () {
    if (!this.element) {
      this.generatePreviewDiv()
    }
  }

  updateLayout (fullUpdate = false, onRendered) {
    this.checkPreviewElement()
    let rootLayer = this.rootLayer[this.cardLayoutShown]

    if (!rootLayer || fullUpdate) {
      this.createLayout()
      rootLayer = this.rootLayer[this.cardLayoutShown]
    } else {
      rootLayer.updateOptions({ templateData: this.templateData })
    }

    this.rerender(() => {
      if (onRendered) {
        onRendered()
      }
    }, fullUpdate)
  }

  updateLayoutForce () {
    this.updateLayout(true)
  }

  removeDebugUI () {
    if (debugUI) {
      debugUI.close()
      debugUI.destroy()
      debugUI = null
    }
  }

  addPreviewRenderListener (element, callback) {
    if (this.previewImage === null) {
      this.previewImage = new window.Image()
    }

    if (this.previewRenderList.indexOf(callback) === -1) {
      this.previewRenderList.push({
        element,
        callback
      })
    }
  }

  createLayoutTest () {
    this.createLayout()
    const rootLayer = this.rootLayer[this.cardLayoutShown]
    rootLayer.containerElement.style.opacity = 1.0
  }

  updatePosition () {
    // this.createLayout()
    // const start = window.performance.now()
    // this.rootLayer.updatePosition()
    // this.rootLayer.updatePosition()
    this.rootLayer[this.cardLayoutShown].updatePosition()
    // const stop = window.performance.now()
    // console.log('total time: ', stop - start)
  }

  testCreate () {
    let container = document.querySelector('.previewTestContainer')
    if (!container) {
      container = document.createElement('div')
      container.classList.add('amreset')
      container.classList.add('previewTestContainer')
      container.style.position = 'fixed'
      container.style.zIndex = 9000
      container.style.left = 0
      container.style.top = 0
      container.style.background = 'white'
      container.style.overflow = 'scroll'

      container.style.width = '100%'
      container.style.height = '100%'
      document.body.appendChild(container)
    }

    // const start = window.performance.now()
    const instances = (this.childInstances = this.childInstances || [])
    for (let i = 0; i < 50; i++) {
      const instance = new LogoInstance(
        {
          text: AMCore.clone(this.templateData.text)
        },
        container,
        {}
      )
      instance.showCardLayout(true, true)
      instances.push(instance)
      instance.element.style.width = '20%'
      instance.element.style.height = '15%'
      instance.element.style.display = 'inline-block'
    }
    // const stop = window.performance.now()
    // console.log('total time: ', stop - start)
  }

  testCreateImage () {
    let container = document.querySelector('.previewTestContainer')
    if (!container) {
      container = document.createElement('div')
      container.classList.add('amreset')
      container.classList.add('previewTestContainer')
      container.style.position = 'fixed'
      container.style.zIndex = 9000
      container.style.left = 0
      container.style.top = 0
      container.style.background = 'white'
      container.style.overflow = 'scroll'

      container.style.width = '100%'
      container.style.height = '100%'
      document.body.appendChild(container)
    }

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const instance = new LogoInstance(
          {
            text: {
              brandName: this.templateData.text.brandName,
              slogan: this.templateData.text.slogan
            },
            layout: {
              symbol: {
                position: 'none'
              }
            }
          },
          null,
          {}
        )

        instance.generatePreviewDiv()
        window.setTimeout(() => {
          instance.createLayout()
          instance.rootLayer.updatePosition()
          instance.rootLayer.updatePosition()
          instance.rootLayer.updatePosition()
          instance.previewImage = new window.Image()
          instance.updatePreviewImage()

          const element = instance.previewImage
          element.style.width = '10%'
          element.style.height = '9%'
          element.style.display = 'inline-block'
          container.appendChild(element)
        }, 100)
      }, 30 * i)
    }
  }

  updateLayoutAndChilds () {
    this.updateLayout()
    if (this.childInstances) {
      // let update = {
      //   text: {
      //     brandName: this.templateData.text.brandName,
      //     slogan: this.templateData.text.slogan
      //   }
      // }
      this.updateTimer = setTimeout(() => {
        const start = window.performance.now()
        for (const instance of this.childInstances) {
          instance.update()
        }
        const stop = window.performance.now()
        console.log('total update time: ', stop - start)
        this.updateTimer = null
      }, 20)
    }
  }

  reassignCardFonts () {
    const fontPairCard = this.fontResources.getRandomFontPairForCard()
    // console.log(fontPairCard.card.id, fontPairCard.cardTitle.id)
    // console.log(fontPairCard.card.name, fontPairCard.cardTitle.name)
    this.update({
      font: {
        card: {
          id: fontPairCard.card.id,
          category: fontPairCard.card.category,
          size: 1.0,
          lineSpacing: 1.0,
          letterSpacing: 1.0,
          letterSpacingMethod: 'font'
        },
        cardTitle: {
          id: fontPairCard.cardTitle.id,
          category: fontPairCard.cardTitle.category,
          size: 1.0,
          lineSpacing: 1.0,
          letterSpacing: 1.0,
          letterSpacingMethod: 'font'
        }
      }
    })
  }

  addDebugUI () {
    this.removeDebugUI()

    console.log(this)
    window.logo = this

    const gui = (debugUI = new dat.GUI({
      name: 'logoSettings',
      width: 300
    }))
    const add = (ui, obj, name, min, max, force = false) =>
      ui.add(obj, name, min, max).onChange(() => this.updateLayout(force))
    const addC = (ui, obj, name, min, max, force = false) =>
      ui.add(obj, name, min, max).onChange(() => this.updateLayoutAndChilds())
    const addL = (ui, obj, name, options) => ui.add(obj, name, options).onChange(() => this.updateLayout(true))
    const addFL = (ui, obj, name, options) => {
      ui.add(obj, name, options).onChange(() => {
        obj.idix = options.indexOf(obj[name])
        this.updateLayout(false)
      })
      obj.idix = options.indexOf(obj[name])
      ui.add(obj, 'idix', 0, options.length - 1).onChange(() => {
        obj[name] = options[~~obj.idix]
        this.updateLayout(false)
      })
    }

    const textFolder = gui.addFolder('TEXTS')
    addC(textFolder, this.templateData.text, 'brandName')
    addC(textFolder, this.templateData.text, 'slogan')

    const fontsFolder = gui.addFolder('FONTS')
    const addFontSettings = partName => {
      const fontFolder = fontsFolder.addFolder(partName)
      const addF = (name, min = 0.5, max = 2.0, def = 1.0) => {
        this.templateData.font[partName][name] = this.templateData.font[partName][name] || def
        add(fontFolder, this.templateData.font[partName], name, min, max)
      }
      addFL(
        fontFolder,
        this.templateData.font[partName],
        'id',
        this.fontResources.mapFonts(font => font.id)
      )
      addF('size')
      addF('lineSpacing')
      addF('letterSpacing')
      addL(fontFolder, this.templateData.font[partName], 'letterSpacingMethod', ['font', 'physical'])
      addF('outline', -0.01, 12.0, 0.0)
    }
    ;['brand1', 'brand2', 'slogan', 'card', 'cardTitle'].forEach(addFontSettings)

    const layoutFolder = gui.addFolder('LAYOUT')

    const addLayout = layoutOption => {
      const results = []
      const variations = layoutOption.prototype.variations
      let partName = layoutOption.name.toLowerCase()
      if (partName.endsWith('layout')) {
        partName = partName.substring(0, partName.length - 6)
      }

      Object.keys(variations).forEach(varKey => {
        if (Object.hasOwnProperty.call(variations, varKey)) {
          try {
            addL(layoutFolder, this.templateData.layout[partName], varKey, Object.keys(variations[varKey]))
            // results.push(this.addLayoutPropDropDown(layoutOption, varKey))
          } catch (exc) {
            console.error('error adding dropdown for ', layoutOption, varKey, exc)
          }
        }
      })
      return results
    }
    ;[DecorationLayout, BrandLayout, SloganLayout, SymbolLayout, CardLayout].forEach(addLayout)
    if (this.templateData.background) {
      const backgroundFolder = gui.addFolder('BACKGROUND')
      const styleParams = DecorationLayout.prototype.variations.style[this.templateData.layout.decoration.style].params
      for (const par in this.templateData.background) {
        if (styleParams && styleParams[par] && styleParams[par].isRange) {
          add(backgroundFolder, this.templateData.background, par, styleParams[par].min, styleParams[par].max, false)
        } else {
          addL(backgroundFolder, this.templateData.background, par)
        }
      }
    }

    const colorFolder = gui.addFolder('COLOR')
    const addColor = n => {
      const ctrl = colorFolder
        .addColor(this.templateData.color.palette, n + '')
        .onChange(() => this.updateLayout(false))
      ctrl.name(n === 1 ? 'forground' : 'color ' + n)
      ctrl.onChange(() => this.updateLayout(true))
    }
    ;[1, 2, 3].forEach(addColor)

    const addColorDrop = name => {
      colorFolder.add(this.templateData.color, name, [0, 1, 2, 3]).onChange(() => this.updateLayout(false))
    }
    ;['brand1', 'brand2', 'slogan', 'symbol', 'decoration'].forEach(addColorDrop)
    const actionsFolder = gui.addFolder('ACTIONS')
    actionsFolder.add(this, 'updateLayoutForce')
    actionsFolder.add(this, 'getSymbolSearchIcons')
    actionsFolder.add(this, 'getInitialSearchIcons')
    actionsFolder.add(this, 'removeDebugUI')
    actionsFolder.add(this, 'animateLogo')
    // actionsFolder.add(this, 'downloadLogoAsZip')
    actionsFolder.add(this, 'createLayout')
    actionsFolder.add(this, 'updatePosition')
    actionsFolder.add(this, 'testCreate')
    actionsFolder.add(this, 'testCreateImage')
    actionsFolder.add(this, 'reassignCardFonts')

    gui.domElement.style.float = 'left'
    gui.domElement.parentElement.style.overflow = 'visible'
    gui.domElement.parentElement.style.zIndex = 10000
    const myInterval = window.setInterval(() => {
      let found = false
      let el = this.element
      while (el.parentElement) {
        if (el === document.body) {
          found = true
          break
        }
        el = el.parentElement
      }
      if (!found) {
        window.clearInterval(myInterval)
        this.removeDebugUI()
      }
    }, 1000)
  }
}

export default LogoInstance
