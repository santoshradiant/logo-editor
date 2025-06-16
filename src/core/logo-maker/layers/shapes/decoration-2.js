import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Rect from './rect'

class Decoration2 extends Rect {
  update (width, height, data, options) {
    if (!width || !height) {
      return
    }

    const offset = height * 0.25

    SvgHelper.setAttributeValues(this.rect1, {
      fill: AMCore.colorToStyle(data.colors[0]),
      x: offset * -1,
      y: offset * -1,
      width: width + 2 * offset,
      height: 2
    })

    SvgHelper.setAttributeValues(this.rect2, {
      fill: AMCore.colorToStyle(data.colors[0]),
      x: offset * -1,
      y: height + offset,
      width: width + 2 * offset,
      height: 2
    })
  }
}

export default Decoration2
