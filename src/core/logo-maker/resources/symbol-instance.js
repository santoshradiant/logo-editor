import ResourceInstance from './resource-instance'
import FontResources from './font-resources'
import GENERIC_SYMBOLS from './symbol-definitions'
import fetch from '@eig-builder/core-utils/fetch'
import { api } from '@eig-builder/core-utils/helpers/url-helper'
import SvgHelper from '../utils/svg-helper'
import Shape from '../vector-math/shape'
import kebabCase from 'lodash/kebabCase'

// Not round anymore
// {
//   "type": "external",
//   "id": "nounproject.618240",
//   "url": "https://static.thenounproject.com/noun-svg/618240.svg?Expires=1545305314&Signature=EZBfz-Mp7RbOov36RiG8nGodCeaCeOPDeGQayMCzdkQhs7Vn3gCaxhLx1C0pToodxH1P3fqUvoOQP2tzjAa9tnJO4KYNC7-d79gjUkAKdLBKpZdfFDwR3WRmGaAUMIhQSk0lEpQmVzTlBr9iLX4HFtHXFGhXL4fyKZ2yevxdqeA_&Key-Pair-Id=APKAI5ZVHAXN65CHVU2Q"
// }
// averageThickness: 1.8892000000000002
// box: {x: 7.10699987411499, y: 7.10699987411499, width: 85.78599548339844, height: 85.78599548339844}
// fillPercentage: 0.2912651538700647
// maxInnerCircle: 30.083217912982647
// maxOuterCircle: 33.12099032335839
// minInnerCircle: 7.615773105863909
// minOuterCircle: 30
// runCountMax: 44
// runCounts: {1: 17, 2: 13, 3: 11, 4: 11, 5: 1, 6: 2, 8: 2, 11: 1, 14: 4, 15: 2, 27: 4, 13.1: 2, 21.1: 4, 14.1: 4, 8.2: 5, 8.1: 4, …}
// swapMax: 8
// viewBox: {x: 0, y: 0, width: 100, height: 100}

// from: https://www.w3.org/TR/SVG/eltindex.html
const allowedSvgTags = [
  // 'a','animate','animateMotion','animateTransform','audio','canvas',
  // 'desc','discard','foreignObject','iframe',
  // 'metadata','mpath','script','set','stop','text','title','unknown','video',
  'style',
  'circle',
  'clipPath',
  'defs',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'g',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'svg',
  'switch',
  'symbol',
  'textPath',
  'tspan',
  'use',
  'view'
]

const analyzeSize = 64

class SymbolInstance extends ResourceInstance {
  constructor (symbolData) {
    super()

    this.retried = false
    this.resetAnalyzeData()
    if (symbolData) {
      this.initialize(symbolData)
    }
  }

  resetAnalyzeData () {
    this.analyzeData = {
      fillPercentage: 0.0,
      averageThickness: 0.0,
      runCounts: [],
      viewBox: null
    }
  }

  getSymbolOk = () => {
    const ad = this.analyzeData
    if (ad.viewBox && ad.box) {
      if (ad.box.width > ad.viewBox.width * 1.5 || ad.box.height > ad.viewBox.height * 1.5) {
        // TODO: only in develop or on console since these go trough RayGun
        // console.warn(`${this.cacheKey}: too many elements outside viewbox`)
        return false
      }
    }
    const rc = ad.runCounts
    if (rc) {
      // If there are more 1,2 pixel changes than the analyzeSize there is too much detail
      if (~~rc[1] + ~~rc[2] > analyzeSize * 1.5) {
        // TODO: only in develop or on console since these go trough RayGun
        // console.warn(`${this.cacheKey}: too much detail`)
        return false
      }
    }

    if (!isFinite(ad.fillPercentage) || ad.swapMax === 0) {
      // console.log(`${this.cacheKey}: no fill percentage or swapmax`, ad)
      return false
    }

    // CHECK IF COLLORABLE!!!
    return true
  }

