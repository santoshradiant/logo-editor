import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Rect from './rect'

class Decoration5 extends Rect {
  update (width, height, shapeData) {
    if (!width || !height) {
      return
    }

    SvgHelper.setAttributeValues(this.rect1, {
      fill: 'none',
      stroke: AMCore.colorToStyle(shapeData.colors[0]),
      // 'vector-effect': 'non-scaling-stroke',
      'stroke-width': 3,
      x: -20,
      y: -20,
      width: width + 32,
      height: height + 32
    })

    SvgHelper.setAttributeValues(this.rect2, {
      fill: 'none',
      stroke: AMCore.colorToStyle(shapeData.colors[0]),
      // 'vector-effect': 'non-scaling-stroke',
      'stroke-width': 3,
      x: -12,
      y: -12,
      width: width + 32,
      height: height + 32
    })
  }
}

export default Decoration5
