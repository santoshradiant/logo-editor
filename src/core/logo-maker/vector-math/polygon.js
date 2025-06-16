import Math2 from './math2.js'
import hull from './hull'

// Polygon holder with margin generator and helper functions
// Make a circle with bezier: http://spencermortensen.com/articles/bezier-circle/
// Curve tracing:             https://www.math.ucla.edu/~baker/149.1.02w/handouts/dd_splines.pdf

// eslint-disable-next-line
const circleBezierFactor = 0.551915024494 // Works for 90 degree angles, this is a factor for interpolating control points between start/end and intersection point

// eslint-disable-next-line
function getAngleDiff(a, b) {
  // let res = (b - a + Math2.TAU) % Math2.TAU
  // if (res > Math.PI) {
  //   res -= Math2.TAU
  // }
  return ((b - a + Math2.TAU + Math.PI) % Math2.TAU) - Math.PI
}

// eslint-disable-next-line
function la(a) {
  return ((a / Math.PI) * 180).toFixed(2)
}

// eslint-disable-next-line
function coordToPath(pt, xo, yo) {
  if (!isFinite(pt.x) || !isFinite(pt.y)) {
    // console.error('coordinate error!', pt)
  }
  return (pt.x + (xo || 0)).toFixed(2) + ',' + (pt.y + (yo || 0)).toFixed(2) + ' '
}

function pointToPath (pt, size = 1.0) {
  return (
    'M' +
    coordToPath(pt, -size, 0) +
    'L' +
    coordToPath(pt, 0, -size) +
    'L' +
    coordToPath(pt, size, 0) +
    'L' +
    coordToPath(pt, 0, size) +
    'Z'
  )
}

function lineToPath (
  startPoint,
  endPoint,
  ofs = {
    x: 0,
    y: 0
  }
) {
  const angle = Math2.getAngle2(startPoint, endPoint)
  const len = Math2.distance2(startPoint, endPoint) * 0.05

  return (
    'M' +
    coordToPath(startPoint, Math.cos(angle + Math.PI * 0.66) * len, Math.sin(angle + Math.PI * 0.66) * len) +
    'L' +
    coordToPath(startPoint) +
    'L' +
    coordToPath(startPoint, Math.cos(angle - Math.PI * 0.66) * len, Math.sin(angle - Math.PI * 0.66) * len) +
    'L' +
    coordToPath(endPoint) +
    'Z '
  )
}

class Polygon {
  constructor () {
    this.basePoints = []
    this.hullPoints = []
    this.angles = []
    this.marginPoints = []
    this.version = 0
    this.anglesVersion = 0
    this.marginVersion = 0
    this.hullVersion = 0
    this.marginDistance = 3
    this.isClockwise = false
    this.isInside = false
    this.minX = 1000000
    this.minY = 1000000
    this.maxX = -1000000
    this.maxY = -1000000
  }

  sortOnAngle () {
    const center = {
      x: 0.5 * (this.minX + this.maxX),
      y: 0.5 * (this.minY + this.maxY)
    }
    if (this.basePoints.length < 3) {
      return
    }

    const points = this.basePoints
    const points2 = []
    for (let i = 0; i < points.length; i++) {
      const pt = points[i]
      points2.push({
        x: pt.x,
        y: pt.y,
        dist: Math2.distance2(center, pt),
        angle: Math2.getAngle2(center, pt)
      })
    }
    points2.sort((a, b) => a.angle - b.angle)

    let count = 0
    // FIXME: Get all the almost equal angles to the beginning
    while (
      Math.abs(getAngleDiff(points2[0].angle, points2[points2.length - 1].angle)) < (Math.PI / 180.0) * 1.5 &&
      count++ < 10
    ) {
      points2.unshift(points2.pop())
    }
    this.version++
    this.basePoints = points2.map(a => ({
      x: a.x,
      y: a.y
    }))
  }

