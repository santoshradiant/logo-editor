import Shape from './shape.js'
import Polygon from './polygon.js'

class Placement {
  constructor () {
    this.shapes = []
    this.offset = {
      x: 0,
      y: 0
    }
    this.scale = {
      x: 1.0,
      y: 1.0
    }
    this.hull = null
    this.hullVersion = 0
    this.lastHullVersion = -1
  }

  addShape (shape) {
    this.shapes.push(shape)
    this.hull = null
    this.hullVersion++
  }

  clearShapes () {
    this.shapes = []
    this.hull = null
    this.hullVersion++
  }

  toPathStr () {
    let pathStr = ''
    for (let shapeIx = 0; shapeIx < this.shapes.length; shapeIx++) {
      const shape = this.shapes[shapeIx]
      if (shape) {
        for (let polygonIx = 0; polygonIx < shape.polygons.length; polygonIx++) {
          const polygon = shape.polygons[polygonIx]
          if (polygon) {
            pathStr += polygon.toPathStr()
          }
        }
      }
    }
    return pathStr
  }

  addShapeFromBox (box, scale) {
    const shape = new Shape()
    shape.addShapeFromBox(box, scale)
    this.addShape(shape) //    placement.addShapeFromBox(box, scale)
  }

  getHull () {
    // if (this.hull && (this.hullVersion === this.lastHullVersion)) {
    //   return this.hull
    // }
    const hullPoints = new Polygon()
    for (let shapeIx = 0; shapeIx < this.shapes.length; shapeIx++) {
      const shape = this.shapes[shapeIx]
      if (shape) {
        for (let polygonIx = 0; polygonIx < shape.polygons.length; polygonIx++) {
          const polygon = shape.polygons[polygonIx]
          if (polygon) {
            hullPoints.addPoints(polygon.getHull())
          }
        }
      }
    }
    this.hull = new Polygon()
    if (hullPoints.basePoints.length > 2) {
      const points = hullPoints.getHull()
      this.hull.addPoints(points)
    }

    this.lastHullVersion = this.hullVersion
    return this.hull
  }
}

export default Placement
