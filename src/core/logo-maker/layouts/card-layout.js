import AMCore from '../amcore'
import BaseLayout from './layout-base'
import BrandLayout from './brand-layout'
import SymbolLayout from './symbol-layout'
import DecorationLayout from './decoration-layout'
import LogoLayout from './logo-layout'
import layout1 from './card-layout1'
import layout1p from './card-layout1p'
import layout2 from './card-layout2'
import layout2p from './card-layout2p'
import layout3 from './card-layout3'
import layout3p from './card-layout3p'

class CardLayout extends BaseLayout {
  constructor (settings, options, logoInstance) {
    super(settings, options)
    const newOptions = options // getColor isn't in here{ ...options, ...{ getColor: this.getColor.bind(this) } }

    this.brand = new BrandLayout(this.settings, newOptions)
    this.symbol = new SymbolLayout(this.settings, newOptions)
    this.decoration = new DecorationLayout(this.settings, newOptions)
    this.logo = new LogoLayout(this.settings, newOptions)
    this.logoInstance = logoInstance
    this.colorMode = settings.layout.card.colorMode
    this.showSymbol = settings.layout.card.showSymbol || settings.layout.card.showSymbol === 'true'
    this.isLandscape = this.settings.layout.card.orientation === 'landscape'
    this.logoMode = 0
    // brandTextColor = 0 // 0 = white, 1 = black, 2 = slogan
    // this.textBackground = 0 // 0 = black, 1 = white, 2 = shape
  }

  getSmartLeft () {
    switch (this.settings.layout.card.justify) {
      case 'center':
        return 0.5
      case 'right':
        return 1.0
      default:
        return 0.0
    }
  }

  getLogoLayers0 () {
    switch (this.settings.layout.card.logoMode) {
      case 'full':
        return [this.decoration.getLayout()]
      case 'content':
        return this.symbol.getLayers()
      case 'brandName':
        return [this.brand.getLayout()]
      case 'symbol':
        return [
          {
            type: 'shape',
            tag: 'symbol',
            hovertag: 'symbol',
            position: {
              smartLeft: 1.0 - Math.pow(this.getSmartLeft(), 3.0),
              smartTop: 0.5,
              height: 1.0,
              width: 1.0
            },
            shape: {
              name: 'symbol',
              decoration: 'none',
              colorFrom: 'symbol'
            }
          }
        ]
      default:
        return [this.logo.getLayout()]
    }
  }

  getLogoLayers () {
    const res = this.getLogoLayers0()
    // console.log(this.settings.layout.card.logoMode, res)
    return res
  }

  getColor (...params) {
    if (this.settings.layout.card.style === 'card2') {
      // console.log(params)
    }
    return this.options.getColor(...params)
  }

  nextLine (tag, text, textDefault, lineSpace, title, extraSize, invertAlignment) {
    const layout = {
      type: 'text',
      tag,
      position: {
        topFrom: lineSpace ? 'child(-1).bottom + ' + lineSpace : undefined,
        autoWidth: true,
        autoHeight: true
      },
      text,
      textDefault,
      font: {
        fontFrom: title ? 'cardTitle' : 'card',
        family: 'egoregular', // Default font does not matter
        size: 18 + (extraSize || 0) * 0.25,
        color: this.colorMode === 'black' ? [255, 255, 255] : [0, 0, 0],
        colorFrom: this.colorMode === 'logo' ? 'slogan' : undefined
        // colorFrom: 'slogan'
      }
    }

    layout.position.smartLeft = invertAlignment ? 1.0 - this.getSmartLeft() : this.getSmartLeft()
    return layout
  }

  getCardLines (part, excludeEMail) {
    part = ~~part
    const layers = []
    if (part === 0 || part === 1) {
      layers.push(this.nextLine('card-name', '{name}', 'Your name', undefined, true, 36, part === 1))
      layers.push(this.nextLine('card-function', '{function}', 'Your function', '0.02', false, 18, part === 1))
    }
    if (part === 0 || part === 2) {
      layers.push(
        this.nextLine('card-brand-name', '{brandName}', 'Your brandname', part === 0 ? '0.16' : undefined, true, 18)
      )
      layers.push(this.nextLine('card-address-1', '{address1}', 'Your street 1235', '0.08'))
      layers.push(this.nextLine('card-address-2', '{address2}', '12345 Yourcity', '0.02'))
      layers.push(this.nextLine('card-phone', '{phone}', '123-yourphone', '0.02'))
      if (!excludeEMail) {
        layers.push(this.nextLine('card-email', '{email}', 'your@emailaddres.com', '0.08'))
        layers.push(this.nextLine('card-www', '{www}', 'www.your-website.com', '0.02'))
      } else {
        layers.push(this.nextLine('card-www', '{www}', 'www.your-website.com', '0.08'))
      }
    }
    return layers
  }