  getHull () {
    // There is a github library for this, maybe it works better: https://github.com/AndriiHeonia/hull

    if (this.hullPoints && this.hullPoints.length > 0 && this.hullVersion === this.version) {
      return this.hullPoints
    }

    // this.hullPoints = hull(this.basePoints.map(_ => [_.x, _.y])).map(_ => ({ x: _[0], y: _[1] }), 250)
    this.hullPoints = hull(this.basePoints.map(x => x)) || [] // we need to make a copy because the hull function detroys the input :(
    return this.hullPoints

    // this.buildAngles()
    // this.hullVersion = this.version
    // let hullPoints = []
    // let points = this.basePoints
    // // const bestStart = -1
    // // const minY = 1000000
    // const center = {
    //   x: 0.5 * (this.minX + this.maxX),
    //   y: 0.5 * (this.minY + this.maxY)
    // }

    // const points2 = []
    // for (let i = 0; i < points.length; i++) {
    //   const pt = points[i]
    //   points2.push({ x: pt.x, y: pt.y, dist: Math2.distance2(center, pt), angle: Math2.getAngle2(center, pt) })
    //   // if (Math.abs(pt.x - this.minX) < 0.0001) {
    //   //   if (pt.y < minY) {
    //   //     minY = pt.y
    //   //     bestStart = i
    //   //   }
    //   // }
    // }
    // points = points2.sort((a, b) => a.angle - b.angle)

    // // for (let i = 0; i < this.basePoints.length; i++) {
    // //   const pt = this.basePoints[(i + bestStart) % this.basePoints.length]
    // //   points.push(pt)
    // // }
    // // if (!this.isClockwise) {
    // //   points = points.reverse()
    // // }

    // if (points.length <= 3) {
    //   return points
    // }

    // let ix = 0
    // let startPoint = points[ix++]
    // let lastPoint = points[ix++]
    // let nextPoint = points[ix]
    // // const lastPathStrs = []
    // // const lastDebugLines = []
    // hullPoints.push(startPoint)
    // // console.log('START------------------------------ ', bestStart)
    // while (true) {
    //   let lastIx = (ix + 1) % points.length
    //   // const debugLines = []
    //   // let pathStr = pointToPath(startPoint, 2.0)
    //   // pathStr += lineToPath(startPoint, lastPoint, { x: 25, y: 0 })

    //   // const lc = 50
    //   // console.log('Line length: ', Math2.distance2(startPoint, lastPoint), la(Math.atan2(lastPoint.y - startPoint.y, lastPoint.x - startPoint.x)))
    //   for (let i = 0; i < points.length; i++) {
    //     // const dist = Math2.distance2(startPoint, this.basePoints[i])
    //     const point = points[i]
    //     // if ((point === startPoint) || (point === lastPoint) || (i === ix)) {
    //     //   continue
    //     // }
    //     const lineInfo = Math2.line(point, startPoint, lastPoint)
    //     // if (this.isClockwise) {
    //     //   lineInfo.side *= -1.0
    //     // }
    //     if ((lineInfo.side) >= 0 && (lineInfo.pos >= 0.3)) {
    //       // debugLines.push(lineInfo)
    //       // pathStr += lineToPath(startPoint, lastPoint)
    //       // pathStr += lineToPath(startPoint, lastPoint, { x: lc, y: 0 })
    //       lastIx = (i - 1 + points.length) % points.length
    //       nextPoint = point
    //       lastPoint = nextPoint
    //     }
    //   }
    //   // console.log('------------------NEXT', lastIx)
    //   // pathStr += lineToPath(startPoint, nextPoint, { x: 35, y: 0 })

    //   // pathStr += pointToPath(nextPoint, 1.0)
    //   const foundIx = hullPoints.indexOf(nextPoint)
    //   if (foundIx !== -1) {
    //     // this.hullClosePathStr = lastPathStrs[lastDebugLines.length - 1] // pathStr
    //     // console.log('----found-----', lastDebugLines[lastDebugLines.length - 1], foundIx, lc)
    //     hullPoints = hullPoints.slice(foundIx)
    //     break
    //   }
    //   hullPoints.push(nextPoint)

    //   startPoint = nextPoint
    //   lastPoint = points[lastIx]
    //   // if (this.isClockwise) {
    //   //   lastIx = (lastIx + 1) % points.length
    //   // } else {
    //   lastIx = (lastIx - 1 + points.length) % points.length
    //   // }
    //   nextPoint = points[lastIx]
    //   // console.log(startPoint, lastPoint, nextPoint, lastIx, ix)

    //   if (hullPoints.length >= 1000) {
    //     console.error('Hull points overflow')
    //     break
    //   }

    //   // if (lastIx !== -1) {
    //   //   ix = lastIx
    //   // } else {
    //   //   ix--
    //   // }
    //   // console.log('====>', ix, lastIx, hullPoints.length)
    //   // lastPathStrs.push(pathStr)
    //   // lastDebugLines.push(debugLines)
    // }
    // // sconsole.log('FINISH------------------------------', hullPoints)
    // this.hullPoints = hullPoints
    // return hullPoints
  }

