import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Rect {
  constructor (container) {
    this.rect1 = SvgHelper.createElement('rect')
    this.rect2 = SvgHelper.createElement('rect')
    this.g = SvgHelper.createElement('g', this.rect1, this.rect2)

    AMCore.childCheck(container, this.g)
  }

  update (width, height, data) {
    if ((!width && !data.width) || !height || !data.colors) {
      return
    }

    const offsetX = data.offsetX || data.offset || 0
    const offsetY = data.offsetY || data.offset || 0

    SvgHelper.setAttributeValues(this.rect1, {
      fill: 'none',
      width: width + offsetX * 2,
      height: height + offsetY * 2
    })

    const showBorder = data.colors.length > 1
    SvgHelper.setAttributeValues(this.rect2, {
      fill: data.colors ? AMCore.colorToStyle(data.colors[0]) : 'white',
      'stroke-width': showBorder ? data.strokeWidth || 2.0 : 0.0,
      stroke: showBorder ? AMCore.colorToStyle(data.colors[1]) : 'black',
      x: 0 - offsetX,
      y: 0 - offsetY,
      width: width + offsetX * 2,
      height: height + offsetY * 2
    })
  }
}

export default Rect
