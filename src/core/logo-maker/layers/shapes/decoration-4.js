import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Rect from './rect'

class Decoration4 extends Rect {
  update (width, height, shapeData) {
    if (!width || !height) {
      return
    }

    const offset = 10

    SvgHelper.setAttributeValues(this.rect1, {
      fill: AMCore.colorToStyle(shapeData.colors[0]),
      x: offset * -1,
      y: offset * -1,
      width: width + 2 * offset,
      height: height + 2 * offset
    })

    SvgHelper.setAttributeValues(this.rect2, {
      fill: AMCore.colorToStyle(shapeData.colors[0]),
      opacity: 0.5,
      x: offset * -1 + offset / 1.5,
      y: offset * -1 + offset / 1.5,
      width: width + 2 * offset,
      height: height + 2 * offset
    })
  }
}

export default Decoration4
