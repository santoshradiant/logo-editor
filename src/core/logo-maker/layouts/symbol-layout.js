import BrandLayout from './brand-layout'
import SloganLayout from './slogan-layout'
import BaseLayout from './layout-base'

class SymbolLayout extends BaseLayout {
  constructor (settings, options) {
    super(settings, options)
    this.settings.symbol = this.settings.symbol || {}

    this.brand = !settings.noBrandLayout ? new BrandLayout(this.settings, this.options) : undefined
    this.slogan = !settings.noSloganLayout ? new SloganLayout(this.settings, this.options) : undefined
  }

  getLayers () {
    const position = this.settings.layout.symbol.position
    const brand = this.brand ? this.brand.getLayout() : undefined
    const slogan = this.slogan && this.settings.text.slogan ? this.slogan.getLayout() : undefined
    // const slogan = this.slogan ? this.slogan.getLayout() : undefined

    const layers = {
      none: [brand, slogan],
      behind: [
        {
          type: 'shape',
          tag: 'decoration',
          position: {},
          shape: {
            name: 'symbol',
            decoration: 'none',
            colorFrom: 'symbol'
          },
          linkedToParent: 'aspect',
          linkStyle: 'cutout'
        },
        brand,
        slogan
      ],
      top: [
        {
          type: 'group',
          tag: 'symbol-root',
          position: {
            autoWidth: true,
            autoHeight: true,
            left: 0
          },
          layers: [
            {
              type: 'group',
              tag: 'brand-slogan',
              position: {
                top: 0.0,
                autoWidth: true,
                autoHeight: true,
                centerLeft: 0.0
              },
              layers: [brand, slogan]
            },
            {
              type: 'shape',
              tag: 'symbol',
              hovertag: 'symbol',
              position: {
                bottomFrom: '-0.05 * 0.15 * template.symbol.margin',
                // bottom: -0.05 * 0.15, // 'child(-1).height * -0.2',
                // widthFrom: 'child(-1).width * 0.5',
                width: 0.05,
                centerLeft: 0.0,
                maxWidth: 0.075,
                maxHeight: 0.1
              },
              shape: {
                name: 'symbol',
                decoration: 'none',
                colorFrom: 'symbol'
              }
            }
          ]
        }
      ],
      // top: [
      //   {
      //     type: 'shape',
      //     position: {
      //       bottom: -0.0125 * 1.5,
      //       width: 0.15,
      //       smartLeft: 0.5
      //     },
      //     shape: {
      //       name: 'symbol',
      //       decoration: 'none',
      //       colorFrom: 'symbol'
      //     }
      //   },
      //   { ...brand,
      //     position: {
      //       topFrom: 'child(-1).bottom + 0.0125 * 1.5',
      //       smartLeft: 0.5,
      //       autoWidth: true,
      //       autoHeight: true
      //     } },
      //   { ...slogan,
      //     position: {
      //       topFrom: 'child(-1).bottom + 0.0125 * 1.5',
      //       smartLeft: 0.5,
      //       autoWidth: true,
      //       autoHeight: true
      //     } }
      // ],
      leftVertical: [
        {
          type: 'group',
          tag: 'symbol-root',
          position: {
            autoWidth: true,
            autoHeight: true,
            left: 0.0
          },
          layers: [
            {
              type: 'group',
              tag: 'symbol-brand',
              position: {
                autoWidth: true,
                autoHeight: true,
                left: 0
              },
              layers: [brand]
            },
            {
              type: 'shape',
              tag: 'symbol',
              hovertag: 'symbol',
              position: {
                topFrom: 'child(-1).top',
                heightFrom: 'child(-1).height',
                // rightFrom: 'child(-1).height * -0.2',
                rightFrom: 'child(-1).height * -0.2 * template.symbol.margin',
                maxWidth: 0.5,
                maxHeight: 0.5
              },
              shape: {
                name: 'symbol',
                decoration: 'none',
                colorFrom: 'symbol'
              }
            }
          ]
        },
        slogan
      ],
      leftHorizontal: [
        {
          type: 'group',
          tag: 'symbol-root',
          position: {
            autoWidth: true,
            autoHeight: true,
            // smartTop: 0.5,
            left: 0
          },
          layers: [brand, slogan]
        },
        {
          type: 'shape',
          tag: 'symbol',
          hovertag: 'symbol',
          position: {
            // topFrom: 'child(-1).top',
            // smartTop: 0.5,
            heightFrom: 'child(-1).height',
            rightFrom: 'child(-1).height * -0.2 * template.symbol.margin',
            // right: -0.0125 * 1.5,
            topFrom: 'child(-1).height * (1.0 - child(0).scale) * 0.5',
            maxWidth: 0.5,
            maxHeight: 0.5
          },
          shape: {
            name: 'symbol',
            decoration: 'none',
            colorFrom: 'symbol'
          }
        }
      ]
    }

    const removeUndefinedFromLayers = x => {
      const newLayers = []
      for (const layer of x) {
        if (layer) {
          newLayers.push(layer)
        }
      }
      for (const layer of newLayers) {
        if (layer.layers) {
          layer.layers = removeUndefinedFromLayers(layer.layers)
        }
      }
      return newLayers
    }
    return removeUndefinedFromLayers(layers[position])
    // return layers[position]
  }
}

SymbolLayout.prototype.variations = {
  position: {
    none: { weight: 20 },
    // behind: { weight: 0 },
    top: { weight: 30 },
    leftVertical: { weight: 5 },
    leftHorizontal: { weight: 15 }
  },
  decoration: {
    none: { weight: 16 },
    inverse: { weight: 1 },
    inverseRounded: { weight: 4 },
    rect: { weight: 1 },
    rounded: { weight: 1 }
  }
}

export default SymbolLayout
