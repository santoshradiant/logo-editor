import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Rect from './rect'

class WrapDecoration1 extends Rect {
  update (width, height, shapeData) {
    if (!width || !height) {
      return
    }

    SvgHelper.setAttributeValues(this.svg, {
      width: width + 'px',
      height: height + 'px'
    })

    SvgHelper.setAttributeValues(this.rect1, {
      fill: 'none',
      stroke: AMCore.colorToStyle(shapeData.colors[0]),
      // 'vector-effect': 'non-scaling-stroke',
      'stroke-width': 3,
      x: -25,
      y: -25,
      width: width + 40,
      height: height + 40
    })

    SvgHelper.setAttributeValues(this.rect2, {
      fill: 'none',
      stroke: AMCore.colorToStyle(shapeData.colors[0]),
      // 'vector-effect': 'non-scaling-stroke',
      'stroke-width': 3,
      x: -15,
      y: -15,
      width: width + 40,
      height: height + 40
    })
  }
}

export default WrapDecoration1
