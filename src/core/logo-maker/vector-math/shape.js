/*
  Shape is a collection of polygons that are in the same coordinate space and can make holes in eachother
  it was build to be a holder for all svg vector geometry to be able to build physical margins
*/
import Math2 from './math2.js'
import Polygon from './polygon.js'
import StringParser from '../utils/string-parser.js'

// Also in font-glyph-loader, but to small to do a whole import for
const commandCoordsCount = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  Q: 4,
  T: 2,
  S: 4,
  Z: 0
}

class Shape {
  constructor () {
    this.polygons = []
    this.minX = 1000000
    this.minY = 1000000
    this.maxX = -1000000
    this.maxY = -1000000
  }

  toHullPathStr () {
    let pathStr = ''
    for (const polygon of this.polygons) {
      pathStr += polygon.toPathStr(polygon.getHull())
    }
    return pathStr
  }

  toPathStr () {
    let pathStr = ''
    for (const polygon of this.polygons) {
      pathStr += polygon.toPathStr()
    }
    return pathStr
  }

  toPathStr2 () {
    let pathStr = ''
    if (!this.polygons || this.polygons.length === 0) {
      return
    }
    // this.updateInsides()
    this.updateMargins(4)

    // This is a hack arround the not working isInside, but they need to be sorted anyway
    const polygons = this.polygons.sort((a, b) => a.minY - b.minY)
    const clockWise = polygons[0].isClockwise

    for (const polygon of polygons) {
      // FIXME isInside is not working if (!polygon.isInside) {
      if (polygon.isClockwise === clockWise) {
        pathStr += polygon.toPathStr()
      }
    }
    return pathStr
  }

  toPathStrsDotSeperate () {
    const pathStrs = []
    if (!this.polygons || this.polygons.length === 0) {
      return
    }
    // this.updateInsides()
    this.updateMargins(4)

    // This is a hack arround the not working isInside, but they need to be sorted anyway
    const polygons = this.polygons.sort((a, b) => a.minY - b.minY)
    // const clockWise = !polygons[0].isClockwise
    if (polygons.length && polygons[0].maxY > (this.maxY + this.minY) * 0.5) {
      return [this.toPathStr()]
    }

    for (const polygon of polygons) {
      // FIXME isInside is not working if (!polygon.isInside) {
      // if (polygon.isClockwise === clockWise) {
      if (polygon.isInside) {
        pathStrs[pathStrs.length - 1] += polygon.toPathStr()
      } else {
        pathStrs.push(polygon.toPathStr())
        // clockWise = !polygon.isClockwise
      }
    }
    return pathStrs
  }

  toSVGStr () {
    let pathStr = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${
      this.minX
    } ${this.minY} ${this.maxX - this.minX} ${this.maxY - this.minY}">`
    pathStr += '<path d="'
    for (const polygon of this.polygons) {
      // pathStr += `<path stroke="black" stroke-width="0.25" d="${polygon.toPathStr()}"></path>`
      // pathStr += polygon.toPathStr2() + (polygon.hullPathStr?polygon.hullPathStr:'')
      if (!polygon.isInside) {
        pathStr += polygon.toPathStr2() + (polygon.hullPathStr ? polygon.hullPathStr : '')
      }
    }
    pathStr += '"></path>'
    return pathStr + '</svg>'
  }

  addPolygon (polygon) {
    this.polygons.push(polygon)
    this.minX = Math.min(this.minX, polygon.minX)
    this.minY = Math.min(this.minY, polygon.minY)
    this.maxX = Math.max(this.maxX, polygon.maxX)
    this.maxY = Math.max(this.maxY, polygon.maxY)
  }

  hasData () {
    for (const polygon of this.polygons) {
      if (polygon.hasPoints()) {
        return true
      }
    }
    return false
  }