  findCurve (ix) {
    if (ix + 2 >= this.basePoints.length) {
      return 0
    }

    const startPoint = this.basePoints[ix]
    let lastAngle = this.angles[ix]
    let newAngle = this.angles[ix + 1]
    const lastAngleDelta = getAngleDiff(lastAngle, newAngle)
    let lastDist = Math2.distance2(startPoint, this.basePoints[ix + 1])
    console.log('findCurve: ', lastAngle, newAngle, lastAngleDelta)

    for (let i = ix + 2; i < this.basePoints.length; i++) {
      lastAngle = newAngle
      newAngle = this.angles[i]
      const newAngleDelta = getAngleDiff(lastAngle, newAngle)

      if (Math.sign(lastAngleDelta) !== Math.sign(newAngleDelta)) {
        return i - 1
      }

      const dist = Math2.distance2(startPoint, this.basePoints[i])
      // console.log(
      //   'findCurveL: ',
      //   la(lastAngle),
      //   la(newAngle),
      //   la(newAngleDelta),
      //   dist
      // )
      if (dist < lastDist) {
        return i - 1
      }

      lastDist = dist
      // lastAngleDelta = newAngleDelta can do everything relative to the 1st
    }
    return this.basePoints.length - ix
  }

  toPathStr (points) {
    points = points || this.basePoints
    let pathStr = ''
    // const scale = 3.0
    // const pt = points[0]
    // const pt2 = points[1]
    // if (pt && pt2) {
    //   pathStr += 'M' + (pt.x - scale).toFixed(2) + ',' + (pt.y + 0).toFixed(2) + ' ' +
    //              'L' + (pt.x + 0).toFixed(2) + ',' + (pt.y - scale).toFixed(2) + ' ' +
    //              'L' + (pt.x + scale).toFixed(2) + ',' + (pt.y + 0).toFixed(2) + ' ' +
    //              'L' + (pt.x + 0).toFixed(2) + ',' + (pt.y + scale).toFixed(2) + 'Z ' +
    //              'M' + (pt2.x + 0).toFixed(2) + ',' + (pt2.y).toFixed(2) + ' L' + (pt.x - scale).toFixed(2) + ',' + (pt.y + 0).toFixed(2) + 'Z ' +
    //              'M' + (pt2.x + 0).toFixed(2) + ',' + (pt2.y).toFixed(2) + ' L' + (pt.x + 0).toFixed(2) + ',' + (pt.y - scale).toFixed(2) + 'Z ' +
    //              'M' + (pt2.x + 0).toFixed(2) + ',' + (pt2.y).toFixed(2) + ' L' + (pt.x + scale).toFixed(2) + ',' + (pt.y + 0).toFixed(2) + 'Z ' +
    //              'M' + (pt2.x + 0).toFixed(2) + ',' + (pt2.y).toFixed(2) + ' L' + (pt.x + 0).toFixed(2) + ',' + (pt.y + scale).toFixed(2) + 'Z '
    // }
    let ix = 0
    for (const point of points) {
      if (point && isFinite(point.x) && isFinite(point.y)) {
        pathStr += (ix++ === 0 ? 'M' : 'L') + point.x.toFixed(2) + ',' + point.y.toFixed(2)
      } else {
        console.error('coordinate error!', point)
      }
    }
    return pathStr + 'Z   '
  }

