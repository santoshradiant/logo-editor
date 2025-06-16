import BaseLayout from './layout-base'

class SloganLayout extends BaseLayout {
  constructor (settings, options) {
    super(settings, options)
    this.sloganLayoutTop = this.settings.logoVersion > 0
  }

  getSloganFontSize () {
    if (this.settings.layout.brand.alignment === 'horizontal') {
      return 42
    } else {
      if (this.settings.logoVersion >= 3) {
        return 36
      } else {
        return 20
      }
    }
  }

  getSloganLayout (position) {
    const layers = []
    const lineCount = this.settings.layout.slogan.lineCount || 1
    for (let ix = 0; ix < lineCount; ix++) {
      const newPos = {}
      if (ix > 0) {
        newPos.topFrom = 'child(-1).bottom + 0.0015'
      }
      layers.push({
        type: 'text',
        tag: 'slogan1',
        hovertag: 'slogan1',
        position: {
          ...position,
          ...newPos
        },
        text: '{slogan:' + ix + '}',
        font: {
          fontFrom: 'slogan',
          lineSpacingTop: ix === 0 ? this.sloganLayoutTop : false,
          family: 'absideregular',
          size: this.getSloganFontSize(),
          colorFrom: 'slogan'
        }
      })
    }
    return layers
  }

  // [slogan              ]
  getLeftLayout () {
    return [
      ...this.getSloganLayout({
        top: 0.0,
        left: 0,
        autoWidth: true,
        autoHeight: true
      })
    ]
  }

  // [              slogan]
  getRightLayout () {
    return [
      ...this.getSloganLayout({
        top: 0.0,
        smartLeft: 1.0,
        autoWidth: true,
        autoHeight: true
      })
    ]
  }

  // [       slogan       ]
  getCenterLayout () {
    return [
      ...this.getSloganLayout({
        top: 0.0,
        smartLeft: 0.5,
        autoWidth: true,
        autoHeight: true
      })
    ]
  }

  // [slogan--------------]
  getLeftFillLayout () {
    return [
      ...this.getSloganLayout({
        top: 0.0,
        left: 0,
        autoWidth: true,
        autoHeight: true
      }),
      {
        type: 'text',
        position: {
          autoHeight: true,
          leftFrom: 'child(-1).right+0.0125',
          right: 1.0,
          stretch: true,
          useBaseLine: true
        },
        text: '-',
        font: {
          fontFrom: 'slogan',
          lineSpacingTop: this.sloganLayoutTop,
          family: 'absideregular',
          size: this.getSloganFontSize(),
          colorFrom: 'slogan'
        }
      }
    ]
  }

  // [--------------slogan]
  getRightFillLayout () {
    return [
      ...this.getSloganLayout({
        top: 0.0,
        smartLeft: 1,
        autoWidth: true,
        autoHeight: true
      }),
      {
        type: 'text',
        position: {
          autoHeight: true,
          left: 0,
          rightFrom: 'child(-1).left - 0.0125',
          stretch: true,
          useBaseLine: true
        },
        text: '-',
        font: {
          fontFrom: 'slogan',
          lineSpacingTop: this.sloganLayoutTop,
          family: 'absideregular',
          size: this.getSloganFontSize(),
          colorFrom: 'slogan'
        }
      }
    ]
  }

  // [-------slogan-------]
  getCenterFillLayout () {
    return [
      ...this.getSloganLayout({
        top: 0.0,
        smartLeft: 0.5,
        autoWidth: true,
        autoHeight: true
      }),
      {
        type: 'text',
        position: {
          autoHeight: true,
          left: 0,
          top: 0,
          rightFrom: 'child(-1).left - 0.0125',
          // heightFrom: 'child(-1).height',
          stretch: true,
          useBaseLine: true
        },
        text: '-',
        font: {
          fontFrom: 'slogan',
          lineSpacingTop: this.sloganLayoutTop,
          family: 'absideregular',
          size: this.getSloganFontSize(),
          colorFrom: 'slogan'
        }
      },
      {
        type: 'text',
        position: {
          autoHeight: true,
          top: 0,
          leftFrom: 'child(-2).right + 0.0125',
          right: 1.0,
          stretch: true,
          useBaseLine: true
        },
        text: '-',
        font: {
          fontFrom: 'slogan',
          lineSpacingTop: this.sloganLayoutTop,
          family: 'absideregular',
          size: this.getSloganFontSize(),
          colorFrom: 'slogan'
        }
      }
    ]
  }

  // [      -slogan-      ]
  getCenterShortLayout () {
    const layout = this.getSloganLayout({
      top: 0.0,
      smartLeft: 0.5,
      autoWidth: true,
      autoHeight: true
    })
    layout[0].text = '-{slogan}-'
    return layout
  }

  // [      -slogan-      ]
  getInverseLayout () {
    const layout = [
      {
        type: 'group',
        position: {
          top: 0.0075,
          smartLeft: 0.5,
          autoWidth: true,
          // width: 1.0,
          autoHeight: true
        },
        layers: [
          {
            type: 'shape',
            position: {},
            shape: {
              name: 'rect',
              type: 0,
              align: 'left',
              offsetX: 5,
              offsetY: 2,
              colorFrom: 'slogan'
            }
          },
          this.getSloganLayout({
            top: 0,
            autoWidth: true,
            autoHeight: true,
            padding: 5
          })
        ]
      }
    ]

    return layout
  }

  getLayout () {
    let layers

    // Andre: Deze zijn niet goed
    // this.settings.slogan.style = 'center-short' // Heeft geen 5px lijntje rechts en links
    // this.settings.slogan.style = 'inverse' // Moet rect worden met slogan erin, met 3px padding om slogan heen.

    const style = this.settings.layout.slogan.style

    if (!this.settings.text.slogan) {
      layers = this.getCenterLayout() // default to center layout and let textlayer filter empty text
    } else if (style === 'inverse') {
      layers = this.getInverseLayout()
    } else if (style === 'left') {
      layers = this.getLeftLayout()
    } else if (style === 'right') {
      layers = this.getRightLayout()
    } else if (style === 'center') {
      layers = this.getCenterLayout()
    } else if (style === 'left-fill') {
      layers = this.getLeftFillLayout()
    } else if (style === 'right-fill') {
      layers = this.getRightFillLayout()
    } else if (style === 'center-fill') {
      layers = this.getCenterFillLayout()
    } else if (style === 'center-short') {
      layers = this.getCenterShortLayout()
    }

    return {
      type: 'group',
      tag: 'slogan',
      hovertag: 'slogan',
      position: {
        topFrom: 'child(-1).bottom + 0.005',
        widthFrom: 'child(-1)',
        autoHeight: true,
        left: 0
      },
      layers: layers
    }
  }
}

SloganLayout.prototype.variations = {
  style: {
    'left-fill': {
      weight: 12
    },
    'right-fill': {
      weight: 4
    },
    'center-fill': {
      weight: 16
    },
    'center-short': {
      weight: 0
    },
    left: {
      weight: 4
    },
    right: {
      weight: 10
    },
    center: {
      weight: 20
    }

    // TODO make this work again with inverse on text layer
    // inverse: {
    //   weight: 1
    // }
  }
}

export default SloganLayout
