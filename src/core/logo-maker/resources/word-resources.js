import WordGeneration from './word-generation'
import WordInstance from './word-instance'

let instance = null

class WordResources {
  static wordSplitRegEx = /(\w*[^\s]){1,6}/g

  static getInstance () {
    if (instance) {
      return instance
    }
    instance = new WordResources()
    return instance
  }

  constructor () {
    this.wordCache = {}
    this.wordGeneration = WordGeneration.getInstance()
  }

  getRandomBrandName = () => {
    // if (Math.random() < 0.2) {
    //   return this.wordGeneration.getRandomNoun(0) + ' ' + this.wordGeneration.getRandomNoun(0)
    // } else {
    return this.wordGeneration.getRandomNoun(0)
    // }
  }

  getWordInstance = (brandName, slogan, originalWeight) => {
    // These can't be cached
    return new WordInstance(brandName, slogan, originalWeight)
    // let key = brandName // .toLowerCase()
    // let cacheRec = this.wordCache[key]
    // if (!cacheRec) {
    //   this.wordCache[key] = cacheRec = new WordInstance(brandName, slogan, originalWeight)
    // } else {
    //   cacheRec.updateSlogan(slogan)
    //
    // return cacheRec
  }
}

export default WordResources