  toPathStr2 (points) {
    this.buildMargin(this.marginDistance)
    points = points || this.basePoints
    let pathStr = ''
    for (let ix = 0; ix < points.length; ix++) {
      const point = points[ix]
      const scale = ix === 0 ? 2.0 : 1.0
      pathStr += pointToPath(point, scale)

      // if (!this.isInside) {
      //   let a = this.angles[ix] + (this.isClockwise ? Math.PI : 0.0)
      //   let point2 = {
      //     x: point.x + Math.sin(a) * this.marginDistance,
      //     y: point.y - Math.cos(a) * this.marginDistance
      //   }
      //   // pathStr += lineToPath(point, point2)

      //   a = this.angles[ix % this.angles.length] +
      //       (this.isClockwise ? Math.PI : 0.0)
      //   point2 = {
      //     x: point.x + Math.sin(a) * this.marginDistance,
      //     y: point.y - Math.cos(a) * this.marginDistance
      //   }
      //   pathStr += lineToPath(point, point2)
      // }
    }
    let lastPoint = this.marginPoints[this.marginPoints.length - 1]
    for (let ix = 0; ix < this.marginPoints.length; ix++) {
      const newPoint = this.marginPoints[ix]
      pathStr += lineToPath(lastPoint, newPoint)
      lastPoint = newPoint
    }

    return pathStr
  }

  hasPoints () {
    return this.basePoints.length > 0
  }

  // Load al the points of the shape
  loadPoints (points) {
    this.basePoints = points
    this.version++
  }

  addPoint = point => {
    if (!point || !isFinite(point.x) || !isFinite(point.y)) {
      // console.error('coordinate error!', point)
      return
      // debugger
    }
    this.minX = Math.min(this.minX, point.x)
    this.minY = Math.min(this.minY, point.y)
    this.maxX = Math.max(this.maxX, point.x)
    this.maxY = Math.max(this.maxY, point.y)

    if (this.basePoints.length > 0) {
      const last = this.basePoints[this.basePoints.length - 1]
      if (Math.abs(point.x - last.x) < 0.01 && Math.abs(point.y - last.y) < 0.01) {
        return false
      }
    }

    this.basePoints.push(point)
    this.version++
    return true
  }

  addPoints (points) {
    points.forEach(this.addPoint)
  }

  addPointsWithOffsetAndScale (points, offset, scale) {
    for (const pt of points) {
      this.addPoint({
        x: pt.x * scale.x + offset.x,
        y: pt.y * scale.y + offset.y
      })
    }
  }

  checkIsInside (polygon, oddEven) {
    if (!oddEven && polygon.isClockwise === this.isClockwise) {
      return false
    }

    if (polygon.basePoints.length > 3500) {
      console.error('Points overflow in shape!')
      return false
    }

    let sideTotal = 0
    // let closestPathStr = polygon.insideVectorPathStr
    const neg = polygon.isClockwise ? -1.0 : 1.0
    for (const pt of polygon.basePoints) {
      // console.log('check: ', pt)
      let closest = { dist: Number.MAX_SAFE_INTEGER }
      for (let ix = 0; ix < this.basePoints.length; ix++) {
        const a = this.basePoints[ix]
        const b = this.basePoints[(ix + 1) % this.basePoints.length]
        const res = Math2.line(pt, a, b)
        // If the point is on a side of the line
        if (res.pos > -1.6 && res.pos < 1.6) {
          if (res.dist < closest.dist) {
            closest = res
          }

          // if (line(pt, a, b) < 0) {
          // sideTotal += res.side
          // return false
        }
      }
      sideTotal += closest.side
    }
    return sideTotal * neg >= 2.0
  }

  getPointsXAdvance (pointsA, pointsB, clockwise, reverse, startX) {
    let result = startX || 0
    for (const pt of pointsA) {
      for (let ix = 0; ix < pointsB.length; ix++) {
        let a
        let b
        if (clockwise) {
          a = pointsB[ix]
          b = pointsB[(ix + 1) % pointsB.length]
        } else {
          a = pointsB[(ix + 1) % pointsB.length]
          b = pointsB[ix]
        }
        if (a.y <= b.y) {
          if (pt.y >= a.y && pt.y <= b.y) {
            let dx
            if (a.y === b.y) {
              dx = Math.max(result, reverse ? pt.x - a.x : a.x - pt.x)
            } else {
              const y = (pt.y - a.y) / (b.y - a.y)
              const x = a.x * (1.0 - y) + b.x * y
              dx = reverse ? pt.x - x : x - pt.x
            }
            // console.log(a, b, pt, x, y)
            if (dx > result) {
              result = dx
              // this.maxPt = pt
              // this.maxLine = { a, b }
              // this.maxX = result
              // this.maxReverse = reverse
            }
          }
        }
      }
    }
    return result
  }

