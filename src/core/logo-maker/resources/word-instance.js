import ResourceInstance from './resource-instance'
import WordGeneration from './word-generation'
import random from '../utils/weighted-random'
import WordResources from './word-resources'

// import { colorNames } from './color-names.json'

class WordInstance extends ResourceInstance {
  constructor (brandName, slogan, originalWeight) {
    super()

    this.wordGeneration = WordGeneration.getInstance()

    this.slogan = slogan || ''
    this.combiWords = []
    this.brandWords = []
    this.allWordsAreNouns = false
    this.fullUpdateCounter = 0

    this.originalWeight = originalWeight
    this.forcedOriginals = this.originalWeight > 30 ? 10 : 0

    this.brandName = ''
    this.updateBrandName(brandName)
    this.updateSlogan(slogan)
  }

  getWordCount = () => {
    return this.brandWords.length
  }

  noHandWrittenBrandName = () => {
    if (!this.brandName) {
      return false
    }
    return this.brandName.length >= 10
  }

  noFixedAspectShapes = () => {
    if (!this.brandName) {
      return false
    }
    return this.brandName.length >= 20 || this.slogan.length > 15
  }

  updateBrandName = brandName => {
    if (this.brandName === brandName) {
      return
    }

    const lastWordCount = this.getWordCount()
    const lastHandWrittenBrandName = this.noHandWrittenBrandName()
    const lastFixedAspectShapes = this.noHandWrittenBrandName()

    const combiWords = []
    this.brandName = brandName || '' // the brandname the user inputed
    this.brandWords = brandName.match(WordResources.wordSplitRegEx) || []
    this.allWordsAreNouns = false
    if (this.brandWords.length <= 2) {
      this.allWordsAreNouns = this.brandWords.every(word =>
        this.wordGeneration.getWordInfo(word).some(wi => wi.startsWith('NOUN'))
      )
    }

    if (
      lastWordCount !== this.getWordCount() ||
      lastHandWrittenBrandName !== this.noHandWrittenBrandName() ||
      lastFixedAspectShapes !== this.noHandWrittenBrandName()
    ) {
      this.fullUpdateCounter++
    }

    // Disable randomization for 1st version
    // let singular = this.wordGeneration.toPlural(brandName, true)
    // No randomization on filled in content
    // if (originalWeight < 10 || this.allWordsAreNouns) {
    //   if (noun === singular) {
    //     let plural = this.wordGeneration.toPlural(noun)
    //     combiWords.push({ weight: originalWeight * 0.2, word: plural })
    //   } else {
    //     combiWords.push({ weight: originalWeight * 0.2, word: singular })
    //   }

    //   this.wordGeneration.getAllCombiWords(combiWords, brandName)
    // }

    const noun = brandName
    combiWords.push({
      weight: this.originalWeight,
      word: noun
    })
    this.combiWords = combiWords
  }

  updateSlogan = slogan => {
    if (this.slogan !== slogan) {
      this.slogan = slogan || ''
    }
  }

  getRandomBrandName = () => {
    if (this.forcedOriginals-- > 0) {
      return this.brandName
    }
    const result = random(this.combiWords)
    result.weight *= 0.2
    if (typeof result.word === 'function') {
      return result.word()
    } else {
      return result.word
    }
  }

  getRandomSlogan = () => {
    return ''
    // if (Math.random() < 0.2) {
    //   // TODO random slogan per category
    //   // FOOD: return 'they melt in your mouth'
    //   // DRINK: good till the last drop
    //   // slogan logic Think outside the ..., The ... place,
    //   return random([
    //     'simply the best there is',
    //     'best in town',
    //     'we take pride in your work',
    //     'quality is our goal',
    //     'your satisfaction is our goal',
    //     'when quality is needed',
    //     'making dreams come true'
    //   ])

    //   // services: ['we\'ll get it done','we\'re here to serve you']
    // } else {
    //   return ''
    // }
  }

