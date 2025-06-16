import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

function svgAttr (el, name, value) {
  for (let i = 1; i < arguments.length; i += 2) {
    el.setAttributeNS(null, arguments[i], arguments[i + 1])
  }
}

class MultiPolygon {
  constructor (container) {
    this.group = SvgHelper.createElement('g')

    AMCore.childCheck(container, this.group)
  }

  makePointsArray (count) {
    const result = new Array(count)

    for (let i = 0; i < count; i++) {
      result[i] = {
        x: 0,
        y: 0
      }
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

    const cornerCount1 = AMCore.intOrDef(data, 'cornerCount1', 6)
    const startOffset1 = AMCore.floatOrDef(data, 'startOffset1', 0)
    const oddEvenOffs1 = -AMCore.floatOrDef(data, 'oddEvenOffs1', 0.0)
    const cornerRadius1 = AMCore.floatOrDef(data, 'cornerRadius1', 0.1)

    // let cornerCount2 = AMCore.intOrDef(data, 'cornerCount2', 6)
    const startOffset2 = AMCore.floatOrDef(data, 'startOffset2', 0)
    const oddEvenOffs2 = -AMCore.floatOrDef(data, 'oddEvenOffs2', 0.0)
    const cornerRadius2 = AMCore.floatOrDef(data, 'cornerRadius2', 0.1)

    const steps = AMCore.intOrDef(data, 'steps', 10)

    const cornerCountDelta = cornerCount1 - cornerCount1
    const startOffsetDelta = startOffset2 - startOffset1
    const oddEvenOffsDelta = oddEvenOffs2 - oddEvenOffs1
    const cornerRadiusDelta = cornerRadius2 - cornerRadius1

    const lineWidth = AMCore.floatOrDef(data, 'strokeWidth', 1.0)

    // var stepOffs = 0.5 * step * Math.floor(Math.random() + .5);

    let xr = halfWidth
    let xy = halfHeight
    let mx = width
    let my = height

    const calcPoints = (startOffset, cornerCount, oddEvenOffs) => {
      cornerCount = ~~cornerCount
      const step = (Math.PI / cornerCount) * 2
      const points = this.makePointsArray(cornerCount)
      const stepOffs = startOffset * step
      for (let i = 0; i < cornerCount; i++) {
        const pt = points[i]
        const fact = oddEvenOffs ? 1.0 - oddEvenOffs * Math.round((i + 1) % 2) : 1.0

        pt.x = +Math.sin(stepOffs + step * i) * xr * fact
        pt.y = -Math.cos(stepOffs + step * i) * xy * fact
        if (pt.x < mx) mx = pt.x
        if (pt.y < my) my = pt.y
      }
      return points
    }

    const buildPathStr = (points, cornerCount, cornerOffset) => {
      cornerCount = ~~cornerCount
      let pathStr = 'M'
      const co = cornerOffset
      const nco = 1.0 - cornerOffset
      for (let i = 0; i < cornerCount; i++) {
        const pt = points[i]
        const last = i === cornerCount - 1
        if (cornerOffset > 0.001) {
          const ppt = points[(i + cornerCount - 1) % cornerCount]
          const npt = points[(i + 1) % cornerCount]

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

    if (mx > 1 || my > 1) {
      xr *= xr / (xr - mx)
      xy *= xy / (xy - my)
    }

    AMCore.removeAllChildren(this.group)
    for (let i = 0; i < steps; i++) {
      const progress = i / (steps - 1.0)
      const cornerCount = cornerCount1 + cornerCountDelta * progress
      const startOffset = startOffset1 + startOffsetDelta * progress
      const oddEvenOffs = oddEvenOffs1 + oddEvenOffsDelta * progress
      const cornerRadius = cornerRadius1 + cornerRadiusDelta * progress
      const points = calcPoints(startOffset, cornerCount, oddEvenOffs)
      const path = SvgHelper.createElement('path')
      let pathStr
      try {
        pathStr = buildPathStr(points, cornerCount, cornerRadius)
        svgAttr(path, 'd', pathStr)
      } catch (ex) {
        console.log('Exception:', pathStr, points)
      }
      svgAttr(path, 'fill', 'none', 'stroke', AMCore.colorToStyle(data.colors[0]), 'stroke-width', lineWidth)
      if (data.dotRatio > 0.0) {
        let tl = 0
        try {
          tl = path?.getTotalLength?.()
        } catch (error) {
          tl = 0
        }
        svgAttr(
          path,
          'stroke-linecap',
          'round',
          'stroke-dasharray',
          '0 ' + tl / Math.round(tl / data.dotRatio / lineWidth)
        )
      } else {
        svgAttr(path, 'stroke-linecap', null, 'stroke-dasharray', null)
      }
      AMCore.childCheck(this.group, path)
    }

    svgAttr(this.group, 'transform', `translate(${leftOfs},${topOfs})`)
  }
}

export default MultiPolygon
