import AMCore from '../amcore'

function layout2 () {
  const layout = AMCore.clone({
    type: 'group',
    tag: 'card-layout-root',
    position: {
      left: 0.0,
      top: 0.0,
      width: 1.0,
      height: 0.65
    },
    layers: [
      {
        type: 'shape',
        tag: 'decoration',
        position: {
          width: 1.0,
          height: 0.65
        },
        shape: {
          name: 'rect',
          offset: 80,
          // colorFrom: this.logoInstance.getInverseShapeActive() ? 'decoration' : undefined,
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
        tag: 'card-brand-group',
        position: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          autoHeight: true
        },
        layers: [
          {
            type: 'shape',
            tag: 'decoration',
            position: {
              top: 0,
              left: 0
            },
            shape: {
              name: 'rect',
              offset: 80,
              colorFrom: this.logoInstance.getInverseShapeActive() ? 'decoration' : undefined
            },
            linkedToParent: 'around',
            linkStyle: 'around'
          },
          {
            type: 'contain',
            tag: 'card-brand',
            position: {
              top: 0,
              smartLeft: 0.5,
              width: 1.0,
              height: 0.25
            },
            content: this.getLogoLayers()
          }
        ]
      },
      {
        type: 'group',
        tag: 'card-brand-group',
        position: {
          left: 0.0,
          bottom: 0.65,
          width: 0.5,
          heightFrom: '0.65 - child(-1).height - 0.08'
        },
        layers: [
          {
            type: 'contain',
            tag: 'card-text',
            position: {
              smartLeft: Math.pow(this.getSmartLeft(), this.showSymbol ? 3.0 : 1.0),
              smartTop: 0.5,
              height: 1.0,
              width: 1.0
            },
            content: this.getCardLines(1)
          }
        ]
      },
      {
        type: 'group',
        tag: 'card-brand-group',
        position: {
          right: 1.0,
          bottom: 0.65,
          width: 0.5,
          heightFrom: 'child(-1).height'
        },
        layers: [
          {
            type: 'contain',
            tag: 'card-text',
            position: {
              smartLeft: Math.pow(1.0 - this.getSmartLeft(), this.showSymbol ? 3.0 : 1.0),
              smartTop: 0.5,
              height: 1.0
            },
            content: this.getCardLines(2)
          }
        ]
      }
    ]
  })

  if (this.showSymbol) {
    layout.layers.push({
      type: 'contain',
      tag: 'card-symbol',
      position: {
        bottom: 0.65,
        smartLeft: 1.0 - Math.pow(this.getSmartLeft(), 3.0),
        widthFrom: '1.0 - child(-1).width - 0.05',
        heightFrom: 'child(-1).height'
        // heightFrom: '0.65 - child(-1).height - 0.08'
      },
      content: [
        {
          type: 'shape',
          tag: 'symbol',
          hovertag: 'symbol',
          position: {
            smartLeft: 1.0 - Math.pow(this.getSmartLeft(), 3.0),
            // bottom: 0.65 + 0.01,
            smartTop: 0.5,
            height: 1.0,
            width: 1.0
            // heightFrom: 'child(-1).height * 0.65 - 0.01'
            // widthFrom: '1.0 - child(-1).width',
            // heightFrom: '0.65 - child(-2).height - 0.08'
          },
          shape: {
            name: 'symbol',
            decoration: 'none',
            colors: [[0, 0, 0]]
            // colorFrom: 'symbol'
          }
        }
      ]
    })
  }
  return layout
}

export default layout2
