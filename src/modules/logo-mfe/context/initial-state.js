import AMCore from 'core/logo-maker/amcore'
import SymbolLayout from 'core/logo-maker/layouts/symbol-layout'

export const symbolVariations = AMCore.clone(SymbolLayout.prototype.variations)

export const initialInstance = {
  text: {
    stopRandomize: false,
    brandName: '',
    description: '',
    slogan: '',
    showHideSymbol: false
  },

  color: {
    palette: ['#000000', '#2C2C2C', '#FFFFFF', '#555555'],
    decoration: 1,
    brand1: 2,
    brand2: 1,
    slogan: 2,
    symbol: 2
  },
  layout: {
    symbol: {
      position: 'none',
      decoration: 'none'
    }
  },
  brand1: {
    letterSpacing: 1,
    lineSpacing: 1
  },
  brand2: {
    letterSpacing: 1,
    lineSpacing: 1
  },
  symbol: {
    icon: 'random',
    size: 1,
    spacing: 1
  }
}