  getLayout1 (landscape) {
    if (landscape) {
      return layout1.call(this)
    } else {
      return layout1p.call(this)
    }
  }

  getLayout2 (landscape) {
    if (landscape) {
      return layout2.call(this)
    } else {
      return layout2p.call(this)
    }
  }

  getLayout3 (landscape) {
    if (landscape) {
      return layout3.call(this)
    } else {
      return layout3p.call(this)
    }
  }

  getLayoutBack1 () {
    return AMCore.clone({
      type: 'group',
      tag: 'card-layout-root',
      position: {
        left: 0.0,
        top: 0.0,
        width: 0.65,
        height: 1.0
      },
      layers: [
        {
          type: 'shape',
          tag: 'decoration',
          position: {
            width: 0.65,
            height: 1.0
          },
          shape: {
            name: 'rect',
            offset: 80,
            colorFrom: 'decoration',
            colors: [
              [255, 255, 255],
              [0, 0, 0]
            ]
          },
          linkedToParent: 'around',
          linkStyle: 'around'
        },
        {
          type: 'group',
          tag: 'card-text',
          position: {
            centerTop: 0.5,
            centerLeft: 0.325,
            autoWidth: true,
            autoHeight: true
          },
          layers: [
            {
              type: 'contain',
              tag: 'card-brand',
              position: {
                width: 0.6,
                height: 0.9
              },
              content: this.getLogoLayers()
            }
          ]
        }
      ]
    })
  }

  getLayoutBack2 () {
    return AMCore.clone({
      type: 'group',
      tag: 'card-layout-root',
      position: {
        left: 0.0,
        top: 0.0,
        width: 0.65,
        height: 1.0
      },
      layers: [
        {
          type: 'shape',
          tag: 'decoration',
          position: {
            width: 1.0,
            height: 1.0
          },
          shape: {
            name: 'rect',
            offset: 80,
            colors: [
              [255, 255, 255],
              [0, 0, 0]
            ]
          },
          linkedToParent: 'around',
          linkStyle: 'around'
        },
        {
          type: 'group',
          tag: 'card-text',
          position: {
            centerTop: 0.5,
            centerLeft: 0.325,
            autoWidth: true,
            autoHeight: true
          },
          layers: [
            {
              type: 'contain',
              tag: 'card-brand',
              position: {
                width: 0.4,
                height: 0.4
              },
              content: this.getLogoLayers()
            }
          ]
        }
      ]
    })
  }

  getLayoutBack3 () {
    let width = 1.0
    let height = 0.65
    if (this.isLandscape) {
      width = 0.65
      height = 1.0
    }
    return AMCore.clone({
      type: 'group',
      tag: 'card-layout-root',
      position: {
        left: 0.0,
        top: 0.0,
        width,
        height
      },
      layers: [
        {
          type: 'shape',
          tag: 'decoration',
          shape: {
            name: 'rect',
            offset: 80,
            colorFrom: 'decoration',
            colors: [
              [255, 255, 255],
              [0, 0, 0]
            ]
          },
          linkedToParent: 'around',
          linkStyle: 'around'
        },
        {
          type: 'group',
          tag: 'card-text',
          position: {
            centerTop: height * 0.5,
            centerLeft: width * 0.5,
            autoWidth: true,
            autoHeight: true
          },
          layers: [
            {
              type: 'contain',
              tag: 'card-brand',
              position: {
                width: width * 0.7,
                height: height * 0.5
              },
              content: this.getLogoLayers()
            }
          ]
        }
      ]
    })
  }

  getLayout () {
    if (this.options.isFront) {
      const style = this.settings.layout.card.style
      switch (style) {
        case 'card1':
          return this.getLayout1(this.isLandscape)
        case 'card2':
          return this.getLayout2(this.isLandscape)
        case 'card3':
          return this.getLayout3(this.isLandscape)
        default:
          return this.getLayout3()
      }
    } else {
      const style = this.settings.layout.card.style
      switch (style) {
        case 'card1':
          return this.getLayoutBack1()
        case 'card2':
          return this.getLayoutBack2()
        case 'card3':
          return this.getLayoutBack3()
        default:
          return this.getLayoutBack3()
      }
    }
  }
}

CardLayout.prototype.variations = {
  style: {
    card1: { weight: 1000 },
    card2: { weight: 1000 },
    card3: { weight: 0 }
  },
  orientation: {
    portrait: { weight: 10 },
    landscape: { weight: 50 }
  },
  colorMode: {
    white: { weight: 10 },
    black: { weight: 7 },
    logo: { weight: 5 }
  },
  logoMode: {
    full: { weight: 15 },
    content: { weight: 15 },
    brandName: { weight: 10 },
    symbol: { weight: 10 }
  },
  justify: {
    left: { weight: 10 },
    center: { weight: 15 },
    right: { weight: 10 }
  },
  showSymbol: {
    true: { weight: 10 },
    false: { weight: 10 }
  }
}

export default CardLayout
