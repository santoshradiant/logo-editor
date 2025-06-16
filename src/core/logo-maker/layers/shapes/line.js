import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Line {
  constructor (container) {
    this.g = SvgHelper.createElement('g')
    AMCore.childCheck(container, this.g)
    this.rect = undefined
  }

  update (width, height, data) {
    if (!width || !height || width < 0 || height < 0) {
      AMCore.removeChildCheck(this.rect)
      this.rect = undefined
      return
    } else {
      if (!this.rect) {
        this.rect = SvgHelper.createElement('rect')
        AMCore.childCheck(this.g, this.rect)
      }
    }

    const lineWidth = Math.max(data.width, width) || width
    const dw = (data.thickness ? data.thickness : 0.05) * height
    const ofs = (data.offset ? data.offset : 0.05) * width

    const hh = height / 2

    SvgHelper.setAttributeValues(this.rect, {
      fill: AMCore.colorToStyle(data.colors[0]),
      stroke: 'none',
      x: ofs,
      y: hh - dw,
      width: lineWidth - 2 * ofs,
      height: dw * 2
    })
  }
}

export default Line
