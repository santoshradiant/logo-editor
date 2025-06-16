import AMCore from '../amcore'

function layout1p () {
  return AMCore.clone({
    type: 'group',
    tag: 'card-root',
    position: {
      left: 0.0,
      top: 0.0,
      width: 0.65,
      height: 1.0
    },
    layers: [
      {
        type: 'shape',
        tag: 'card',
        position: {
          width: 0.65,
          height: 1.0
        },
        shape: {
          name: 'rect',
          offset: 0,
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
          height: 0.35,
          width: 0.65
        },
        layers: [
          {
            type: 'image',
            tag: 'logo-image',
            position: {
              top: 0,
              left: 0,
              height: 1.0
            },
            linkedToParent: 'around',
            linkStyle: 'around'
          },
          ...(!this.logoInstance.getInverseShapeActive() && this.showSymbol
            ? [
              {
                type: 'shape',
                tag: 'card',
                position: {},
                shape: {
                  name: 'rect',
                  colors: [[255, 255, 255, 0.7]]
                },
                linkedToParent: 'around',
                linkStyle: 'around'
              }
            ]
            : []),
          ...(this.showSymbol
            ? [
              {
                type: 'contain',
                tag: 'card-brand',
                position: {
                  smartTop: 0.5,
                  smartLeft: 0.5,
                  width: 0.45,
                  height: 0.4
                },
                content: this.getLogoLayers()
                  // layers: [this.decoration.getLayout()]
              }
            ]
            : [])
        ]
      },
      {
        type: 'group',
        tag: 'card-address-group',
        position: {
          left: 0.0,
          width: 0.65,
          height: 0.65,
          top: 0.35
        },
        layers: [
          {
            type: 'shape',
            tag: 'decoration',
            position: {},
            shape: {
              name: 'rect',
              colors: this.colorMode === 'black' ? [[0, 0, 0]] : [[255, 255, 255]],
              colorFrom:
                this.logoInstance.getInverseShapeActive() && this.colorMode === 'logo' ? 'decoration' : undefined
            },
            linkedToParent: 'around',
            linkStyle: 'around'
          },
          {
            type: 'group',
            tag: 'card-address-group',
            position: {
              left: 0.125,
              width: 0.75,
              height: 0.96,
              top: 0.02
            },
            layers: [
              {
                type: 'contain',
                tag: 'card-text',
                position: {
                  smartLeft: this.getSmartLeft(),
                  smartTop: 0.5,
                  width: 0.8,
                  height: 0.8
                },
                content: this.getCardLines()
              }
            ]
          }
        ]
      }
    ]
  })
}

export default layout1p
