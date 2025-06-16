import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

function svgAttr (el, name, value) {
  for (let i = 1; i < arguments.length; i += 2) {
    el.setAttributeNS(null, arguments[i], arguments[i + 1])
  }
}

class Polygon {
  constructor (container) {
    this.path1 = SvgHelper.createElement('path')
    this.path2 = SvgHelper.createElement('path')
    this.group = SvgHelper.createElement('g', this.path1, this.path2)

    this.cornerCount = 6

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

  update (w, h, data) {
    const m = Math.max(w, h)
    const width = m * 1.8
    const height = m * 1.8
    const leftOfs = w * 0.5
    const topOfs = h * 0.5
    if (!width || !height) {
      return
    }
    const halfWidth = width / 2
    const halfHeight = height / 2
    // const b = Math.pow(width * height, 0.33) * 20

    this.cornerCount = AMCore.intOrDef(data, 'cornerCount', 6)
    const startOffset = AMCore.floatOrDef(data, 'startOffset', 0)
    let oddEvenOffs = -AMCore.floatOrDef(data, 'oddEvenOffs', 0.0)
    const inverse = data.inverse
    if (this.cornerCount < 8) {
      oddEvenOffs = 0
    }

    if (Math.abs(oddEvenOffs) > 0.0001) {
      this.cornerCount = Math.floor((this.cornerCount + 1) / 2) * 2
    }

    const cornerRadius = AMCore.floatOrDef(data, 'cornerRadius', 0.1)
    const lineOffset = AMCore.floatOrDef(data, 'lineOffset', -0.1)
    const lineWidth = AMCore.floatOrDef(data, 'strokeWidth', 1.0)

    const step = (Math.PI / this.cornerCount) * 2
    // var stepOffs = 0.5 * step * Math.floor(Math.random() + .5);
    const stepOffs = startOffset * step

    let xr = halfWidth
    let xy = halfHeight
    let mx = width
    let my = height

    const offs = -lineOffset * m * 0.025

    const calcPoints = () => {
      for (let i = 0; i < this.cornerCount; i++) {
        const pt1 = this.points1[i]
        const pt2 = this.points2[i]
        const fact = oddEvenOffs ? 1.0 - oddEvenOffs * Math.round((i + 1) % 2) : 1.0

        pt1.x = +Math.sin(stepOffs + step * i) * xr * fact
        pt1.y = -Math.cos(stepOffs + step * i) * xy * fact
        pt2.x = +Math.sin(stepOffs + step * i) * (xr * fact - offs)
        pt2.y = -Math.cos(stepOffs + step * i) * (xy * fact - offs)
        if (pt1.x < mx) mx = pt1.x
        if (pt1.y < my) my = pt1.y
      }
    }

    const buildPathStr = (points, cornerOffset) => {
      let pathStr = 'M'
      const co = cornerOffset
      const nco = 1.0 - cornerOffset
      for (let i = 0; i < this.cornerCount; i++) {
        const pt = points[i]
        const last = i === this.cornerCount - 1
        if (cornerOffset > 0.001) {
          const ppt = points[(i + this.cornerCount - 1) % this.cornerCount]
          const npt = points[(i + 1) % this.cornerCount]

          const x1 = ppt.x * co + pt.x * nco
          const y1 = ppt.y * co + pt.y * nco
          const x2 = npt.x * co + pt.x * nco
          const y2 = npt.y * co + pt.y * nco

          pathStr +=
            ' ' +
            x1.toFixed(2) +
            ' ' +
            y1.toFixed(2) +
            ' Q ' +
            pt.x.toFixed(2) +
            ' ' +
            pt.y.toFixed(2) +
            ' ' +
            x2.toFixed(2) +
            ' ' +
            y2.toFixed(2) +
            (last ? ' Z' : ' L')
        } else {
          pathStr += ' ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + (last ? ' Z' : ' L')
        }
      }
      return pathStr
    }

    if (
      this.lastw !== width ||
      this.lasth !== height ||
      this.points1.length !== this.cornerCount ||
      this.lastso !== startOffset ||
      this.lastcr !== cornerRadius ||
      this.lastlo !== lineOffset ||
      this.lastoeo !== oddEvenOffs
    ) {
      this.lastw = width
      this.lasth = height
      this.lastso = startOffset
      this.lastcr = cornerRadius
      this.lastlo = lineOffset
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

      svgAttr(this.path1, 'd', buildPathStr(this.points1, cornerRadius))
      svgAttr(this.path2, 'd', buildPathStr(this.points2, cornerRadius))
    }

    svgAttr(this.group, 'transform', `translate(${leftOfs},${topOfs})`)
    if (inverse) {
      svgAttr(this.path1, 'fill', AMCore.colorToStyle(data.colors[0]))
    } else {
      svgAttr(this.path1, 'fill', 'none', 'stroke', AMCore.colorToStyle(data.colors[0]), 'stroke-width', lineWidth)
    }
    svgAttr(this.path2, 'fill', 'none', 'stroke', AMCore.colorToStyle(data.colors[0]), 'stroke-width', lineWidth)

    if (data.borderStyle && data.borderStyle !== 'single') {
      this.group.appendChild(this.path2)
    } else {
      if (this.path2) {
        if (this.path2.parentElement) {
          this.group.removeChild(this.path2)
        }
      }
    }

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
        '0 ' + tl / Math.round(tl / data.dotRatio / lineWidth)
      )
    } else {
      svgAttr(this.path2, 'stroke-linecap', null, 'stroke-dasharray', null)
    }
  }
}

export default Polygon
