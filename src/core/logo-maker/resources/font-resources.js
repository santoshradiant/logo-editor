import FontInstance from './font-instance'
import FontGlyphLoader from './font-glyph-loader'
import random from '../utils/weighted-random'
import { BASE_FONT_URL, fontDefintionsRoot } from './font-definitions'

let instance = null

// let debugCounter = 1
class FontResources {
  static getInstance () {
    if (instance) {
      return instance
    }

    instance = new FontResources()

    // 'https://lmstoragedev.blob.core.windows.net/font/font-definitions'
    return instance
  }

  constructor () {
    this.fontCache = {}
    this.fontsByCategory = {}
    this.fontsById = {}
    this.fontGlyphLoader = new FontGlyphLoader()
    this.primaryFonts = []

    // Since code in the constructor is not debugable let's just create it when used
    this.fontListMade = false
  }

  checkFontListMade = () => {
    if (this.fontListMade) {
      return
    }
    this.fontListMade = true

    for (const font of fontDefintionsRoot.fontDefinitions) {
      if (font.isArchived) {
        continue
      }

      // if (font.category !== 'handwritten') {
      //   continue
      // }
      if (typeof font.pairs === 'string') {
        font.pairs = font.pairs.split(',')
      }
      font.pairs = font.pairs.filter(x => !!x)
      if (font.fileName.startsWith('http')) {
        font.url = font.fileName
      } else {
        font.url = `${BASE_FONT_URL}/${font.fileName}`
      }

      this.fontsById[font.id] = font

      let category = this.fontsByCategory[font.category]
      if (!category) {
        category = this.fontsByCategory[font.category] = {
          fonts: []
        }
      }
      category.fonts.push(font)
    }

    this.primaryFonts = Object.values(this.fontsById).filter(x => x.isPrimary)
  }

  getFontCategories = () => {
    this.checkFontListMade()
    return Object.keys(this.fontsByCategory)
  }

  getFontsByCategory = category => {
    this.checkFontListMade()
    return this.fontsByCategory[category].fonts
  }

  getSloganFontsByBrandCategory = category => {
    this.checkFontListMade()
    if (category === 'handwritten') {
      const cat = random(this.getCategoryExcept(category))
      return this.fontsByCategory[cat].fonts.filter(x => x.isSlogan)
    } else {
      return this.getSloganFonts()
      // this.fontsByCategory[category].fonts.filter(x => x.isSlogan)
    }
  }

  getSloganFontsByCategory = category => {
    this.checkFontListMade()
    return this.fontsByCategory[category].fonts.filter(x => x.isSlogan)
  }

  getSloganFonts = () => {
    this.checkFontListMade()
    return Object.values(this.fontsById).filter(x => x.isSlogan)
  }

  getSymbolFonts = () => {
    this.checkFontListMade()
    return Object.values(this.fontsById).filter(x => x.isSymbol)
  }

  getSymbolFontsByCategory = category => {
    this.checkFontListMade()
    return this.fontsByCategory[category].fonts.filter(x => x.isSymbol)
  }

  getCategoryForFont = fontId => {
    const font = this.fontsById[fontId]
    return font && font.category
  }

  getFontForId = fontId => this.fontsById[fontId]

  getBracketFonts = brandFont => {
    this.checkFontListMade()
    let fontList
    if (brandFont) {
      if (brandFont.isBracket) {
        return [brandFont]
      }
      fontList = this.fontsByCategory[brandFont.category].fonts.filter(x => x.isBracket)
    }
    if (!fontList || fontList.length === 0) {
      fontList = Object.values(this.fontsById).filter(x => x.isBracket)
    }
    return fontList
  }

  getPairs = id => {
    this.checkFontListMade()
    return Object.values(this.fontsById).filter(x => x.pairs && x.pairs.indexOf(id) !== -1)
  }

  getPrimary = category => {
    this.checkFontListMade()
    if (!this.primaryFonts) {
      this.primaryFonts = {}
    }
    if (!this.primaryFonts[category]) {
      this.primaryFonts[category] = this.getFontsByCategory(category).filter(x => x.isPrimary)
    }
    return this.primaryFonts[category]
  }

  getCategoryExcept = category => {
    const categories = this.getFontCategories()
    const ix = categories.indexOf(category)
    // Remove the same category so they are from different categories
    if (ix !== -1) {
      categories.splice(ix, 1)
    }
    return categories
  }

  getRandomFontPairForCard = sloganFont => {
    this.checkFontListMade()
    if (sloganFont) {
      sloganFont = this.fontsById[sloganFont.id]
    }

    const fonts = Object.values(this.fontsById).filter(x => {
      const nameLower = x.name.toLowerCase()
      const goodCategory = ['handwritten', 'decorative', 'futuristic'].indexOf(x.category) === -1
      const isBold =
        nameLower.indexOf('bold') !== -1 ||
        nameLower.indexOf('heavy') !== -1 ||
        nameLower.indexOf('black') !== -1 ||
        x.id.indexOf('700') !== -1
      return goodCategory && x.isSlogan && isBold && x.pairs && x.pairs.length
    })
    const cardTitle = random(fonts)
    const pairs = this.getPairs(cardTitle.id)
    const result = {
      card: random(pairs) || cardTitle,
      cardTitle
    }
    // console.log('Fonts: ', result)
    return result
  }

  getRandomFontPair = (primaryFont, wordInstance) => {
    this.checkFontListMade()
    if (primaryFont) {
      primaryFont = this.fontsById[primaryFont.id]
    }
    let categories
    if (wordInstance.noHandWrittenBrandName()) {
      categories = this.getCategoryExcept('handwritten')
    } else {
      categories = this.getFontCategories()
    }
    const category = random(categories)
    const brand1 = primaryFont || random(this.getPrimary(category))

    if (Math.random() < 0.5) {
      return {
        brand1,
        brand2: brand1
      }
    } else {
      let pairs = this.getPairs(brand1.id)
      if (pairs.length === 0) {
        pairs = this.getFontsByCategory(random(this.getCategoryExcept(category))).filter(x => x.isSecondary)
      }

      const brand2 = random(pairs)
      return {
        brand1,
        brand2
      }
    }
  }

  mapFonts = callBack => {
    this.checkFontListMade()
    return Object.values(this.fontsById).map(callBack)
    // let result = []
    // for (let font of Object.values(this.fontsById)) {
    //   let value = callBack(font)
    //   result.push(value)
    // }
    // return result
  }

  mapCache = callBack => {
    this.checkFontListMade()
    return Object.values(this.fontCache).map(callBack)
  }

  getFontInstance = (fontRec, text, loadFinished) => {
    this.checkFontListMade()
    if (!fontRec.id) {
      fontRec.id = fontRec.family.replace(/ /gi, '').toLowerCase()
    }

    const fontDefinition = this.fontsById[fontRec.id]
    if (!fontDefinition) {
      console.error('Font family not found: ', fontRec)
    }

    const cacheKey = fontRec.id + '_' + text
    let fontInstance = this.fontCache[cacheKey]
    if (!fontInstance) {
      this.fontCache[cacheKey] = fontInstance = new FontInstance(
        this.fontGlyphLoader,
        fontDefintionsRoot.version,
        fontDefinition,
        text
      )
    }

    // fontInstance.count = debugCounter++
    // console.log('!!AK Load: ', fontInstance.count)
    fontInstance.load(loadFinished)

    return fontInstance
  }
}

export default FontResources
