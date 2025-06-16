import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Ellipse {
  constructor (container) {
    this.ellipse1 = SvgHelper.createElement('ellipse')
    this.ellipse2 = SvgHelper.createElement('ellipse')
    this.svg = SvgHelper.createElement('g', this.ellipse1, this.ellipse2)

    AMCore.childCheck(container, this.svg)
  }

  update (width, height, data) {
    if (!width || !height) {
      return
    }

    const halfWidth = width / 2
    const halfHeight = height / 2
    const b = Math.pow(width * height, 0.33) * 20
    const offset = b / 50

    SvgHelper.setAttributeValues(this.svg, {
      width: width + 'px',
      height: height + 'px'
    })

    SvgHelper.setAttributeValues(this.ellipse1, {
      fill: AMCore.colorToStyle(data.colors[0]),
      cx: halfWidth,
      cy: halfHeight,
      rx: halfWidth,
      ry: halfHeight
    })

    SvgHelper.setAttributeValues(this.ellipse2, {
      fill: AMCore.colorToStyle(data.colors[0]),
      cx: halfWidth,
      cy: halfHeight,
      rx: halfWidth - offset,
      ry: halfHeight - offset
    })
  }
}

export default Ellipse