  getSymbolIsCircle = () => {
    const ad = this.analyzeData
    return ad.maxOuterCircle - ad.minOuterCircle < analyzeSize / 13
  }

  getSymbolIsO = () => {
    const ad = this.analyzeData
    return (
      ad.maxOuterCircle - ad.minOuterCircle < analyzeSize / 13 &&
      ad.minInnerCircle > analyzeSize / 8 &&
      ad.maxInnerCircle > analyzeSize / 8
    )
  }

  getSymbolIsInverted = () => {
    const ad = this.analyzeData
    const rc = ad.runCounts
    if (rc) {
      if (ad.fillPercentage > 0.7) {
        return true
      }
      // if (ad.fillPercentage > 0.35) {
      //   let lowCount = 0
      //   let highCount = 0
      //   for (let i = 1; i < 8; i++) {
      //     lowCount += ~~rc[i]
      //   }
      //   for (let i = 8; i < analyzeSize; i++) {
      //     highCount += ~~rc[i]
      //   }
      //   if (highCount > lowCount) {
      //     return true
      //   }
      // }
    }
    return false
  }

  getNewUrl = () => {
    return fetch(api(`v1.0/iconlookup/external/${this.symbolData.id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(x => (this.result = x.json()))
  }

  static getCacheKey = symbolData => {
    // Cache symbol for content. icon shapes, but also initials.
    let cacheKey = symbolData.type

    if (symbolData.type === 'initials') {
      cacheKey += `.${symbolData.initials}.${symbolData.fontId}`
    } else {
      cacheKey += '.' + symbolData.id
    }
    return cacheKey
  }

  initialize = symbolData => {
    this.symbolData = symbolData
    this.cacheKey = SymbolInstance.getCacheKey(symbolData)
  }

  calculateThickness = () => {
    const runCounts = this.analyzeData.runCounts
    const runCountMax = this.analyzeData.runCountMax
    let totalValue = 0.0
    let totalWeight = 0.0
    for (const x of Object.keys(runCounts)) {
      const val = runCounts[x]
      if (val > runCountMax * 0.5) {
        totalValue += x * val
        totalWeight += val
      }
    }
    this.analyzeData.averageThickness = totalWeight === 0 ? 0 : totalValue / totalWeight
    return this.analyzeData.averageThickness
  }

  analyze = () => {
    // Make sure box is done
    this.cleanSVG()

    const self = this

    const width = analyzeSize
    const height = analyzeSize

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    context.setTransform(1, 0, 0, 1, 0, 0)

    // context.strokeStyle = 'none'
    // context.fillStyle = '#ffffff' // AMCore.colorToStyle(this.templateData.color.background)
    // context.fillRect(-1, -1, width + 1, height + 1)

    const result = new Promise((resolve, reject) => {
      const callback = (canvas, context) => {
        let filledPixels = 0
        let logoPixels = 0
        let swapMax = 0
        let runMax = 0
        let runCountMax = 0
        const runCounts = {}
        const cx = width / 2
        const cy = height / 2
        let minOuterCircle2 = width * width + height * height
        let maxOuterCircle2 = 0
        let minInnerCircle2 = width * width + height * height
        let maxInnerCircle2 = 0

        const updateEdge = (x, y) => {
          const dx = cx - x
          const dy = cy - y
          const dist2 = dx * dx + dy * dy
          minOuterCircle2 = Math.min(minOuterCircle2, dist2)
          maxOuterCircle2 = Math.max(maxOuterCircle2, dist2)
        }

        const updateInnerEdge = (x, y) => {
          const dx = cx - x
          const dy = cy - y
          const dist2 = dx * dx + dy * dy
          minInnerCircle2 = Math.min(minInnerCircle2, dist2)
          maxInnerCircle2 = Math.max(maxInnerCircle2, dist2)
        }

        let inBlack = 0
        let swapCount = 0
        let start = -1
        let startA = 0
        let end = width

        const startLine = (horizontal, lineNr) => {
          inBlack = 0
          swapCount = 0
          start = -1
          startA = 0
          end = horizontal ? width : height
        }
        const endLine = (horizontal, lineNr) => {
          if (start !== -1) {
            if (horizontal) {
              updateEdge(start, lineNr)
              updateEdge(end, lineNr)
            } else {
              updateEdge(lineNr, start)
              updateEdge(lineNr, end)
            }
            logoPixels += end - start
          }
          swapMax = Math.max(swapMax, swapCount)
        }

        const handlePixel = (horizontal, ofs, centerOfs, lineNr, a, r, g, b) => {
          if (inBlack) {
            if (a < 10 || ofs === width - 1) {
              inBlack += (startA + a) / 510 - 1
              inBlack = Math.round(inBlack * 10.0) / 10.0
              if (!Object.prototype.hasOwnProperty.call(runCounts, inBlack)) {
                runCounts[inBlack] = 1
              } else {
                const x = ++runCounts[inBlack]
                runCountMax = Math.max(runCountMax, x)
              }
              swapCount++
              runMax = Math.max(runMax, inBlack)
              filledPixels += inBlack
              inBlack = 0
            } else {
              end = ofs
              inBlack++
            }
          } else {
            if (a > 10) {
              if (start === -1) {
                start = ofs
              }
              if (end < centerOfs && ofs > centerOfs) {
                if (horizontal) {
                  updateInnerEdge(end, lineNr)
                  updateInnerEdge(ofs, lineNr)
                } else {
                  updateInnerEdge(lineNr, end)
                  updateInnerEdge(lineNr, ofs)
                }
              }

              startA = a
              inBlack++
            }
          }
        }

        const imageData = context.getImageData(0, 0, width, height)
        for (let y = 0; y < height; y++) {
          startLine(true, y)
          for (let x = 0; x < width; x++) {
            const offset = (y * width + x) * 4
            const r = imageData.data[offset]
            const g = imageData.data[offset + 1]
            const b = imageData.data[offset + 2]
            const a = imageData.data[offset + 3]
            handlePixel(true, x, cx, y, a, r, g, b)
          }
          endLine(true, y)
        }

        // for (let x = 0; x < width; x++) {
        //   startLine(false, x)
        //   for (let y = 0; y < height; y++) {
        //     let offset = (y * width + x) * 4
        //     let r = imageData.data[offset]
        //     let g = imageData.data[offset + 1]
        //     let b = imageData.data[offset + 2]
        //     let a = imageData.data[offset + 3]
        //     handlePixel(false, y, cy, x, a, r, g, b)
        //   }
        //   endLine(false, x)
        // }

        self.analyzeData = {
          ...self.analyzeData,
          ...{
            fillPercentage: logoPixels === 0 ? 0 : filledPixels / logoPixels,
            swapMax,
            runCountMax,
            runCounts,
            minOuterCircle: Math.sqrt(minOuterCircle2),
            maxOuterCircle: Math.sqrt(maxOuterCircle2),
            minInnerCircle: Math.sqrt(minInnerCircle2),
            maxInnerCircle: Math.sqrt(maxInnerCircle2)
          }
        }

        self.calculateThickness()
        resolve(self)
      }
      const image = new window.Image()
      image.onload = function () {
        try {
          image.width = width
          image.height = height
          context.drawImage(image, 0, 0, width, height)
        } catch (e) {
          console.error('Error rendering logo: ', e)
          reject(e)
        }
        callback(canvas, context)
      }
      image.onerror = function (e) {
        console.error('Error rendering logo: ', e, self)
        reject(e)
      }

      image.src = 'data:image/svg+xml,' + window.escape(this.innerSvgStr || this.svgStr)
    })

    return result
  }

  addRemoved = s => {
    // this is was used for debug purposes, so i commented it for production
    // if (!this.analyzeData.removedFromDom) {
    //   this.analyzeData.removedFromDom = []
    // }
    // this.analyzeData.removedFromDom.push(s)
  }

  // Returns true if a (nounproject) url has expired.
  hasAssetExpired = url => {
    let p = typeof url === 'string' ? url.indexOf('xpires=') : -1
    if (p > 0) {
      p += 7
      const expiration = parseInt(url.substr(p, url.indexOf('&', p)))
      if (expiration > 1e6) {
        if (new Date().getTime() / 1000 >= expiration) {
          // console.log(`Expired: ${new Date(expiration).toLocaleString()} : ${url}`)
          return true
        }
      }
    }
    return false
  }

  expandBox = b => {
    const m = Math.min(b.width, b.height) / 64
    b.x -= m
    b.y -= m
    b.width += m * 2
    b.height += m * 2
    return b
  }

  unboxBox = b => ({
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height
  })

  boxToStr = b => `${b.x.toFixed(4)} ${b.y.toFixed(4)} ${b.width.toFixed(4)} ${b.height.toFixed(4)}`

  getBox = () => {
    this.cleanSVG()
    return this.analyzeData.box
  }

  cleanSVG = () => {
    if (this.analyzeData.box) {
      return
    }

    if (!this.svgStr) {
      return
    }

    let styleTag
    const newStyleSheets = {}
    let styleIX = 0
    const shape = (this.shape = new Shape())
    const scanDom = (rootSVG, el) => {
      const nodeName = el.nodeName.toLowerCase()
      // console.log('!!AK: scan ', el)
      if (!allowedSvgTags.some(x => x.toLowerCase() === nodeName)) {
        this.addRemoved(el.nodeName)
        el.remove()
        return
      }

      if (nodeName === 'style') {
        if (!styleTag) {
          styleTag = el
        } else {
          // TODO: only in develop or on console since these go trough RayGun
          // console.warn('Double style tag removed!')
          this.addRemoved(el.nodeName)
          el.remove()
        }
      }

      if (el.getTotalLength) {
        const style = window.getComputedStyle(el)

        const filteredStyle = {}
        for (let ix = 0; ix < style.length; ix++) {
          const key = style.item(ix)
          const value = style.getPropertyValue(key)
          if (value !== '') {
            if (key.startsWith('fill') || key.startsWith('stroke')) {
              if (value === 'none' || (key !== 'fill' && key !== 'stroke')) {
                filteredStyle[key] = value
              }
            }
          }
        }
        const key = JSON.stringify(filteredStyle)
        if (!Object.hasOwnProperty.call(newStyleSheets, key)) {
          newStyleSheets[key] = {
            id: ++styleIX,
            elements: [],
            styleObj: filteredStyle
          }
        }
        const rec = newStyleSheets[key]
        rec.elements.push(el)

        const rules = [
          'fillRule',
          'fill',
          'stroke',
          'strokeWidth',
          'strokeLinecap',
          'strokeLinejoin',
          'strokeMiterlimit',
          'strokeDasharray'
        ]
        // Since fill rules fall out sometimes because they get specified in style or in the main svg etc. we copy them to the attribute
        rules.forEach(rule => {
          if (style[rule] && style[rule] !== '') {
            // console.log('Element style: ', style.fillRule, el)
            SvgHelper.setAttributeValues(el, { [kebabCase(rule)]: style[rule] })
          }
        })
      }

      for (let i = 0; i < el.attributes.length; i++) {
        const name = el.attributes[i].nodeName
        const nsix = name.indexOf(':')
        if (nsix !== -1) {
          if (!name.startsWith('xlink:') && !name.startsWith('xmlns:xlink')) {
            this.addRemoved(el.attributes[name])
            el.removeAttribute(name)
            console.info('external namespace attribute removed from symbol')
          }
        }
        if (name.startsWith('on') && name.length > 4) {
          this.addRemoved(el.attributes[name])
          el.removeAttribute(name)
          console.info('ON attribute removed from symbol')
        }
        if (name === 'display') {
          if (el.attributes[i].nodeValue === 'none') {
            this.addRemoved(el.nodeName)
            el.remove()
            console.info('hidden geometry removed from symbol')
            break
          }
        }
        // if (name === 'class') {
        //   if (el.attributes[i].nodeValue === 'none') {
        //     this.addRemoved(el.nodeName)
        //     el.remove()
        //     break
        //   }
        // }
      }
      if (el.attributes.style) {
        // console.log('Style attribute removed', el)
        this.addRemoved(el.attributes.style.value)
        el.removeAttribute('style')
      }

      // Recurse through a copy (because they might get deleted)
      const children = [...el.children]
      for (const el2 of children) {
        scanDom(rootSVG, el2)
      }
    }

    // Helper svgPoint so we don't have to create one for every point
    let svgPoint
    const scanGeo = (viewBox, rootSVG, el) => {
      // This is for detecting shapes outside the SVG viewbox
      let box
      if (viewBox && el.getBBox) {
        // let box = el.getBBox() // this one doesn't use transforms
        try {
          box = SvgHelper.transformedBoundingBox(rootSVG, el)
        } catch (exc) {
          // Since firefox returns namespace errors for non visible svg objects
          // we just ignore them and go on
          box = undefined
          // console.log(el, el.innerHTML, exc)
        }

        // console.log('!!AK: box ', box)

        if (box) {
          const m = SvgHelper.getTransformMatrix(rootSVG, el)
          const pointConverter = pt => {
            svgPoint.x = pt.x
            svgPoint.y = pt.y
            return svgPoint.matrixTransform(m)
          }
          // box {x: 36.29558563232422, y: 43.41688537597656, width: 11.01224136352539, height: 2.849700927734375}
          // viewBox {x: 5.521900177001953, y: 31.36079978942871, width: 88.79010009765625, height: 37.03020095825195}
          // if ((viewBox.x > (box.x + box.width)) || ((viewBox.x + viewBox.width) < box.x) ||
          //   (viewBox.y > (box.y + box.height)) || ((viewBox.y + viewBox.height) < box.y)) {
          if (
            box.x + box.width < 0 || // box.right is smaller than viewBox.left
            box.y + box.height < 0 || // box.bottom is smaller than viewBox.top
            0 + viewBox.width < box.x || // viewBox.right is smaller than box.left
            0 + viewBox.height < box.y
          ) {
            // viewBox.bottom is smaller than box.top
            this.addRemoved(el.nodeName)
            // debugger
            // TODO: only in develop or on console since these go trough RayGun
            // console.warn('geometry outside viewbox removed from symbol', box, viewBox)
            el.remove()
            return
          } else {
            if (el.attributes.d && el.attributes.d.value && el.attributes.d.value.length) {
              try {
                shape.addPath(el.attributes.d.value, pointConverter)
              } catch (ex) {
                console.error(ex)
              }
            } else if (el.points && el.points.length) {
              try {
                const points = []
                for (const pt of el.points) {
                  points.push(pt.matrixTransform(m))
                }
                shape.addPoints(points)
              } catch (ex) {
                console.error(ex)
              }
            } else if (el.nodeName === 'circle') {
              const points = []
              const cx = el.cx.baseVal.value
              const cy = el.cy.baseVal.value
              const r = el.r.baseVal.value
              for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 6) {
                points.push(pointConverter({ x: cx + Math.sin(angle) * r, y: cy + Math.cos(angle) * r }))
              }
              shape.addPoints(points)
            } else {
              if (el.getTotalLength) {
                const points = []
                let len = 0
                try {
                  len = el?.getTotalLength?.()
                } catch (error) {
                  len = 0
                }
                for (let x = 0; x < len; x += Math.max(2.0, len / 1000)) {
                  points.push(pointConverter(el.getPointAtLength(x)))
                }
                shape.addPoints(points)
                // TODO: only in develop or on console since these go trough RayGun
                // console.warn('Unhandled geometric: ', el)
              }
            }
          }
        }
      }

      // Recurse through a copy (because they might get deleted)
      const children = [...el.children]
      for (const el2 of children) {
        scanGeo(viewBox, rootSVG, el2)
      }
    }

    const doDomScan = () => {
      let div, frame
      try {
        frame = document.createElement('iframe')
        frame.setAttribute('sandbox', 'allow-same-origin')
        frame.style.opacity = 0
        frame.style.position = 'fixed'
        frame.style.top = 0
        frame.style.left = 0

        div = document.createElement('div')
        div.innerHTML = this.svgStr
        div.style.opacity = 0.0001
        div.style.position = 'fixed'
        div.style.top = 0
        div.style.left = 0

        const rootSVG = div.firstElementChild

        document.body.appendChild(frame)
        frame.contentWindow.document.body.appendChild(div)
        // document.body.appendChild(div)
        if (!rootSVG.attributes.xmlns) {
          rootSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        }
        SvgHelper.setAttributeValues(rootSVG, { 'xmlns:xlink': 'http://www.w3.org/1999/xlink' })

        scanDom(rootSVG, rootSVG)

        // console.log('new Styles: ', newStyleSheets, styleTag)
        if (styleTag) {
          let newCSSText = ''
          const newCSSUnique = Date.now().toString(36)
          for (const key of Object.keys(newStyleSheets)) {
            const styleInfo = newStyleSheets[key]
            const newClassName = 'st_' + newCSSUnique + '_' + styleInfo.id
            let newCSSRuleStr = '.' + newClassName + ' {\n'
            for (const propName of Object.keys(styleInfo.styleObj)) {
              newCSSRuleStr += '  ' + propName + ': ' + styleInfo.styleObj[propName] + ';\n'
            }
            newCSSText += newCSSRuleStr + '\n}\n'

            for (const el of styleInfo.elements) {
              // Doesn't work on svg elements, classList is something else there, great work standard developers :(
              // el.className = newClassName
              while (el.classList.length > 0) {
                el.classList.remove(el.classList.item(0))
              }
              el.classList.add(newClassName)
            }
          }
          styleTag.innerHTML = newCSSText
        }

        this.innerSvgStr = div.innerHTML
      } finally {
        div.remove()
        frame.remove()
      }
    }

    const doGeoScan = () => {
      let div
      try {
        div = document.createElement('div')
        div.innerHTML = this.innerSvgStr
        div.style.opacity = 0.0001
        div.style.position = 'fixed'
        div.style.top = 0
        div.style.left = 0

        const rootSVG = div.firstElementChild

        document.body.appendChild(div)
        let viewBox

        if (!rootSVG.attributes.width) {
          rootSVG.setAttribute('width', 100)
          rootSVG.setAttribute('height', 100)
        }

        if (rootSVG.attributes.viewBox) {
          viewBox = this.analyzeData.viewBox = this.unboxBox(rootSVG.viewBox.baseVal)
          // rootSVG.removeAttribute('viewBox')
          rootSVG.setAttribute('width', this.analyzeData.viewBox.width)
          rootSVG.setAttribute('height', this.analyzeData.viewBox.height)
        }

        // Fix for small svg's otherwize they are positioned in the bottom of the div
        rootSVG.style.verticalAlign = 'top'

        svgPoint = rootSVG.createSVGPoint()
        scanGeo(viewBox, rootSVG, rootSVG)

        this.analyzeData.box = this.unboxBox(this.expandBox(rootSVG.getBBox()))

        // Always overrule default viewBox for analyze
        SvgHelper.setAttributeValues(rootSVG, {
          viewBox: this.boxToStr(this.analyzeData.box)
        })

        this.innerSvgStr = div.innerHTML
      } finally {
        div.remove()
      }
    }

    try {
      doDomScan()
    } catch (ex) {
      console.error('Error scanning the DOM for SVG symbol', ex)
    }

    try {
      doGeoScan()
    } catch (ex) {
      console.error('Error scanning the geometry for SVG symbol', ex)
    }

    if (this.shape.hasData()) {
      if (!this.shape.checkReasonable()) {
        console.error('Points overflow in shape, fallback to box!')
        this.shape = new Shape()
        this.shape.addShapeFromBox(this.analyzeData.box)
      }
      this.shape.updateMargins(4)
      // this.innerSvgStr = this.shape.toSVGStr()
    }
    // Store the result of the analyze in the sybolData so it get's saved
    const stored = {}
    stored[this.cacheKey] = this.innerSvgStr
    this.symbolData.stored = stored
  }

  handleFinished = error => {
    // console.log(this, super.handleLoadFinished)
    // super.handleLoadFinished()
    // console.log(this, s, super.handleLoadFinished)
    if (error) {
      this.handleLoadFinished(error)
    } else {
      this.analyze().then(() => {
        this.handleLoadFinished()
      })
    }
  }

  load = loadFinished => {
    if (!this.isLoaded) {
      if (loadFinished) {
        this.pushLoadFinished(loadFinished)
      }
    }

    if (this.symbolData.type === 'generic') {
      for (const symbol of GENERIC_SYMBOLS) {
        if (symbol.id === this.symbolData.id) {
          if (symbol.url) {
            fetch(symbol.url, {
              method: 'GET',
              skipCredentials: true
            })
              .then(response => {
                if (!response.ok) {
                  throw response
                }
                return response.text()
              })
              .then(data => {
                this.svgStr = data
                this.state = 'loaded'
                this.isLoaded = true
                this.analyze().then(() => {
                  this.svgStr = this.innerSvgStr
                  this.resetAnalyzeData()
                  this.handleFinished()
                })
              })
              .catch(error => {
                this.handleFinished('Error downloading symbol ' + error)
              })
          } else {
            if (!this.isLoaded) {
              this.svgStr = symbol.icon
              this.state = 'loaded'
              this.isLoaded = true
              this.handleFinished()
            }
          }
          return
        }
      }
      this.handleFinished('The generic symbol is missing, ' + this.symbolData)
    }

    if (this.state === 'none') {
      if (this.symbolData.type === 'initials') {
        // Symbol is an initials-based shape
        const fontFinished = font => {
          if (font.isLoaded) {
            const pathInfo = font.getPathInfo()
            let svgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">'
            pathInfo.forEach(p => {
              svgStr += `<path d="${p.path.toPathData()}" transform="translate(${p.x},100)" ></path>`
            })
            this.svgStr = svgStr + '</svg>'
            // this.analyze().then(this.handleFinished())
            this.handleFinished()
          } else {
            this.handleFinished('Error downloading font for symbol')
          }
        }

        const font = FontResources.getInstance().getFontInstance(
          { id: this.symbolData.fontId || 'primal' },
          this.symbolData.initials,
          fontFinished
        )
        if (font.isLoaded) {
          fontFinished(font)
        }
      } else {
        this.state = 'loading'
        if (this.symbolData.stored && this.symbolData.stored[this.cacheKey]) {
          this.svgStr = this.symbolData.stored[this.cacheKey]
          this.handleFinished()
          // console.log('Symbol loaded from JSON')
        } else {
          // Symbol is pure icon(image)
          if (!this.symbolData.url || this.hasAssetExpired(this.symbolData.url)) {
            this.getNewUrl()
              .then(x => {
                this.symbolData.url = x.svg_url
                this.state = 'none'
                this.load()
              })
              .catch(error => {
                this.handleFinished('Error getting symbol url ' + error)
              })
          } else {
            fetch(this.symbolData.url, {
              method: 'GET',
              skipCredentials: true
            })
              .then(response => {
                if (!response.ok) {
                  throw response
                }
                return response.text()
              })
              .then(data => {
                this.svgStr = data
                this.analyze().then(() => {
                  this.svgStr = this.innerSvgStr
                  this.resetAnalyzeData()
                  this.handleFinished()
                })
              })
              .catch(error => {
                if (!this.retried) {
                  this.retried = true
                  this.getNewUrl().then(x => {
                    this.symbolData.url = x.svg_url
                    this.state = 'none'
                    this.load()
                  })
                } else {
                  this.handleFinished('Error downloading symbol ' + error)
                }
              })
          }
        }
      }
    }
  }
}

export default SymbolInstance
