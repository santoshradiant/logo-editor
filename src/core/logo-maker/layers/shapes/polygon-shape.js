import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import PhysicalShapeBase from './physical-shape-base'
import Math2 from '../../vector-math/math2.js'
import Shape from '../../vector-math/shape'

function svgAttr (el, name, value) {
  for (let i = 1; i < arguments.length; i += 2) {
    el.setAttributeNS(null, arguments[i], arguments[i + 1])
  }
}

const circleBezierFactor = 0.551915024494 // Works for 90 degree angles, this is a factor for interpolating control points between start/end and intersection point
function coordToPath (pt, xo, yo) {
  if (!isFinite(pt.x) || !isFinite(pt.y)) {
    console.error('coordinate error!', pt)
  }
  return (pt.x + (xo || 0)).toFixed(2) + ',' + (pt.y + (yo || 0)).toFixed(2) + ' '
}

// function getAngleDiff (a, b) {
//   // let res = (b - a + Math2.TAU) % Math2.TAU
//   // if (res > Math.PI) {
//   //   res -= Math2.TAU
//   // }
//   return (b - a + Math2.TAU + Math.PI) % Math2.TAU - Math.PI
// }

class Polygon2 extends PhysicalShapeBase {
  constructor (container, data, options, layer) {
    super(container, data, options, layer)

    this.path1 = SvgHelper.createElement('path')
    this.path2 = SvgHelper.createElement('path')
    this.group = SvgHelper.createElement('g', this.path1, this.path2)

    this.cornerCount = options.cornerCount || 6

    this.points1 = []
    this.points2 = []

    this.lastw = 0
    this.lasth = 0
    this.lastso = 0
    this.lastcr = 0
    this.lastoeo = 0
    this.lastlo = 0

    AMCore.childCheck(container, this.group)
  }

  makePointsArray () {
    const result = []

    for (let i = 0; i < this.cornerCount; i++) {
      result.push({
        x: 0,
        y: 0
      })
    }

    return result
  }

  buildPathStr (points, cornerOffset) {
    let pathStr = 'M'
    // const co = cornerOffset
    // const nco = 1.0 - cornerOffset
    for (let i = 0; i < this.cornerCount; i++) {
      const pt = points[i]
      const last = i === this.cornerCount - 1
      if (cornerOffset > 0.001) {
        const ppt = points[(i + this.cornerCount - 1) % this.cornerCount]
        const npt = points[(i + 1) % this.cornerCount]

        const maxControlLen =
          Math.min(
            Math2.distance2(
              {
                x: 0.5 * (ppt.x + pt.x),
                y: 0.5 * (ppt.y + pt.y)
              },
              pt
            ),
            Math2.distance2(
              {
                x: 0.5 * (npt.x + pt.x),
                y: 0.5 * (npt.y + pt.y)
              },
              pt
            )
          ) + 1000000

        const controlAngle = Math.PI / this.cornerCount
        const controlLen = Math.min(Math.atan(controlAngle) * cornerOffset, maxControlLen)
        const startPoint = Math2.getPointOnLine(pt, ppt, controlLen)
        const endPoint = Math2.getPointOnLine(pt, npt, controlLen)

        const startControl = Math2.getPointOnLineFract(pt, startPoint, 1.0 - circleBezierFactor)
        const endControl = Math2.getPointOnLineFract(pt, endPoint, 1.0 - circleBezierFactor)
        pathStr +=
          coordToPath(startPoint) +
          'C' +
          coordToPath(startControl) +
          coordToPath(endControl) +
          coordToPath(endPoint) +
          (last ? ' Z' : ' L')
      } else {
        pathStr += ' ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + (last ? ' Z' : ' L')
      }
    }
    return pathStr
  }