  getXAdvance (polygon) {
    if (!isFinite(this.marginDistance)) {
      console.error('Can\'t calculate advance without building the margins 1st')
    }
    const x1 = this.getPointsXAdvance(this.marginPoints, polygon.marginPoints, polygon.isClockwise)
    const x2 = this.getPointsXAdvance(polygon.marginPoints, this.marginPoints, !this.isClockwise, true, x1, polygon)
    return Math.max(x1, x2)
  }

  buildAngles () {
    if (this.angles.length !== this.basePoints.length || this.anglesVersion !== this.version) {
      this.anglesVersion = this.version

      const points = this.basePoints
      while (true) {
        const lastIx = points.length - 1
        if (lastIx >= 1 && points[0].x === points[lastIx].x && points[0].y === points[lastIx].y) {
          points.length = lastIx
        } else {
          break
        }
      }

      const angles = []
      for (let ix = 0; ix < points.length; ix++) {
        const pta = points[(points.length + ix - 1) % points.length]
        const ptb = points[ix]
        const dabx = pta.x - ptb.x
        const daby = pta.y - ptb.y
        // angles1.push((Math.atan2(daby, dabx) + TAU) % TAU)
        // angles1.push(Math.PI * 2.0 - (Math.atan2(daby, dabx)))
        angles.push((Math.atan2(daby, dabx) + Math2.TAU) % Math2.TAU)
      }

      // if (this.isClockwise === undefined) {
      if (angles.length >= 3) {
        let total = 0
        for (let ix = 0; ix < angles.length; ix++) {
          const aa = angles[ix]
          const ab = angles[(angles.length + ix + 1) % angles.length]
          total += Math.sin(ab - aa)
        }
        // console.log('Clockwize: ', logAngle(angles[0]), ',', logAngle(angles[1]), ',', logAngle(total))
        // this.isClockwise = Math.abs(angles1[1] - angles1[0]) < Math.PI
        this.isClockwise = total > 0.0
      }
      this.angles = angles
    }
  }

  buildMargin (margin, smoothFactor) {
    if (!isFinite(margin)) {
      console.error('Invalid margin suplied to build margin')
    }
    if (this.marginPoints.length === 0 || this.marginDistance !== margin || this.marginVersion !== this.version) {
      this.marginVersion = this.version
      this.marginDistance = margin
      this.buildAngles()

      const points = this.basePoints
      const angles = this.angles
      const marginPoints = []
      for (let ix = 0; ix < points.length; ix++) {
        const pta = points[ix]
        const ptb = points[(points.length + ix + 1) % points.length]
        const aa = angles[ix]
        let ab = angles[(points.length + ix + 1) % points.length]
        if (this.isClockwise) {
          ab += Math.PI
        }
        const ad = getAngleDiff(aa, ab) // - aa + Math2.TAU + Math.PI) % Math2.TAU - Math.PI
        // getAngleDiff(ab,aa)

        if (Math.abs(ad) >= (0.25 * Math.PI) / smoothFactor) {
          const step = 1.0 / Math.round(0.5 + (((Math.abs(ad) / Math.PI) * 180) / 30) * smoothFactor)
          for (let offset = 0; offset < 1.0; offset += step) {
            const bx = Math.sin(aa + ad * offset) * margin
            const by = -Math.cos(aa + ad * offset) * margin
            marginPoints.push({
              x: pta.x + bx,
              y: pta.y + by
            })
          }
        }
        const ax = Math.sin(ab) * margin
        const ay = -Math.cos(ab) * margin
        // console.log('segment: ', aa / Math.PI * 180, ',', ab / Math.PI * 180)

        marginPoints.push({
          x: pta.x + ax,
          y: pta.y + ay
        })
        marginPoints.push({
          x: ptb.x + ax,
          y: ptb.y + ay
        })
      }
      this.marginPoints = marginPoints
    }
  }

