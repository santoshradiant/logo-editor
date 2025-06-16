import AMCore from '../amcore'

function layout3p () {
  return AMCore.clone({
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
          colors: [[255, 255, 255]]
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
          autoWidth: true
        },
        layers: [
          {
            type: 'shape',
            tag: 'brand-background',
            position: {
              top: 0,
              left: 0,
              height: 1.0
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
            rotateContent: -90,
            position: {
              smartTop: 0.5,
              left: 0,
              width: 0.35,
              height: 0.65
            },
            content: [this.brand.getLayout()]
          }
        ]
      },
      {
        type: 'group',
        tag: 'card-address-group',
        position: {
          leftFrom: 'child(-1).right + 0.08',
          widthFrom: '1.0 - child(-1).right - 0.08',
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
              offset: 80,
              colors: [[255, 255, 255]]
            },
            linkedToParent: 'around',
            linkStyle: 'around'
          },
          {
            type: 'contain',
            tag: 'card-text',
            position: {
              smartLeft: this.getSmartLeft(),
              smartTop: this.getSmartLeft(),
              width: 1.0,
              height: 1.0
            },
            content: this.getCardLines()
          }
        ]
      }
    ]
  })
}

export default layout3p
