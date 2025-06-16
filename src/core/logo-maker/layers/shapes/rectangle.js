import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Rectangle {
  constructor (container, data, options) {
    this.options = options
    this.rect1 = SvgHelper.createElement('rect')
    this.rect2 = undefined
    this.borders = []
    this.g = SvgHelper.createElement('g', this.rect1)

    AMCore.childCheck(container, this.g)
  }

  update (width, height, data) {
    if (!width || !height) {
      return
    }

    const margin = Math.max(width, height) * 0.33
    const offset = 0.33 * margin

    const hmargin = 0.5 * margin
    const hoffset = 0.5 * offset

    let inverse = false
    let strokeWidth = 2

    inverse = data.inverse
    strokeWidth = data.strokeWidth

    const isShadow = data.borderStyle === 'shadow'
    if (isShadow) {
      this.shadowPath = this.shadowPath || SvgHelper.createElement('path')
      SvgHelper.setAttributeValues(this.shadowPath, {
        d: `M ${width + hmargin},${-hmargin + hoffset} h ${hoffset} v ${height + margin} h ${-width -
          margin} v ${-hoffset} h ${width + margin - hoffset} Z`,
        fill: AMCore.colorToStyle(data.colors[0]),
        opacity: 0.5,
        stroke: 'none'
      })
      this.g.appendChild(this.shadowPath)
    } else {
      if (this.shadowPath) {
        if (this.shadowPath.parentElement) {
          this.g.removeChild(this.shadowPath)
        }
      }
    }
    // 'topbottom', 'leftright', 'topleftbottomright', 'bottomlefttopright'

    const isCrossing = data.borderStyle === 'crossing'
    if (['double', 'crossing'].indexOf(data.borderStyle) !== -1) {
      this.rect2 = this.rect2 || SvgHelper.createElement('rect')
      SvgHelper.setAttributeValues(this.rect2, {
        fill: isShadow ? AMCore.colorToStyle(data.colors[0]) : 'none',
        stroke: isShadow ? 'none' : AMCore.colorToStyle(data.colors[0]),
        opacity: isShadow ? 0.5 : 1.0,
        'stroke-width': strokeWidth,
        width: width + margin + offset * (1 - isCrossing),
        height: height + margin + offset * (1 - isCrossing),
        x: 0 - hmargin - hoffset * (1 - isCrossing * 1.5),
        y: 0 - hmargin - hoffset * (1 - isCrossing * 1.5)
      })

      this.g.appendChild(this.rect2)
    } else {
      if (this.rect2) {
        if (this.rect2.parentElement) {
          this.g.removeChild(this.rect2)
        }
      }
    }

    let showOriginalRect = true
    if (
      ['topbottom', 'leftright', 'bottom', 'topleftbottomright', 'bottomlefttopright'].indexOf(data.borderStyle) !== -1
    ) {
      let m = margin
      let hm = m * 0.5
      const cornerLen = (Math.min(width, height) + margin) * 0.33
      this.borderPath = this.borderPath || SvgHelper.createElement('path')
      const pathData = {
        topbottom: _ =>
          `M${-hm},${-hm - hoffset * inverse} h ${width + m} z M${-hm},${height + hm + hoffset * inverse} h ${width +
            m} z `,
        bottom: _ =>
          `M${-hm - 0.5 * strokeWidth * !inverse},${height + hm + hoffset} h ${width + m + strokeWidth * !inverse} z`,
        leftright: _ =>
          `M${-hm - hoffset * inverse},${-hm} v ${height + m} z M${width + hm + hoffset * inverse},${-hm} v ${height +
            m} z `,
        topleftbottomright: _ => {
          if (inverse) {
            m = margin + offset
            hm = m * 0.5
          }
          return `M${-hm + cornerLen},${-hm} h ${-cornerLen} v ${cornerLen} M${width + hm - cornerLen},${height +
            hm} h ${cornerLen} v ${-cornerLen}`
        },
        bottomlefttopright: _ => {
          if (inverse) {
            m = margin + offset
            hm = m * 0.5
          }
          return `M${-hm + cornerLen},${height + hm} h ${-cornerLen} v ${-cornerLen} M${width +
            hm -
            cornerLen},${-hm} h ${cornerLen} v ${cornerLen}`
        }
      }

      SvgHelper.setAttributeValues(this.borderPath, {
        d: pathData[data.borderStyle](),
        fill: 'none',
        stroke: AMCore.colorToStyle(data.colors[0]),
        'stroke-width': strokeWidth
      })

      this.g.appendChild(this.borderPath)
      showOriginalRect = inverse || data.borderStyle === 'bottom'
    } else {
      if (this.borderPath) {
        if (this.borderPath.parentElement) {
          this.g.removeChild(this.borderPath)
        }
      }
    }

    // console.log('Circle: ', data)
    if (showOriginalRect) {
      SvgHelper.setAttributeValues(this.rect1, {
        fill: inverse ? AMCore.colorToStyle(data.colors[0]) : 'none',
        stroke: inverse ? 'none' : AMCore.colorToStyle(data.colors[0]),
        'stroke-width': strokeWidth,
        width: width + margin,
        height: height + margin,
        x: 0 - hmargin - hoffset * 0.5 * (isCrossing && !inverse),
        y: 0 - hmargin - hoffset * 0.5 * (isCrossing && !inverse)
      })
      this.g.appendChild(this.rect1)
    } else {
      if (this.rect1) {
        if (this.rect1.parentElement) {
          this.g.removeChild(this.rect1)
        }
      }
    }
  }
}

export default Rectangle