  getArroundOffsetScale (polygon) {
    const scale = Math.max(
      (this.maxX - this.minX) / (polygon.maxX - polygon.minX),
      (this.maxY - this.minY) / (polygon.maxY - polygon.minY)
    )
    // const xx = (this.maxX - this.minX) - (polygon.maxX - polygon.minX) * scale
    // const yy = (this.maxY - this.minY) - (polygon.maxY - polygon.minY) * scale
    const pos = {
      x: 0, // this.minX - polygon.minX * scale + 0.5 * xx,
      y: 0 // this.minY - polygon.minY * scale + 0.5 * yy
    }

    let poly2 = new Polygon()
    poly2.addPointsWithOffsetAndScale(polygon.basePoints, pos, {
      x: scale,
      y: scale
    })
    const circle1 = this.getCircleAround()
    const circle2 = poly2.getCircleAround()
    const circleDelta = {
      x: circle1.cx - circle2.cx,
      y: circle1.cy - circle2.cy
    }
    pos.x += circleDelta.x
    pos.y += circleDelta.y

    poly2 = new Polygon()
    poly2.addPointsWithOffsetAndScale(polygon.basePoints, pos, {
      x: scale,
      y: scale
    })

    // let lastPoint = poly2.basePoints[0]
    // for (let ix = 0; ix < poly2.basePoints.length; ix++) {
    //   const newPoint = poly2.basePoints[ix]

    //   for (let jx = 0; jx < this.basePoints.length; jx++) {
    //     const lineInfo = Math2.line(this.basePoints[jx], lastPoint, newPoint)
    //     if (lineInfo.side > 0) {
    //       console.log(lineInfo)
    //     }
    //   }

    //   lastPoint = newPoint
    // }

    return {
      pos,
      scale,
      circleDelta
    }
  }

