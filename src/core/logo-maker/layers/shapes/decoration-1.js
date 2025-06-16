import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Rect from './rect'

class Decoration1 extends Rect {
  update (width, height, data, options) {
    if (!width || !height) {
      return
    }

    const dist = 2 + Math.max(width, height) * 0.02
    const ofs = Math.min(width, height) * 0.1

    SvgHelper.setAttributeValues(this.rect1, {
      fill: AMCore.colorToStyle(data.colors[0]),
      x: -ofs - dist,
      y: -ofs - dist,
      width: width + ofs * 2 + dist * 2,
      height: height + ofs * 2 + dist * 2
    })

    SvgHelper.setAttributeValues(this.rect2, {
      fill: 'none',
      stroke: AMCore.colorToStyle(data.colors[0]),
      // 'vector-effect': 'non-scaling-stroke',
      'stroke-width': Math.round(dist / 2),
      x: -ofs - dist * 2,
      y: -ofs - dist * 2,
      width: width + ofs * 2 + dist * 4,
      height: height + ofs * 2 + dist * 4
    })
  }
}

export default Decoration1