  // Add a SVG path string to be converted to vectors
  addPath (pathStr, pointConverter) {
    let point = {
      x: 0,
      y: 0
    }
    let control = point
    let polygon = new Polygon()
    const parser = new StringParser(pathStr)
    parser.skipWhiteSpace()

    const getPoint = (isRelative, relativePoint) => {
      relativePoint = relativePoint || point
      const x = parser.getFloat()
      if (x === '') return undefined
      parser.skipChar(',')
      const y = parser.getFloat()
      if (y === '') {
        // debugger
        console.error('Error reading SVG path')
        return undefined
      }
      const result = {
        x: Number.parseFloat(x),
        y: Number.parseFloat(y)
      }
      if (isRelative) {
        result.x += relativePoint.x
        result.y += relativePoint.y
      }
      point = result
      control = point
      return result
    }

    const getPoints = (count, isRelative) => {
      const points = []
      const start = point
      while (count-- > 0) {
        const newPoint = getPoint(isRelative, start)
        if (newPoint) {
          parser.skipChar(',')
          point = newPoint
          points.push(newPoint)
        } else {
          break
        }
      }
      return points
    }

    const flushPolygons = () => {
      if (polygon.hasPoints()) {
        this.addPolygon(polygon)
        polygon = new Polygon()
      }
    }

    const addPoint = pointConverter ? pt => polygon.addPoint(pointConverter(pt)) : pt => polygon.addPoint(pt)

    while (!parser.endOfString()) {
      const ch = parser.getNextChar()
      if (ch === undefined) {
        break
      }
      const isUpper = ch <= 'Z'
      const chUp = ch.toUpperCase()
      if (chUp === 'M' || chUp === 'L') {
        if (chUp === 'M') {
          flushPolygons()
        }
        while (!parser.endOfString()) {
          const newPoint = getPoint(!isUpper)
          if (newPoint) {
            addPoint(newPoint)
          } else {
            break
          }
        }
      } else if (chUp === 'Q' || chUp === 'T' || chUp === 'C' || chUp === 'S') {
        const cCount = commandCoordsCount[chUp] / ~~2
        while (!parser.endOfString()) {
          const start = point
          const startControl = control
          const newPoints = getPoints(cCount, !isUpper)
          if (newPoints.length >= cCount) {
            const step =
              1.0 /
              Math.round(
                Math2.length2({
                  x: newPoints[cCount - 1].x - start.x,
                  y: newPoints[cCount - 1].y - start.y
                }) / 2.0
              )
            if (chUp === 'T' || chUp === 'S') {
              newPoints.unshift(Math2.reflect2(start, startControl))
            }
            if (chUp === 'Q' || chUp === 'T') {
              for (let t = step / 2; t < 1.0; t += step) {
                addPoint({
                  x: Math2.quadraticBezier(t, start.x, newPoints[0].x, newPoints[1].x),
                  y: Math2.quadraticBezier(t, start.y, newPoints[0].y, newPoints[1].y)
                })
              }
              control = newPoints[0]
            } else {
              // C and S
              for (let t = step / 2; t < 1.0; t += step) {
                addPoint({
                  x: Math2.cubicBezier(t, start.x, newPoints[0].x, newPoints[1].x, newPoints[2].x),
                  y: Math2.cubicBezier(t, start.y, newPoints[0].y, newPoints[1].y, newPoints[2].y)
                })
              }
              control = newPoints[1]
            }
            addPoint(newPoints[newPoints.length - 1])
          } else {
            if (newPoints.length > 0) {
              // debugger
              console.error('Error reading SVG path')
            }
            break
          }
        }
      } else if (chUp === 'H') {
        while (!parser.endOfString()) {
          const x = parser.getFloat()
          if (x === '') break
          point = {
            x: (isUpper ? 0 : point.x) + Number.parseFloat(x),
            y: point.y
          }
          addPoint(point)
          control = point
        }
      } else if (chUp === 'V') {
        while (!parser.endOfString()) {
          const y = parser.getFloat()
          if (y === '') break
          point = {
            x: point.x,
            y: (isUpper ? 0 : point.y) + Number.parseFloat(y)
          }
          addPoint(point)
          control = point
        }
      } else if (chUp === 'A') {
        while (!parser.endOfString()) {
          parser.skipChar(',')
          const radiusX = parser.getFloat()
          if (!radiusX) {
            break
          }
          parser.skipChar(',')
          const radiusY = parser.getFloat()
          parser.skipChar(',')
          const xRotate = parser.getFloat()
          parser.skipChar(',')
          const arc = parser.getFloat()
          parser.skipChar(',')
          const sweep = parser.getFloat()
          parser.skipChar(',')
          const endPoint = getPoint(!isUpper)
          control = point
          this.addArc(radiusX, radiusY, xRotate, arc, sweep, endPoint)
        }
      } else if (chUp === 'Z') {
        flushPolygons()
      } else {
        // debugger
        console.error('Error reading SVG path')
        parser.ix++
      }
    }
    flushPolygons()
  }

  addArc (radiusX, radiusY, xRotate, arc, sweep, endPoint) {
    // TODO implement
  }

  addPoints (points) {
    const polygon = new Polygon()
    polygon.addPoints(points)
    this.addPolygon(polygon)
  }

  addPointsWithOffsetAndScale (points, offset, scale) {
    const polygon = new Polygon()
    polygon.addPointsWithOffsetAndScale(points, offset, scale)
    this.addPolygon(polygon)
  }

  updateInsides () {
    for (let i = 0; i < this.polygons.length; i++) {
      const b = this.polygons[i]
      for (let j = i + 1; j < this.polygons.length; j++) {
        const a = this.polygons[j]
        if (!a.isInside) a.isInside = b.checkIsInside(a)
        if (!b.isInside) b.isInside = a.checkIsInside(b)
      }
    }
  }

  checkReasonable () {
    if (this.polygons.length === 0 && this.polygons.length > 500) {
      return false
    }

    let totalPointCount = 0
    for (let ix = 0; ix < this.polygons.length; ix++) {
      const pointCount = this.polygons[ix].basePoints.length
      if (pointCount > 3000) {
        return false
      }
      totalPointCount += pointCount
    }

    if (totalPointCount > 100000) {
      return false
    }
    return true
  }

  addShapeFromBox (box, scale) {
    scale = scale || 1.0
    const boxPoly = new Polygon()
    const x = box.x
    const y = box.y
    const w = box.width / scale
    const h = box.height / scale
    boxPoly.addPoints([
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h }
    ])
    this.addPolygon(boxPoly)
  }

  updateMargins (margin, smoothFactor) {
    for (let ix = 0; ix < this.polygons.length; ix++) {
      const polygon = this.polygons[ix]
      // for (LET IX =const polygon of this.polygons) { // of statement is not debugable
      polygon.buildAngles()
    }
    this.updateInsides()
    for (let ix = 0; ix < this.polygons.length; ix++) {
      const polygon = this.polygons[ix]
      // for (const polygon of this.polygons) {
      if (!polygon.isInside) {
        polygon.buildMargin(margin, smoothFactor)
      }
    }
  }

  getXAdvance (shape) {
    let xa = 0
    for (let i = 0; i < this.polygons.length; i++) {
      if (!this.polygons[i].isInside) {
        for (let j = 0; j < shape.polygons.length; j++) {
          if (!shape.polygons[j].isInside) {
            const xd = this.polygons[i].getXAdvance(shape.polygons[j])
            xa = Math.max(xa, xd)
          }
        }
      }
    }
    return xa
  }
}

export default Shape
