import AMCore from './amcore'
import FontResources from './resources/font-resources'
import LogoInstance from './logo-instance'
import SloganLayout from './layouts/slogan-layout'
import BrandLayout from './layouts/brand-layout'
import SymbolLayout from './layouts/symbol-layout'
import DecorationLayout from './layouts/decoration-layout'
// import CardLayout from './layouts/card-layout'
import random from './utils/weighted-random'
import { rgbToHex } from 'logomaker/helpers/color-helper'

import set from 'lodash/set'
// import waterMarkUrl from '../../core/images/blueback.jpg'
import './style/logo-maker.scss'
import SymbolResources from './resources/symbol-resources'
import { omit, map, isArray } from 'lodash'
import { getPaletteConfig } from './utils/logo-generation'

class LogoMaker {
  constructor (options) {
    this.fontResources = FontResources.getInstance()
    this.symbolResources = SymbolResources.getInstance()

    this.currentTemplate = 0
    this.templateData = {}
    this.allLogos = []
    this.options = options || {}
    this.textTemplates = []
    this.doNotVariate = []
  }

  destroy () {}

  // This is used from the sliders
  updateTemplateData = templateData => {
    this.templateData = AMCore.clone(templateData)
    delete this.templateData.logoVersion
    for (const toDelete of this.doNotVariate) {
      let field = this.templateData
      const pathArr = toDelete.split('.')
      for (let ix = 0; ix < pathArr.length - 1; ix++) {
        const key = pathArr[ix]
        if (Object.prototype.hasOwnProperty.call(field, key)) {
          field = field[key]
        } else {
          field = undefined
          break
        }
      }
      if (field) {
        delete field[pathArr[pathArr.length - 1]]
      }
    }
    // this.doNotVariate
    for (let i = 0; i < this.allLogos.length; i++) {
      const logo = this.allLogos[i]
      logo.update(this.templateData)
    }
  }

  updateLogoTemplate = (variation, templateData) => {
    const newTemplateData = AMCore.clone(templateData)
    delete newTemplateData.logoVersion
    for (const toDelete of this.doNotVariate) {
      let field = newTemplateData
      const pathArr = toDelete.split('.')
      for (let ix = 0; ix < pathArr.length - 1; ix++) {
        const key = pathArr[ix]
        if (Object.prototype.hasOwnProperty.call(field, key)) {
          field = field[key]
        } else {
          field = undefined
          break
        }
      }
      if (field) {
        delete field[pathArr[pathArr.length - 1]]
      }
    }

    // We need to clone it here or else react won't trigger sigh
    const result = { ...AMCore.extendRecursive(variation, newTemplateData) }
    if (variation._zoomTo !== undefined) {
      Object.defineProperty(result, '_zoomTo', {
        value: variation._zoomTo,
        enumerable: false
      })
    }
    return result
  }

  generatePreview (target, templateData) {
    this.generate([target], templateData)
  }

  handleShowHideSymbol (targets, show) {
    const symbolPositions = AMCore.clone(SymbolLayout.prototype.variations.position)

    isArray(targets) &&
      targets
        .filter(x => x.current !== null)
        .map(async x => {
          x.current.dataLogoInstance.templateData.layout.symbol.position = show
            ? random(omit(symbolPositions, 'none'))
            : 'none'
          x.current.dataLogoInstance.updateLayout(true)
          return x
        })
  }

  handleRegenerateSymbol (targets) {
    const symbolPositions = AMCore.clone(SymbolLayout.prototype.variations.position)

    isArray(targets) &&
      targets.map(async x => {
        const PromisesResult = await Promise.all(
          map(x.current.dataLogoInstance.symbolResources.searchCache, value => value.result)
        )
        const icons = PromisesResult.filter(x => isArray(x.result))
          .map(x => x.result)
          .flat()
        if (!icons.length) {
          return
        }
        const icon = random(icons)
        let newIcon = {}
        if (icon) {
          if (icon?.preview_url) {
            newIcon = {
              id: icon.id,
              type: 'external',
              url: icon.svg_url,
              previewUrl: icon.preview_url
            }
          }
        }
        x.current.dataLogoInstance.templateData.layout.symbol.position = random(omit(symbolPositions, 'none'))
        x.current.dataLogoInstance.templateData.layout.symbol.icon = 'random'
        x.current.dataLogoInstance.templateData.symbol.icon = newIcon
        x.current.dataLogoInstance.updateLayout(true)
        return x
      })
  }

