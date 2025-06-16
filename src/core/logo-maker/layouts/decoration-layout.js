import SymbolLayout from './symbol-layout'
import BaseLayout from './layout-base'

// const SPECIAL_TEMPLATES = []

class DecorationLayout extends BaseLayout {
  constructor (settings, options) {
    super(settings, options)

    this.symbol = new SymbolLayout(this.settings, this.options)
  }

  getLayout () {
    // if (SPECIAL_TEMPLATES.length !== 0) {
    //   // return SPECIAL_TEMPLATES[0]
    // }
    const inverse =
      this.settings &&
      this.settings.layout &&
      this.settings.layout.decoration !== 'none' &&
      this.settings.background &&
      this.settings.background.inverse

    const symbolLayers = this.symbol ? this.symbol.getLayers() : undefined

    let layout

    if (this.settings.layout.decoration.style === 'none') {
      layout = {
        type: 'group',
        tag: 'logo-inner',
        position: {
          autoWidth: true,
          autoHeight: true
        },
        layers: symbolLayers
      }
    } else {
      layout = {
        type: 'group',
        tag: 'decoration',
        hovertag: 'decoration',
        position: {
          autoWidth: true,
          autoHeight: true
        },
        layers: [
          {
            type: 'shape',
            tag: 'logo-inner',
            hovertag: 'decoration',
            position: {
              autoWidth: true,
              autoHeight: true
            },
            shape: {
              name: this.settings.layout.decoration.style,
              isBackground: true, // This ensures we also get the background data
              colorFrom: 'decoration',
              colorFrom2: 'symbol'
            },
            linkedToParent: 'around',
            linkStyle: inverse ? 'mask' : 'around'
          },
          ...symbolLayers
        ]
      }
    }

    return layout
  }
}

DecorationLayout.prototype.variations = {
  style: {
    none: {
      fixedAspect: false,
      weight: 14
    },
    circle: {
      // Deprecated, the user can't make new logo's but it needs to be here for support of older logo's
      fixedAspect: true,
      params: {
        inverse: { false: { weight: 40 }, true: { weight: 60 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 3 },
          crossing: { weight: 1 }
        },
        strokeWidth: { isRange: true, min: 1.5, default: 2, max: 6, exp: 1.5 }
      },
      weight: 0
    },
    rectangle: {
      // Deprecated, the user can't make new logo's but it needs to be here for support of older logo's
      fixedAspect: false,
      params: {
        inverse: { false: { weight: 50 }, true: { weight: 50 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 5 },
          crossing: { weight: 1 },
          shadow: { weight: 3 },
          topbottom: { weight: 2 },
          leftright: { weight: 2 },
          bottom: { weight: 2 },
          topleftbottomright: { weight: 1 },
          bottomlefttopright: { weight: 1 }
        },
        strokeWidth: { isRange: true, min: 1.5, default: 2, max: 6, exp: 1.5 }
      },
      weight: 0
    },
    polygon: {
      // Deprecated, the user can't make new logo's but it needs to be here for support of older logo's
      fixedAspect: true,
      params: {
        cornerCount: { isRange: true, min: 6, default: 6, max: 6 },
        cornerRadius: { isRange: true, min: 0, default: 0.1, max: 0.25, exp: 2.5 },
        lineOffset: { isRange: true, min: 1.5, default: 2, max: 6, exp: 1.5 },
        inverse: { false: { weight: 40 }, true: { weight: 60 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 5 }
        },
        strokeWidth: { isRange: true, min: 1.5, default: 2, max: 6, exp: 1.5 }
      },
      weight: 0
    },
    circle2: {
      fixedAspect: true,
      params: {
        inverse: { false: { weight: 40 }, true: { weight: 50 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 3 }
        },
        strokeWidth: { isRange: true, min: 0.0, default: 1, max: 10, exp: 2.0 },
        strokeDistance: { isRange: true, min: 0.5, default: 1, max: 2 }
      },
      weight: 7
    },
    rectangle2: {
      fixedAspect: false,
      params: {
        inverse: { false: { weight: 50 }, true: { weight: 50 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 5 },
          topbottom: { weight: 2 },
          leftright: { weight: 2 },
          bottom: { weight: 2 },
          topleftbottomright: { weight: 1 },
          bottomlefttopright: { weight: 1 }
        },
        strokeDistance: { isRange: true, min: 0.5, default: 0.5, max: 2, exp: 1.5 },
        strokeWidth: { isRange: true, min: 0.0, default: 1, max: 10, exp: 2.0 }
      },
      weight: 10
    },
    diamond: {
      fixedAspect: true,
      params: {
        borderRadius: { isRange: true, min: 0.0, default: 0.5, max: 1.0 },
        inverse: { false: { weight: 40 }, true: { weight: 60 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 5 }
        },
        strokeDistance: { isRange: true, min: 0.5, default: 0.5, max: 2, exp: 1.5 },
        strokeWidth: { isRange: true, min: 0.0, default: 1, max: 10, exp: 2.0 }
      },
      weight: 3
    },
    pentagon: {
      fixedAspect: true,
      params: {
        borderRadius: { isRange: true, min: 0.0, default: 0.5, max: 1.0 },
        inverse: { false: { weight: 40 }, true: { weight: 60 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 5 }
        },

        strokeDistance: { isRange: true, min: 0.5, default: 0.5, max: 2, exp: 1.5 },
        strokeWidth: { isRange: true, min: 0.0, default: 1, max: 10, exp: 2.0 }
      },
      weight: 3
    },
    hexagon: {
      fixedAspect: true,
      params: {
        borderRadius: { isRange: true, min: 0.0, default: 0.5, max: 1.0 },
        inverse: { false: { weight: 40 }, true: { weight: 60 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 5 }
        },
        strokeDistance: { isRange: true, min: 0.5, default: 0.5, max: 2, exp: 1.5 },
        strokeWidth: { isRange: true, min: 0.0, default: 1, max: 10, exp: 2.0 }
      },
      weight: 3
    },
    hull: {
      fixedAspect: false,
      params: {
        borderRadius: { isRange: true, min: 0.0, default: 0.5, max: 1.0 },
        inverse: { false: { weight: 40 }, true: { weight: 60 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 3 }
        },
        strokeWidth: { isRange: true, min: 0.0, default: 1, max: 10, exp: 2.0 }
      },
      weight: 0
    },
    debug: {
      fixedAspect: false,
      params: {
        borderRadius: { isRange: true, min: 0.0, default: 1.0, max: 1.0 },
        inverse: { false: { weight: 40 }, true: { weight: 60 } },
        borderStyle: {
          single: { weight: 10 },
          double: { weight: 3 }
        },
        strokeWidth: { isRange: true, min: 0.0, default: 1, max: 10, exp: 2.0 }
      },
      weight: 0
    }
  }
}

// Load all the symbol svg's if they fit in a dat url, use webpack to import them
// const req = require.context('./templates', true, /\.json$/)
// req.keys().forEach(function (key) {
//   SPECIAL_TEMPLATES.push(req(key))
// })

export default DecorationLayout
