import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Card {
  constructor (container) {
    this.image = SvgHelper.createElement('image')
    this.pattern = SvgHelper.createElement('pattern', this.image)
    this.defs = SvgHelper.createElement('defs', this.pattern)

    this.rect1 = SvgHelper.createElement('rect')
    this.rect2 = SvgHelper.createElement('rect')

    this.svg = SvgHelper.createElement('svg', this.defs, this.rect1, this.rect2)

    SvgHelper.setAttributeValues(this.pattern, {
      id: 'watermark',
      patternUnits: 'userSpaceOnUse',
      width: '100%',
      height: '100%'
    })

    SvgHelper.setAttributeValues(this.image, {
      href: 'https://storage.googleapis.com/wzdev/logomaker/watermark.png',
      width: '100%',
      height: '100%',
      x: 0,
      y: 0
    })

    AMCore.childCheck(container, this.svg)
  }

  update (width, height, shapeData) {
    if (!width || !height) {
      return
    }

    SvgHelper.setAttributeValues(this.svg, {
      width: width + 'px',
      height: height + 'px'
    })

    SvgHelper.setAttributeValues(this.rect1, {
      // fill: AMCore.colorToStyle(shapeData.colors[0]),
      fill: 'none',
      fillOpacity: 1,
      width: '100%',
      eight: '100%',
      x: 0,
      y: 0
    })

    SvgHelper.setAttributeValues(this.rect2, {
      // fill: 'url(#watermark)',
      fill: 'none',
      fillOpacity: 1,
      width: '100%',
      eight: '100%',
      x: 0,
      y: 0
    })
  }
}

export default Card