  handleColorPalette (targets, palette) {
    isArray(palette) &&
      targets.map(x => {
        x.current.dataLogoInstance.templateData.color.palette = palette
        x.current.dataLogoInstance.updateLayout(true)
        return x
      })
  }

  getRandomFontFamily = () => {
    const fl = this.fontResources.getFontsById()
    const r = Math.floor(Math.random() * fl.length)
    return fl[r]
  }

  generatePlain = (targets, templateData, regenerateAll) => {
    // console.log('!!AK generatePlain: ', targets, templateData)
    this.templateData = AMCore.clone(templateData)
    delete this.templateData.logoVersion

    if (regenerateAll) {
      this.allLogos = []
    }

    for (let i = 0; i < targets.length; i++) {
      if (regenerateAll) {
        targets[i].dataLogoInstance = undefined
        for (let j = targets[i].children.length - 1; j >= 0; j--) {
          const child = targets[i].children[j]
          if (child.classList.contains('amreset')) {
            child.remove()
          }
        }
      }
      let logo = targets[i].dataLogoInstance
      if (!logo) {
        targets[i].dataLogoInstance = logo = new LogoInstance(this.templateData, targets[i], this.options)
        // targets[i].style.backgroundColor = logo.templateData.color.background
        // targets[i].style.backgroundImage = 'url(' + waterMarkUrl + ')'
        // targets[i].style.backgroundSize = 'cover'
        targets[i].style.overflow = 'hidden'
      }
      logo.update()
    }
    this.allLogos = targets.map(x => x.dataLogoInstance)
  }