  getCircleAround (mirrorX) {
    this.debugPathStr = ''
    const centerPoint = {
      x: (this.maxX + this.minX) * 0.5,
      y: (this.maxY + this.minY) * 0.5
    }
    let radius = (this.maxX - this.minX) * 0.5
    let maxDist = 0
    let maxIx = -1
    let maxJx = -1
    // CONSIDER: getHull could much be faster for complex shapes
    const points = [] // this.basePoints // getHull()
    for (let ix = 0; ix < this.basePoints.length; ix++) {
      const pt = this.basePoints[ix]
      points.push(pt)
      if (mirrorX) {
        points.push({ x: this.maxX - pt.x + this.minX, y: pt.y })
      }
    }

    // Find the 2 points that are the furthest distance from eachother
    for (let ix = 0; ix < points.length; ix++) {
      const point1 = points[ix]
      for (let jx = ix + 1; jx < points.length; jx++) {
        const point2 = points[jx]
        const newDist = Math2.distance2(point1, point2)
        if (newDist > maxDist) {
          maxDist = newDist
          maxIx = ix
          maxJx = jx
        }
      }
    }

    // Set the center tho the middle of the 2 points
    if (maxIx >= 0) {
      centerPoint.x = (points[maxIx].x + points[maxJx].x) * 0.5
      centerPoint.y = (points[maxIx].y + points[maxJx].y) * 0.5
      radius = maxDist * 0.5
    }

    // Find a 3th point furthest removed from the other 2 points
    let found
    let maxKx = -1
    maxDist = -1
    for (let ix = 0; ix < points.length; ix++) {
      const pt = points[ix]
      const dist1 = Math2.distance2(pt, points[maxIx])
      const dist2 = Math2.distance2(pt, points[maxJx])
      const newDist = dist1 + dist2
      if (newDist > maxDist) {
        maxDist = newDist
        maxKx = ix
      }
    }

    const circle = Math2.getCircle(points[maxIx], points[maxJx], points[maxKx])
    radius = circle.radius
    centerPoint.x = circle.center.x
    centerPoint.y = circle.center.y

    // Let use the radius square for comparison so we don't have to take the sqrt every loop
    let radius2 = radius * radius
    this.debugPathStr +=
      'M ' + coordToPath(points[maxIx]) + 'L' + coordToPath(points[maxJx]) + 'L' + coordToPath(points[maxKx]) + 'Z'

    // It wil mostly find it within 3 time so lets do max 5 tries to find the circle
    for (let i = 0; i < 5; i++) {
      found = false
      for (let ix = 0; ix < points.length; ix++) {
        const pt = points[ix]
        const dx = pt.x - centerPoint.x
        const dy = pt.y - centerPoint.y
        // Check if this is a new point outside our circle
        if (ix !== maxIx && ix !== maxJx && ix !== maxKx && dx * dx + dy * dy > radius2) {
          // Replace the closest point of our triangle with the new point
          this.debugPathStr += pointToPath(points[maxIx], 2.0)
          this.debugPathStr += pointToPath(points[maxJx], 2.0)
          this.debugPathStr += pointToPath(points[maxKx], 2.0)
          const dIx = Math2.distance2(pt, points[maxIx])
          const dJx = Math2.distance2(pt, points[maxJx])
          const dKx = Math2.distance2(pt, points[maxKx])
          const oldMaxIx = maxIx
          const oldMaxJx = maxJx
          const oldMaxKx = maxKx
          let checkPoint = points[ix]
          if (dIx < dJx) {
            if (dIx < dKx) {
              checkPoint = points[maxIx]
              maxIx = ix
            } else {
              checkPoint = points[maxKx]
              maxKx = ix
            }
          } else {
            if (dJx < dKx) {
              checkPoint = points[maxJx]
              maxJx = ix
            } else {
              checkPoint = points[maxKx]
              maxKx = ix
            }
          }

          const pt1 = points[maxIx]
          const pt2 = points[maxJx]
          const pt3 = points[maxKx]

          const circle = Math2.getCircle(pt1, pt2, pt3)

          // const a = Math2.distance2(pt1, pt2)
          // const b = Math2.distance2(pt2, pt3)
          // const c = Math2.distance2(pt3, pt1)
          // const newRadius = (a * b * c) / Math.sqrt((a + b + c) * (b + c - a) * (c + a - b) * (a + b - c))

          // // this.debugPathStr += lineToPath(pt1, pt2)
          // const ll1a = Math2.getPointOnLineFract(pt1, pt2, 0.5)
          // const ll1b = {
          //   x: ll1a.x - (pt2.y - pt1.y) * 0.5,
          //   y: ll1a.y + (pt2.x - pt1.x) * 0.5
          // }

          // const ll2a = Math2.getPointOnLineFract(pt2, pt3, 0.5)
          // const ll2b = {
          //   x: ll2a.x + (pt2.y - pt3.y) * 0.5,
          //   y: ll2a.y - (pt2.x - pt3.x) * 0.5
          // }
          // const newCenterpoint = Math2.getIntersection(ll1a, ll1b, ll2a, ll2b)
          // this.debugPathStr += pointToPath(newIntersection, 10.0)

          const dx = checkPoint.x - circle.center.x
          const dy = checkPoint.y - circle.center.y
          if (circle.radius >= radius && dx * dx + dy * dy < circle.radius * circle.radius) {
            this.debugPathStr += pointToPath(pt, 5.0)
            this.debugPathStr += 'M ' + coordToPath(pt1) + 'L' + coordToPath(pt2) + 'L' + coordToPath(pt3) + 'Z'
            this.debugPathStr += pointToPath(circle.center, 10.0)
            centerPoint.x = circle.center.x
            centerPoint.y = circle.center.y
            radius = circle.radius
            radius2 = radius * radius
            // console.log('NewCircle', centerPoint, radius)
            // break
            found = true
          } else {
            maxIx = oldMaxIx
            maxJx = oldMaxJx
            maxKx = oldMaxKx
          }
        }
      }
      if (!found) {
        // If no points outside anymore we are ok
        break
      }
    }
    return {
      cx: centerPoint.x,
      cy: centerPoint.y,
      r: radius
    }
  }

