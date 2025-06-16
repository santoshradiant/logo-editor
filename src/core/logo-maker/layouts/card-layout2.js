import AMCore from '../amcore'

function layout2 () {
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
          height: 0.2,
          width: 1.0
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
                tag: 'wrong',
                position: {
                  smartTop: 0.5,
                  smartLeft: 0.5,
                  height: 0.8
                },
                content: [this.getLogoLayers()]
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
          width: 1.0,
          height: 0.45,
          top: 0.2
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
              left: 0.05,
              width: 0.4,
              height: 0.96,
              top: 0.02
            },
            layers: [
              {
                type: 'contain',
                tag: 'card-text',
                position: {
                  smartLeft: 1.0 - this.getSmartLeft(),
                  top: 0.05,
                  width: 1.0,
                  height: 0.8
                },
                content: this.getCardLines(2, true)
              }
            ]
          },
          {
            type: 'group',
            tag: 'card-address-group',
            position: {
              left: 0.55,
              width: 0.4,
              height: 0.96,
              top: 0.02
            },
            layers: [
              {
                type: 'contain',
                tag: 'card-text',
                position: {
                  smartLeft: this.getSmartLeft(),
                  top: 0.05,
                  width: 1.0,
                  height: 0.8
                },
                content: this.getCardLines(1)
              }
            ]
          }
        ]
      }
    ]
  })
}

export default layout2