  generate = (
    targets,
    templateData,
    fullUpdate = false,
    logoNames = null,
    logoStyle = 'random',
    firstTemplate = null
  ) => {
    // console.log('!!AK generate: ', targets, templateData)
    this.templateData = AMCore.clone(templateData)
    delete this.templateData.logoVersion

    this.doNotVariate = []

    if (logoStyle === 'initials') {
      const symbolPositions = AMCore.clone(SymbolLayout.prototype.variations.position)
      delete symbolPositions.none

      this.templateData.layout = this.templateData.layout || {}
      AMCore.extendRecursive(
        this.templateData,
        {
          layout: {
            symbol: {
              position: random(symbolPositions)
            },
            decoration: {
              style: 'none'
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
    } else if (logoStyle === 'name') {
      this.templateData.layout = this.templateData.layout || {}
      AMCore.extendRecursive(
        this.templateData,
        {
          layout: {
            symbol: {
              position: 'none'
            },
            decoration: {
              style: 'none'
            }
          }
        },
        true,
        false
      )
    } else if (logoStyle === 'no-logo') {
      this.templateData.layout = this.templateData.layout || {}
      AMCore.extendRecursive(
        this.templateData,
        {
          layout: {
            symbol: {
              position: 'none'
            }
          }
        },
        true,
        false
      )
    }
    this.options.otherLogoHashes = {}
    // const searchWord = templateData.text.brandName
    const useLogoNames = Array.isArray(logoNames)
    for (let i = 0; i < targets.length; i++) {
      if (!targets[i]) {
        continue
      }

      let logo = targets[i].dataLogoInstance
      const generated = AMCore.clone(firstTemplate && i === 0 ? firstTemplate : this.templateData)

      if (logoNames) {
        const domainSuggestion = logoNames[i]
        let logoName = (useLogoNames && domainSuggestion && domainSuggestion.domain) || ''
        let domain
        const tld = domainSuggestion.tld
        if (useLogoNames && logoNames[i] && logoNames[i].metadata && logoNames[i].metadata.segments) {
          domain = logoName
          logoName = logoNames[i].metadata.segments.join(' ')
        } else if (useLogoNames) {
          domain = logoName
          logoName = logoName.replace(tld, '')
        }
        if (useLogoNames) {
          generated.text.brandName = logoName
          generated.text.slogan = domain
        }
      }

      if (!logo) {
        const myLogoSettings = AMCore.clone(generated)
        if (i === 0) {
          // myLogoSettings = AMCore.extendRecursive(myLogoSettings, { layout: { symbol: { position: 'none' } } })
        }

        const dotPos = myLogoSettings.text.brandName.indexOf('.')
        if (dotPos > 0 && Math.random() < 0.3 && myLogoSettings.text.brandName.indexOf(' ') === -1) {
          myLogoSettings.layout = myLogoSettings.layout || {}
          myLogoSettings.layout.decoration = myLogoSettings.layout.decoration || {}
          myLogoSettings.layout.decoration.style = 'none'
          myLogoSettings.layout.brand = myLogoSettings.layout.brand || {}
          myLogoSettings.layout.brand.alignment = 'horizontal'
          myLogoSettings.layout.symbol = myLogoSettings.layout.symbol || {}
          myLogoSettings.layout.symbol.position = 'none'
          myLogoSettings.font = myLogoSettings.font || {}
          myLogoSettings.font.brand1 = {
            id: random(this.fontResources.getFontsByCategory('modern')).id,
            category: 'modern',
            letterSpacing: 0.85,
            letterSpacingMethod: 'physical',
            duoColorPosition: dotPos / myLogoSettings.text.brandName.length
          }
          myLogoSettings.color = myLogoSettings.color || {}
          myLogoSettings.color.palette = [
            [255, 255, 255],
            [0, 0, 0],
            random([
              [255, 0, 0],
              [0, 0, 255],
              [0, 128, 0]
            ]),
            [96, 96, 96]
          ]
          myLogoSettings.color.brand1 = 1
          myLogoSettings.color.brand2 = 2
          myLogoSettings.color.decoration = 2
          myLogoSettings.color.slogan = 3
          myLogoSettings.color.symbol = 3
        }

        targets[i].dataLogoInstance = logo = new LogoInstance(myLogoSettings, targets[i], this.options)
        // targets[i].style.backgroundColor = logo.templateData.color.background
        // targets[i].style.backgroundImage = 'url(' + waterMarkUrl + ')'
        // targets[i].style.backgroundSize = 'cover'
        targets[i].style.overflow = 'hidden'
        const tempData = AMCore.clone(logo.templateData)
        tempData.color = { ...tempData, ...getPaletteConfig(tempData) }
        logo.update(tempData)
      }
      this.options.otherLogoHashes[logo.getMD5()] = true
    }
    this.allLogos = targets.filter(x => x !== null).map(x => x.dataLogoInstance)
  }

  checkOutOfVariations = () => {
    const hashes = Object.keys(this.options.otherLogoHashes)
    return hashes.length > 0 && hashes.length + 8 < this.allLogos.length
  }

  setZoomTo (variations, value) {
    if (value.startsWith('brand')) {
      value = 'brand'
    }
    for (const v of variations) {
      if (v._zoomTo === undefined) {
        Object.defineProperty(v, '_zoomTo', {
          value: value,
          enumerable: false
        })
      }
    }
  }

  generateVariations = (templateData, variationTarget) => {
    const self = this
    // console.log('!!AK GenerateVariations: ', templateData, variationTarget)
    this.options.otherLogoHashes = {}

    templateData = AMCore.clone(templateData)
    delete templateData.logoVersion

    const variations = []

    // Current one always first
    // const element = document.createElement('div')
    // element.classList.add('logo-preview')
    // element.style.backgroundColor = templateData.color.background
    // element.style.backgroundImage = 'url(' + waterMarkUrl + ')'
    // element.style.backgroundSize = 'cover'
    // element.style.overflow = 'hidden'

    // const instance = new LogoInstance(templateData, null, this.options)
    // element.appendChild(instance.getPreviewElement())
    // instance.updateLayout()
    // setTimeout(() => instance.updateLayout(), 0)

    this.allLogos = []

    const skipVariations = []
    const internalGenerate = function (templateData, variationKey, variationValues) {
      let styles = variationValues
      if (!Array.isArray(variationValues)) {
        styles = Object.keys(variationValues)
      }
      if (typeof variationValues === 'function') {
        styles = variationValues(templateData)
      }

      for (let i = 0; i < styles.length; i++) {
        const variation = styles[i]
        if (
          skipVariations.indexOf(variation) !== -1 ||
          (variationValues[variation] && variationValues[variation].weight === 0)
        ) {
          continue
        }

        const clonedTemplateData = AMCore.clone(templateData)

        set(clonedTemplateData, variationKey, variation)

        // const element = document.createElement('div')
        // element.classList.add('logo-preview')
        // // element.style.backgroundColor = clonedTemplateData.color.background
        // // element.style.backgroundImage = 'url(' + waterMarkUrl + ')'
        // // element.style.backgroundSize = 'cover'
        // element.style.overflow = 'hidden'

        if (arguments.length > 3) {
          internalGenerate.apply(self, [clonedTemplateData, ...Array.prototype.slice.call(arguments, 3)])
        } else {
          self.options.otherLogoHashes = {}
          // const instance = new LogoInstance(clonedTemplateData, undefined, self.options)
          // element.appendChild(instance.getPreviewElement())
          // instance.updateLayout()
          // self.allLogos.push(instance)
          // setTimeout(() => instance.updateLayout(), 0)
          variations.push(clonedTemplateData)
          // variations.push({
          //   instance: instance,
          //   element: element
          // })
          // self.options.otherLogoHashes[instance.getMD5()] = true
        }
      }
    }
    const symbolPositions = AMCore.clone(SymbolLayout.prototype.variations.position)

    if (variationTarget === 'slogan') {
      this.doNotVariate = ['layout.slogan']
      // this.doNotVariate = 'layout.slogan.style'
      if (templateData.text.slogan) {
        // we might wanna change the layout
        if (templateData.text.slogan && templateData.text.slogan !== '') {
          internalGenerate(templateData, 'layout.slogan.style', SloganLayout.prototype.variations.style)
        }
      }
      this.setZoomTo(variations, 'slogan')
    } else if (variationTarget.startsWith('card')) {
      this.doNotVariate = ['layout.card']
      // internalGenerate(templateData, 'layout.card.style', CardLayout.prototype.variations.style)
      for (let i = 0; i < 20; i++) {
        const clonedTemplateData = AMCore.clone(templateData)
        delete clonedTemplateData.layout.card
        const logo = new LogoInstance(clonedTemplateData, null, this.options)
        variations.push(logo.templateData)
      }
    } else if (['brandname', 'name'].indexOf(variationTarget) !== -1) {
      this.doNotVariate = ['layout.brand']
      if (templateData.text.brandName.indexOf(' ') !== -1) {
        internalGenerate(
          templateData,
          'layout.brand.alignment',
          BrandLayout.prototype.variations.alignment
          // 'layout.brand.fontStyle',
          // BrandLayout.prototype.variations.fontStyle
        )
      }
    } else if (variationTarget === 'symbolLayout') {
      this.doNotVariate = ['layout.symbol.position']

      internalGenerate(templateData, 'layout.symbol.position', symbolPositions)
    } else if (variationTarget === 'symbol') {
      // this.doNotVariate = ['layout.symbol.decoration', 'symbol.icon']
      this.doNotVariate = ['layout.symbol.decoration', 'layout.symbol.position']

      if (templateData.layout.symbol.position !== 'none') {
        // let isInitials = get(templateData, 'symbol.icon.type') === 'initials'
        // TODO BART: templateData.symbol.icon = 'random'
        // let hasIcon = get(templateData, 'symbol.icon.type') === 'external'
        // if (!hasIcon) {
        //   templateData.symbol.icon = 'random' // <-- set to string and below use as object?
        // }
        // if (isInitials) {
        // skipVariations.push('none')
        // }

        internalGenerate(templateData, 'layout.symbol.decoration', SymbolLayout.prototype.variations.decoration)
        templateData.symbol.icon = 'random' // <-- set to string and below use as object?
        internalGenerate(templateData, 'layout.symbol.decoration', SymbolLayout.prototype.variations.decoration)
        this.setZoomTo(variations, variationTarget)

        // internalGenerate(templateData, 'layout.symbol.icon', SymbolLayout.prototype.variations.decoration)
        // if (isInitials) {
        // let initials = this.symbolResources.getDefaultInitials(templateData.text)
        // const fontResources = FontResources.getInstance()
        // templateData.symbol.icon = {
        //   type: 'initials',
        //   id: initials,
        //   initials
        // }
        // internalGenerate(templateData, 'symbol.icon.fontId', fontResources.getSymbolFonts().map(x => x.id))
        // }
      }

      internalGenerate(templateData, 'layout.symbol.position', symbolPositions)
      // this.setZoomTo(variations, 'symbol-root')
    } else if (variationTarget === 'color') {
      this.doNotVariate = ['color.brand1', 'color.brand2', 'color.slogan', 'color.decoration', 'color.symbol']
      const clonedTemplateData = AMCore.clone(templateData)

      // map to filter double palette colors
      const paletteRemap = [0, 1, 2, 3]
      const colors = []
      for (let ix = 0; ix < templateData.color.palette.length; ix++) {
        let color = templateData.color.palette[ix]
        if (Array.isArray(color)) {
          color = rgbToHex(color[0], color[1], color[2])
        }
        let colorIx = colors.indexOf(color)
        if (colorIx === -1) {
          colorIx = colors.push(color) - 1
        }
        paletteRemap[ix] = colorIx
      }

      delete clonedTemplateData.logoVersion
      ;['brand1', 'brand2', 'slogan', 'decoration', 'symbol'].forEach(x => {
        delete clonedTemplateData.color[x]
      })
      const relevantColors = ['brand1']
      if (templateData.text.brandName.indexOf(' ') !== -1) {
        relevantColors.push('brand2')
      }
      if (templateData.text.slogan) {
        relevantColors.push('slogan')
      }
      if (templateData.layout.decoration.style !== 'none') {
        relevantColors.push('decoration')
      }
      if (templateData.layout.symbol.position !== 'none') {
        relevantColors.push('symbol')
      }
      const logoColorHashes = []
      for (let i = 0; i < 20; i++) {
        const getColorHash = template => {
          let multiplier = 1
          let colorHash = 0
          relevantColors.forEach(x => {
            multiplier *= 10
            colorHash += paletteRemap[template.color[x]] * multiplier
          })
          return colorHash
        }
        const logo = new LogoInstance(clonedTemplateData, null, this.options)
        const logoColorHash = getColorHash(logo.templateData)

        if (!logoColorHashes[logoColorHash]) {
          logoColorHashes[logoColorHash] = true
          variations.push(logo.templateData)
        }
      }
      // ;['brand1', 'brand2', 'slogan', 'decoration', 'symbol'].forEach(x => {
      //   const clonedTemplateData = AMCore.clone(templateData)
      //   // delete clonedTemplateData.color[x])
      //   set(clonedTemplateData, 'color.' + x, Math.floor(Math.random() * 4))
      //   variations.push(clonedTemplateData)
      // })
      // }
    } else {
      // if (variationTarget === 'layout') {

      delete templateData.layout.decoration.params
      this.doNotVariate = [
        'layout.decoration.style',
        'background.borderStyle',
        'background.borderRadius',
        'background.strokeDistance',
        'background.strokeWidth'
      ]
      templateData.background.borderStyle = 'none'
      templateData.background.borderRadius = 0.0
      templateData.background.strokeDistance = 0.75
      templateData.background.strokeWidth = 3.0

      internalGenerate(
        templateData,
        'layout.decoration.style',
        DecorationLayout.prototype.variations.style
        // 'background.borderStyle',
        // templateData => {
        //   const vars = DecorationLayout.prototype.variations.style[templateData.layout.decoration.style]
        //   if (vars && vars.params) {
        //     return Object.keys(vars.params.borderStyle)
        //   } else {
        //     return []
        //   }
        // }
      )
      skipVariations.push('none')
      skipVariations.push('single')
      internalGenerate(templateData, 'background.borderStyle', templateData => {
        const vars = DecorationLayout.prototype.variations.style[templateData.layout.decoration.style]
        if (vars && vars.params) {
          return Object.keys(vars.params.borderStyle)
        } else {
          return []
        }
      })
    }
    this.setZoomTo(variations, '')
    for (const v of variations) {
      LogoInstance.updateMD5(v)
    }
    return variations
  }

  generateFontPreviewStyles (templateData, category, variationTarget) {
    const fontResources = FontResources.getInstance()
    // console.log('!!AK generateFontPreviewStyles: ', templateData, category, variationTarget)

    let fonts = null
    if (variationTarget === 'slogan') {
      fonts = fontResources.getSloganFontsByCategory(category)
    } else if (variationTarget === 'symbol') {
      fonts = fontResources.getSymbolFontsByCategory(category)
    } else if (variationTarget.startsWith('card')) {
      fonts = fontResources.getSloganFontsByCategory(category)
    } else {
      fonts = fontResources.getFontsByCategory(category)
    }

    window.fontResources = fontResources
    // console.log('!!AK font variations: ', category, fonts)

    if (!fonts) {
      return
    }

    this.allLogos = []
    // const variations = []
    // const maxVariations = Math.min(fonts.length, 8)
    const maxVariations = fonts.length
    const initials = this.symbolResources.getDefaultInitials(templateData.text)
    // const fontResources = FontResources.getInstance()
    // templateData.symbol.icon = {
    //   type: 'initials',
    //   id: initials,
    //   initials

    const vars = []
    for (let i = 0; i < maxVariations; i++) {
      const clonedTemplateData = AMCore.clone(templateData)
      delete clonedTemplateData.logoVersion

      if (variationTarget === 'slogan') {
        this.doNotVariate = ['font.slogan']
        clonedTemplateData.font.slogan.id = fonts[i].id
        clonedTemplateData.font.slogan.fullName = fonts[i].name
        clonedTemplateData.font.slogan.category = category
      } else if (variationTarget === 'symbol') {
        this.doNotVariate = ['symbol.icon']
        clonedTemplateData.symbol.icon = {
          type: 'initials',
          id: initials,
          initials
        }
        clonedTemplateData.symbol.icon.fontId = fonts[i].id
      } else {
        if (variationTarget === 'brand1') {
          this.doNotVariate = ['font.brand1']
          clonedTemplateData.font.brand1.id = fonts[i].id
          clonedTemplateData.font.brand1.fullName = fonts[i].name
          clonedTemplateData.font.brand1.category = category
          delete clonedTemplateData.font.brand2
        } else {
          if (!clonedTemplateData.font[variationTarget]) {
            clonedTemplateData.font[variationTarget] = {}
          }
          this.doNotVariate = ['font.' + variationTarget]
          clonedTemplateData.font[variationTarget].id = fonts[i].id
          clonedTemplateData.font[variationTarget].fullName = fonts[i].name
          clonedTemplateData.font[variationTarget].category = category
        }
        // clonedTemplateData.font.brand2.id = fonts[(i + 1) % fonts.length].id
      }
      this.setZoomTo(vars, variationTarget)
      vars.push(clonedTemplateData)
    }
    // console.time('Time this2')
    for (const v of vars) {
      if (!v._zoomTo) {
        Object.defineProperty(v, '_zoomTo', {
          value: '',
          enumerable: false
        })
      }
      LogoInstance.updateMD5(v)
    }
    return vars
    // vars.map((variation, index) => {
    //   const element = document.createElement('div')
    //   element.classList.add('logo-preview')
    //   element.style.overflow = 'hidden'

    // const instance = new LogoInstance(variation, undefined, this.options)
    // element.appendChild(instance.getPreviewElement())
    // instance.updateLayout()
    //   this.allLogos.push(instance)

    //   variations.push({
    //     instance: instance,
    //     element: element
    //   })
    // })
    // console.timeEnd('Time this2')

    // return variations
  }

  // static getWrapperElement (logoInstance) {
  //   let element = logoInstance.getPreviewElement()
  //   if (logoInstance.hasOwnProperty('element')) {
  //     if (logoInstance.element && logoInstance.element.parentNode) {
  //       return logoInstance.element.parentNode
  //     }
  //   }

  //   const element = document.createElement('div')
  //   element.classList.add('logo-preview')
  //   element.style.overflow = 'hidden'

  //   element.appendChild(logoInstance.getPreviewElement())
  //   element.dataLogoInstance = logoInstance

  //   return element
  // }
}

export default LogoMaker
