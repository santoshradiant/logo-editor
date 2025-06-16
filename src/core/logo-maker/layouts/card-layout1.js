import AMCore from '../amcore'

// This method is called as being a method in the card-layout class
function layout1 () {
  return AMCore.clone({
    type: 'group',
    tag: 'card-root',
    position: {
      left: 0.0,
      top: 0.0,
      width: 1.0,
      height: 0.65
    },
    layers: [
      {
        type: 'shape',
        tag: 'card',
        position: {
          width: 1.0,
          height: 0.65
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
          height: 0.65,
          width: 0.5
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
                  width: 0.5,
                  height: 0.5
                },
                content: this.getLogoLayers()
              }
            ]
            : [])
        ]
      },
      {
        type: 'group',
        tag: 'card-address-group',
        position: {
          left: 0.5,
          width: 0.5,
          height: 0.65,
          top: 0.0
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
                  width: 0.75,
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

export default layout1