  getSmoothPoints (borderRadius, withDebug) {
    this.buildAngles()
    const points = this.basePoints
    const plen = points.length
    const offset = (ix, ofs) => (ix + ofs + plen) % plen
    const lengths = []
    let debugPathsStr = ''
    let pathStr = ''
    let lastPoint = points[offset(0, 0)]
    let lastAngle = this.angles[offset(0, -1)]
    let maxLength = -1

    // Filter out same angles
    for (let ix = 0; ix < plen + 1; ix++) {
      const newAngle = this.angles[offset(ix, 1)]
      const newPoint = points[offset(ix, 0)]
      const angleDiff = getAngleDiff(lastAngle, newAngle)
      const vectorLen = Math2.distance2(lastPoint, newPoint)
      // console.log(ix.toString().padStart(2, '0'), ':', angleDiff, vectorLen)
      if (Math.abs(angleDiff) >= (Math.PI / 180.0) * 1.5 || ix === plen) {
        const line = {
          len: vectorLen,
          angle: newAngle,
          pta: lastPoint,
          ptb: newPoint
        }
        maxLength = Math.max(maxLength, vectorLen)
        lengths.push(line)
        // console.log('newline: ', line)
        lastAngle = newAngle
        lastPoint = newPoint
      } else {
        // pathStr += pointToPath(newPoint, 0.5)
      }
    }

    // Keep only the longest lines
    const bestLines = []
    {
      let lastLine = lengths[lengths.length - 1]
      for (let ix = 0; ix < lengths.length; ix++) {
        const line = lengths[ix]
        const angleDiff = getAngleDiff(lastLine.angle, line.angle)
        if (line.len > maxLength * 0.1 || (line.len > 5 && Math.abs(angleDiff) > (Math.PI / 180) * 30)) {
          if (withDebug) {
            debugPathsStr += lineToPath(line.pta, line.ptb)
          }
          bestLines.push(line)
        }
        lastLine = line
      }
    }

    if (bestLines.length === 0) {
      return ''
    }

    let lastLine = bestLines[bestLines.length - 1]
    // let totalSpaceLen = 0
    // Caclculate the intersection points of the longest lines
    // pathStr += 'M' + coordToPath(lastLine.pta)
    if (withDebug) {
      debugPathsStr += pointToPath(lastLine.pta, 15)
    }
    // const newPoints = []
    for (let ix = 0; ix < bestLines.length; ix++) {
      const line = bestLines[ix]

      const intersection = Math2.getIntersection(lastLine.pta, lastLine.ptb, line.pta, line.ptb)
      const maxControlLen = Math.min(
        Math2.distance2(
          {
            x: 0.5 * (lastLine.pta.x + lastLine.ptb.x),
            y: 0.5 * (lastLine.pta.y + lastLine.ptb.y)
          },
          intersection
        ),
        Math2.distance2(
          {
            x: 0.5 * (line.pta.x + line.ptb.x),
            y: 0.5 * (line.pta.y + line.ptb.y)
          },
          intersection
        )
      )

      // controlLen *= Math.min(0.5, Math.pow(getAngleDiff(lastLine.angle, line.angle) / Math.PI, 0.5) * 0.5)
      const controlLen = Math.min(
        maxControlLen,
        Math.abs(Math.atan(0.5 * getAngleDiff(lastLine.angle, line.angle)) * borderRadius)
      )

      const startPoint = Math2.getPointOnLine(intersection, lastLine.pta, controlLen)
      // Math2.distance2({
      //   x: 0.5 * (lastLine.pta.x + lastLine.ptb.x),
      //   y: 0.5 * (lastLine.pta.y + lastLine.ptb.y)
      // }, intersection))// controlLen)
      const startControl = Math2.getPointOnLine(intersection, lastLine.pta, (1.0 - circleBezierFactor) * controlLen)
      const endControl = Math2.getPointOnLine(intersection, line.ptb, (1.0 - circleBezierFactor) * controlLen)
      const endPoint = Math2.getPointOnLine(intersection, line.ptb, controlLen)
      //   Math2.distance2({
      //   x: 0.5 * (line.pta.x + line.ptb.x),
      //   y: 0.5 * (line.pta.y + line.ptb.y)
      // }, intersection))
      if (withDebug) {
        debugPathsStr +=
          pointToPath(startPoint, 4) + pointToPath(startControl) + pointToPath(endControl) + pointToPath(endPoint, 2)
      }
      pathStr += // 'Q' + coordToPath(intersection) + ' ' + coordToPath(line.pta) +
        (ix === 0 ? 'M' : 'L') +
        coordToPath(startPoint) +
        'C' +
        coordToPath(startControl) +
        coordToPath(endControl) +
        coordToPath(endPoint)
      lastLine = line
    }
    pathStr += 'Z'

    if (withDebug) {
      return pathStr + debugPathsStr
    } else {
      return pathStr
    }
  }
}

export default Polygon
