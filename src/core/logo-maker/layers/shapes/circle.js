import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Circle {
  constructor (container, data, options) {
    this.options = options
    this.circle = SvgHelper.createElement('circle')
    this.g = SvgHelper.createElement('g', this.circle)

    AMCore.childCheck(container, this.g)
  }

  update (width, height, data) {
    if (!width || !height) {
      return
    }

    const hw = width / 2.0
    const hh = height / 2.0
    const radius = Math.sqrt(hw * hw + hh * hh)
    const margin = Math.max(width, height) * 0.25
    const offset = 0.5 * margin
    const hoffset = 0.5 * offset

    let inverse = false
    let strokeWidth = 2

    inverse = data.inverse
    strokeWidth = data.strokeWidth

    const isCrossing = data.borderStyle === 'crossing'
    if (['double', 'crossing'].indexOf(data.borderStyle) !== -1) {
      this.circle2 = this.circle2 || SvgHelper.createElement('circle')
      SvgHelper.setAttributeValues(this.circle2, {
        fill: 'none',
        stroke: AMCore.colorToStyle(data.colors[0]),
        'stroke-width': strokeWidth,
        cx: hw + hoffset * isCrossing,
        cy: hh + hoffset * isCrossing,
        r: radius + margin + offset * !isCrossing
      })

      this.g.appendChild(this.circle2)
    } else {
      if (this.circle2) {
        if (this.circle2.parentElement) {
          this.g.removeChild(this.circle2)
        }
      }
    }

    // console.log('Circle: ', data)
    SvgHelper.setAttributeValues(this.circle, {
      fill: inverse ? AMCore.colorToStyle(data.colors[0]) : 'none',
      stroke: inverse ? 'none' : AMCore.colorToStyle(data.colors[0]),
      'stroke-width': strokeWidth,
      cx: hw - hoffset * (isCrossing && !inverse),
      cy: hh - hoffset * (isCrossing && !inverse),
      r: radius + margin
    })
  }
}

export default Circle
