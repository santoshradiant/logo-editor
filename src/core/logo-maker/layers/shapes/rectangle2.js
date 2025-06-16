import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import PhysicalShapeBase from './physical-shape-base'

class Rectangle extends PhysicalShapeBase {
  constructor (container, data, options, layer) {
    super(container, data, options, layer)

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

    const inverse = data.inverse
    const marginUnit = Math.sqrt(width * width + height * height) / 6
    const strokeWidth = (AMCore.floatOrDef(data, 'strokeWidth', 1.0) * marginUnit) / 15
    const strokeDistance = AMCore.floatOrDef(data, 'strokeDistance', 1.0)
    const borderColor =
      strokeDistance * marginUnit < strokeWidth * 0.5
        ? AMCore.colorToStyle(data.colors[1])
        : AMCore.colorToStyle(data.colors[0])

    let borderRadius = AMCore.floatOrDef(data, 'borderRadius', 1.0) * marginUnit

    const doubleBorder = data.borderStyle === 'double'
    // const margin = (((doubleBorder || data.inverse) && strokeDistance) ? (marginUnit * strokeDistance) : 0) + strokeWidth * 0.5
    const margin = marginUnit * strokeDistance
    const hasBorderLines =
      ['topbottom', 'leftright', 'bottom', 'topleftbottomright', 'bottomlefttopright'].indexOf(data.borderStyle) !== -1
    let margin1 = marginUnit + (margin < 0 ? -margin : 0)
    let margin2 = marginUnit + (margin > 0 ? margin * 0.5 : 0)
    const marginDiff = margin2 - margin1

    if (!inverse && hasBorderLines) {
      if (strokeDistance < 0) {
        margin2 = margin1
      }
      margin1 = 0
    }

    let margin1b = margin1
    if (inverse && hasBorderLines) {
      if (strokeDistance < 0) {
        margin1b -= borderRadius
      }
    }

    if (marginDiff < 0) {
      borderRadius += marginDiff
      if (borderRadius > 0) {
        borderRadius += strokeWidth * 0.5
      }
      // if (inverse || ['none', 'double'].indexOf(data.borderStyle) !== -1) {
      // }
    }

    if (inverse || ['none', 'single', 'double'].indexOf(data.borderStyle) !== -1) {
      SvgHelper.setAttributeValues(this.rect1, {
        fill: inverse ? AMCore.colorToStyle(data.colors[0]) : 'none',
        stroke: inverse ? 'none' : AMCore.colorToStyle(data.colors[0]),
        'stroke-width': strokeWidth,
        width: width + margin1 * 2,
        height: height + margin1 * 2,
        x: -margin1,
        y: -margin1,
        rx: Math.max(0, borderRadius - marginDiff)
      })
      this.g.appendChild(this.rect1)
    } else {
      if (this.rect1) {
        if (this.rect1.parentElement) {
          this.g.removeChild(this.rect1)
        }
      }
    }

    if (doubleBorder) {
      // ['double', 'crossing'].indexOf(data.borderStyle) !== -1) {
      this.rect2 = this.rect2 || SvgHelper.createElement('rect')
      SvgHelper.setAttributeValues(this.rect2, {
        fill: 'none',
        stroke: borderColor, // AMCore.colorToStyle(data.colors[0]),
        'stroke-width': strokeWidth,
        width: width + margin2 * 2,
        height: height + margin2 * 2,
        x: -margin2,
        y: -margin2,
        rx: Math.max(0, borderRadius)
      })

      this.g.appendChild(this.rect2)
    } else {
      if (this.rect2) {
        if (this.rect2.parentElement) {
          this.g.removeChild(this.rect2)
        }
      }
    }

    if (hasBorderLines) {
      const m1 = margin1b
      const m2 = margin2
      // console.log('m2', m2)
      // const hs = strokeWidth / 2
      const cornerLen = (Math.min(width, height) + margin) * 0.33
      this.borderPath = this.borderPath || SvgHelper.createElement('path')
      const pathData = {
        topbottom: _ => `M${-m1},${-m2} h ${width + m1 * 2} M${-m1},${height + m2} h ${width + m1 * 2} `,
        bottom: _ => `M${-m1},${height + m2} h ${width + m1 * 2} z`,
        leftright: _ => `M${-m2},${-m1} v ${height + m1 * 2} M${width + m2},${-m1} v ${height + m1 * 2} `,
        topleftbottomright: _ => {
          return `M${-m2 + cornerLen},${-m2} h ${-cornerLen} v ${cornerLen} M${width + m2 - cornerLen},${height +
            m2} h ${cornerLen} v ${-cornerLen}`
        },
        bottomlefttopright: _ => {
          return `M${-m2 + cornerLen},${m2 + height} h ${-cornerLen} v ${-cornerLen} M${width +
            m2 -
            cornerLen},${-m2} h ${cornerLen} v ${cornerLen}`
        }
      }

      SvgHelper.setAttributeValues(this.borderPath, {
        d: pathData[data.borderStyle](),
        fill: 'none',
        stroke: borderColor, // AMCore.colorToStyle(data.colors[0]),
        'stroke-width': strokeWidth //
        // 'stroke-linecap': 'round'
      })

      this.g.appendChild(this.borderPath)
    } else {
      if (this.borderPath) {
        if (this.borderPath.parentElement) {
          this.g.removeChild(this.borderPath)
        }
      }
    }
  }
}

export default Rectangle