  update (w, h, data) {
    if (!w || !h) {
      return
    }

    const placement = this.updatePlacement()
    const shape = new Shape()

    const myRootOffset = this.layer.getRootOffset()
    const hullPolygon = this.getHull()
    if (hullPolygon && hullPolygon.basePoints.length > 2) {
      let hullCircle
      try {
        hullCircle = hullPolygon.getCircleAround(true)
      } catch (exc) {
        console.error('Error calculating circle', hullPolygon, exc)
      }
      if (!hullCircle) {
        return
      }

      const m = hullCircle.r * 2.0 // Math.max(w, h)
      const width = m * 1.35 // 1.8
      const height = m * 1.35 // 1.8
      const leftOfs = hullCircle.cx - myRootOffset.x // + w * 0.5
      const topOfs = hullCircle.cy - myRootOffset.y // + h * 0.5
      if (!width || !height) {
        return
      }
      const halfWidth = width / 2
      const halfHeight = height / 2

      // this.cornerCount = AMCore.intOrDef(data, 'cornerCount', 4)
      const startOffset = AMCore.floatOrDef(data, 'startOffset', 0)
      let oddEvenOffs = -AMCore.floatOrDef(data, 'oddEvenOffs', 0.0)
      const inverse = data.inverse
      if (this.cornerCount < 8) {
        oddEvenOffs = 0
      }

      const marginUnit = Math.sqrt(width * width + height * height) / ((this.cornerCount - 2) * 4.0)
      const borderRadius = AMCore.floatOrDef(data, 'borderRadius', 1.0) * marginUnit
      const strokeDistance = AMCore.floatOrDef(data, 'strokeDistance', 1.0)
      const strokeWidth = (AMCore.floatOrDef(data, 'strokeWidth', 1.0) * marginUnit) / 15
      const borderColor =
        strokeDistance * marginUnit < strokeWidth * 0.5
          ? AMCore.colorToStyle(data.colors[1])
          : AMCore.colorToStyle(data.colors[0])
      const doubleBorder = data.borderStyle === 'double'
      const margin = ((doubleBorder || data.inverse) && strokeDistance ? marginUnit * strokeDistance : 0) + strokeWidth
      const margin1 = marginUnit + (margin < 0 ? -margin : 0)
      const margin2 = marginUnit + (margin > 0 ? margin * 0.5 : 0)

      if (Math.abs(oddEvenOffs) > 0.0001) {
        this.cornerCount = Math.floor((this.cornerCount + 1) / 2) * 2
      }

      const step = (Math.PI / this.cornerCount) * 2
      // var stepOffs = 0.5 * step * Math.floor(Math.random() + .5);
      const stepOffs = startOffset * step

      let xr = halfWidth
      let xy = halfHeight
      let mx = width
      let my = height

      const calcPoints = () => {
        for (let i = 0; i < this.cornerCount; i++) {
          const pt1 = this.points1[i]
          const pt2 = this.points2[i]
          const fact = oddEvenOffs ? 1.0 - oddEvenOffs * Math.round((i + 1) % 2) : 1.0

          const sn = +Math.sin(stepOffs + step * i)
          const cs = -Math.cos(stepOffs + step * i)

          pt1.x = sn * (xr * fact + margin1)
          pt1.y = cs * (xy * fact + margin1)
          pt2.x = sn * (xr * fact + margin2)
          pt2.y = cs * (xy * fact + margin2)
          if (pt1.x < mx) mx = pt1.x
          if (pt1.y < my) my = pt1.y
        }
      }

      if (
        this.lastw !== width ||
        this.lasth !== height ||
        this.points1.length !== this.cornerCount ||
        this.lastso !== startOffset ||
        this.lastcr !== borderRadius ||
        this.lastlo !== strokeDistance ||
        this.lastoeo !== oddEvenOffs
      ) {
        this.lastw = width
        this.lasth = height
        this.lastso = startOffset
        this.lastcr = borderRadius
        this.lastlo = strokeDistance
        this.lastoeo = oddEvenOffs

        if (this.points1.length !== this.cornerCount) {
          this.points1 = this.makePointsArray()
          this.points2 = this.makePointsArray()
        }

        calcPoints()

        if (mx > 1 || my > 1) {
          xr *= xr / (xr - mx)
          xy *= xy / (xy - my)
          calcPoints()
        }

        svgAttr(this.path1, 'd', this.buildPathStr(this.points1, borderRadius))
        svgAttr(this.path2, 'd', this.buildPathStr(this.points2, borderRadius + (margin2 - margin1)))
      }

      svgAttr(this.group, 'transform', `translate(${leftOfs},${topOfs})`)
      if (inverse) {
        svgAttr(this.path1, 'fill', AMCore.colorToStyle(data.colors[0]))
      } else {
        svgAttr(this.path1, 'fill', 'none', 'stroke', AMCore.colorToStyle(data.colors[0]), 'stroke-width', strokeWidth)
      }
      svgAttr(this.path2, 'fill', 'none', 'stroke', borderColor, 'stroke-width', strokeWidth)

      if (doubleBorder) {
        this.group.appendChild(this.path2)
      } else {
        if (this.path2) {
          if (this.path2.parentElement) {
            this.group.removeChild(this.path2)
          }
        }
      }

      shape.addPoints(this.points1)
      shape.addPoints(this.points2)
      placement.addShape(shape)
      if (data.dotRatio > 0.0) {
        let tl = 0
        try {
          tl = this.path2?.getTotalLength?.()
        } catch (error) {
          tl = 0
        }
        svgAttr(
          this.path2,
          'stroke-linecap',
          'round',
          'stroke-dasharray',
          '0 ' + tl / Math.round(tl / data.dotRatio / strokeWidth)
        )
      } else {
        svgAttr(this.path2, 'stroke-linecap', null, 'stroke-dasharray', null)
      }
    }
  }
}

export default Polygon2