  getSymbolSearchWords = textRec => {
    // nounproject automaticly removes ness at the end of a keyword
    return new Promise((resolve, reject) => {
      const inputName = textRec.brandName.replace(/\\|\//g, ' ')
      const words = (inputName.match(WordResources.wordSplitRegEx) || []).map(x => x.trim()).filter(x => !!x)
      const results = []
      // const adjectives = []
      for (const word of words) {
        const wi = this.wordGeneration.getWordInfo(word)
        if (wi.indexOf('ADJ.ALL') === -1) {
          results.push(word)
        }
        // else {
        //   adjectives.push(word)
        // }
      }
      // currently no support for searching on multiple words so these words aren't useful and cost towards API usage limits

      // const allWords = results.join(' ')
      // if (results.length >= 2) {
      //   results.unshift(allWords)
      // }

      // for (const adjective of adjectives) {
      //   results.unshift(adjective + ' ' + allWords)
      // }

      // const generatedName = textRec.brandName.replace(/\\|\//g, ' ').replace(/\[|\]|\|/g, '')
      // if (results.indexOf(generatedName) === -1 && generatedName !== '') {
      //   results.unshift(generatedName)

      //   for (const word of (generatedName.match(WordResources.wordSplitRegEx) || [])
      //     .map(x => x.trim())
      //     .filter(x => !!x)) {
      //     const wi = this.wordGeneration.getWordInfo(word)
      //     if (wi.indexOf('ADJ.ALL') === -1) {
      //       results.push(word)
      //     }
      //   }
      // }

      if (this.slogan) {
        const sloganWords = (this.slogan.match(WordResources.wordSplitRegEx) || []).map(x => x.trim()).filter(x => !!x)

        const nouns = []
        const flushSymbolNouns = () => {
          if (nouns.length > 0) {
            results.push(nouns.join(' '))
            nouns.length = 0
          }
        }

        for (const word of sloganWords) {
          const wi = this.wordGeneration.getWordInfo(word)
          if (wi.indexOf('ADJ.ALL') === -1 && wi.some(wi => wi.startsWith('NOUN'))) {
            nouns.push(word)
          } else {
            flushSymbolNouns()
          }
        }
        flushSymbolNouns()
      }

      // if (results.indexOf(textRec.brandName) === -1) {
      //
      // }

      // console.log('SymbolSearch: ', textRec, results)
      resolve(results)
    })
  }

  // getColorsFromName = () => {
  //   if (this.colorMatches) {
  //     return this.colorMatches
  //   }
  //   let searchWords = this.brandWords.map(x => x.toLowerCase().replace(/'/g, ''))
  //   let maxColorWeight = 0
  //   let colorMatches = []
  //   for (let colorName of colorNames) {
  //     let colorWords = colorName.name.match(WordResources.wordSplitRegEx).map(x => x.toLowerCase().replace(/'/g, ''))
  //     let hitCount = 0
  //     for (let brandWord of searchWords) {
  //       for (let colorWord of colorWords) {
  //         if (colorWord === 'grey') {
  //           colorWord = 'gray'
  //         }
  //         if (colorWord === brandWord) {
  //           hitCount += (Math.max(1, 5 - colorWords.length) * Math.max(1, 30 - colorWord.length)) / 30
  //           break
  //         }
  //       }
  //     }
  //     if (hitCount > 2) {
  //       colorMatches.push({ weight: hitCount, color: colorName.color, name: colorName.name })
  //       maxColorWeight = Math.max(maxColorWeight, hitCount)
  //     }
  //   }

  //   this.colorMatches = colorMatches
  //   return colorMatches
  //   // if (colorMatches.length > 0 && maxColorWeight >= 2.0) {
  //   //   extraAccentColorChange = Math.max(1.0, maxColorWeight - 2) * 0.25
  //   //   colorMatches.sort((a, b) => b.weight - a.weight)

  //   //   randomColors = [...colorMatches.splice(0, 15), ...randomColors]
  //   // }
  // }

  load = loadFinished => {
    if (!this.isLoaded) {
      this.pushLoadFinished(loadFinished)
    }

    if (this.state === 'none') {
      this.state = 'loading'

      // LoadWord(this.url, (error, Word) => {
      //
      //        this.handleLoadFinished(error)
      //      })
    }
  }
}

export default WordInstance
