import SymbolInstance from './symbol-instance'
import GENERIC_SYMBOLS from './symbol-definitions'
import fetch from '@eig-builder/core-utils/fetch'
import { api } from '@eig-builder/core-utils/helpers/url-helper'

import random from '../utils/weighted-random'
import FontResources from './font-resources'
import WordResources from './word-resources'
import { symbolBlockWords } from './symbols/symbol-block-words'

let instance = null

class SymbolSearchInstance {
  constructor (searchText) {
    this.searchText = searchText
    this.result = undefined
    this.resolvers = []
  }

  get = () => {
    if (this.result) {
      // We already got this one return sync promise
      return new Promise((resolve, reject) => resolve(this.result))
    }

    if (this.fetching) {
      const promise = new Promise((resolve, reject) => this.resolvers.push(resolve))

      return promise
    }

    this.fetching = true
    return fetch(api(`v1.0/iconlookup/keyword/${window.encodeURIComponent(this.searchText)}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(x => {
      this.result = x.ok ? x.json() : null
      for (const r of this.resolvers) {
        r(this.result)
      }
      this.resolvers = []
      return this.result
    })
  }
}

class SymbolResources {
  static getInstance () {
    if (instance) {
      return instance
    }
    instance = new SymbolResources()
    return instance
  }

  constructor () {
    this.instanceCache = {}
    this.searchCache = {}
    this.symbolList = []

    for (const symbol of GENERIC_SYMBOLS) {
      this.symbolList.push({
        type: 'generic',
        id: symbol.id
      })
    }
  }

  getDefaultInitials = text => {
    let result = ''
    if (!text.brandName || text.brandName === '') {
      return result
    }
    for (const word of text.brandName.replace(/\[|\]|\|/g, '').match(WordResources.wordSplitRegEx) || []) {
      if (word && word.length > 0) {
        result += word[0].toUpperCase()
      }
    }
    return result
  }

  // plain functions otherwise bind will break?
  randomSymbolResultHandler = function (text, words, resolve, results) {
    let symbolRec = null
    const filteredResults = results.filter(x => x && x.result).map(x => ({ result: x.result }))
    const hasResults = filteredResults && filteredResults.length > 0

    // With 2 initials, replace the symbol with initials-symbol (30% chance)
    const initials = this.getDefaultInitials(text)
    if ((!hasResults && this.symbolList.length === 0) || (initials.length <= 3 && Math.random() < 0.25)) {
      const fonts = FontResources.getInstance().getSymbolFonts()
      symbolRec = {
        type: 'initials',
        id: initials,
        initials,
        fontId: fonts[~~(Math.random() * fonts.length)].id
      }
      resolve(symbolRec)
      return
    }
    if (!hasResults || Math.random() < 10.0 / (40.0 + filteredResults.length)) {
      // No icon found for keyword -> pick a generic shape
      symbolRec = random(this.symbolList)
      resolve(symbolRec)
    } else {
      const chosenLogos = random(filteredResults, 2.0)
      const logo = random(chosenLogos.result, 2.0)
      symbolRec = {
        type: 'external',
        id: logo.id,
        url: logo.svg_url
      }
      resolve(symbolRec)
    }
  }

  startSearch = function (text) {
    let symbolSearch = this.searchCache[text]
    if (!symbolSearch) {
      this.searchCache[text] = symbolSearch = new SymbolSearchInstance(text)
    }
    return symbolSearch.get()
  }

  // plain functions otherwise bind will break?
  randomSymbolResolver = function (wordInstance, text, resolve, reject) {
    // let words = text.split(' ').map(x => x.trim()).filter(x => !!x)
    wordInstance.getSymbolSearchWords(text).then(words => {
      const promisses = []
      for (const word of words) {
        if (symbolBlockWords.indexOf(word.toLowerCase()) === -1) {
          promisses.push(this.startSearch(word))
        } else {
          console.log('Filtered: ', word)
        }
      }

      Promise.all(promisses).then(this.randomSymbolResultHandler.bind(this, text, words, resolve))
    })
  }

  // // Return a placeholder symbol to be used when others are still loading/working
  // getPlaceholderSymbol = () => this.symbolList[0]

  getRandomSymbol = (wordInstance, text) => {
    return new Promise(this.randomSymbolResolver.bind(this, wordInstance, text))
  }

  getExternalRef = loadFinished => {
    const instance = new SymbolInstance()
    instance.pushLoadFinished(loadFinished)
    return instance
  }

  loadExternalRef = (instance, symbolRec, loadFinished) => {
    instance.initialize(symbolRec)
    const cacheInstance = this.instanceCache[instance.cacheKey]
    if (cacheInstance) {
      // cacheInstance.copyFrom(instance)
      instance = cacheInstance
    } else {
      this.instanceCache[instance.cacheKey] = instance
    }
    instance.load(loadFinished)
    return instance
  }

  getSymbolInstance = (symbolRec, loadFinished) => {
    if (!symbolRec) {
      return null
    }

    const cacheKey = SymbolInstance.getCacheKey(symbolRec)
    if (!symbolRec.id) {
      symbolRec.id = cacheKey
    }

    let instance = this.instanceCache[cacheKey]
    if (!instance) {
      instance = new SymbolInstance(symbolRec)
      this.instanceCache[cacheKey] = instance
    }
    if (!instance.isLoaded) {
      instance.load(loadFinished)
    }

    return instance
  }
}

export default SymbolResources
