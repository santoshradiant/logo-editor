// import AMCore from '../../amcore'
// import SvgHelper from '../../utils/svg-helper'
import Placement from 'core/logo-maker/vector-math/placement'
import Polygon from '../../vector-math/polygon'
// import Shape from '../../vector-math/shape'

class PhysicalShapeBase {
  constructor (container, data, options, layer) {
    this.options = options
    this.container = container
    this.layer = layer
  }

  updatePlacement () {
    let placement
    if (this.layer.placements.length === 0) {
      placement = this.layer.placements[0] = new Placement()
    } else {
      placement = this.layer.placements[0]
      placement.clearShapes()
    }
    return placement
  }

  getHull () {
    const result = new Polygon()
    const placements = this.layer.settings._parent._owner.getNestedPlacements().flat()
    if (placements.length > 0) {
      const hullCollector = new Polygon()

      for (let ix = 0; ix < placements.length; ix++) {
        const placement = placements[ix]
        const hull = new Polygon()
        const offset = { x: placement.offset.x, y: placement.offset.y }
        if (placement.layer) {
          const rootOffset = placement.layer.getRootOffset()
          offset.x += rootOffset.x
          offset.y += rootOffset.y
        }
        hull.addPointsWithOffsetAndScale(placement.getHull().basePoints, offset, placement.scale)
        hullCollector.addPoints(hull.basePoints)
      }
      result.addPoints(hullCollector.getHull())
    }
    return result
  }

  getMarginHull (hullCollector, distance, smoothness) {
    const hullMaker = new Polygon()
    hullMaker.addPoints(hullCollector.basePoints)
    hullMaker.addPointsWithOffsetAndScale(
      hullCollector.getHull().reverse(),
      { x: hullMaker.maxX + hullMaker.minX, y: 0 },
      { x: -1.0, y: 1.0 }
    )
    hullMaker.sortOnAngle()

    const hullPoly = new Polygon()
    hullPoly.addPoints(hullMaker.getHull())
    hullPoly.buildMargin(distance || 35, smoothness || 5.5)

    const hullPolyMargin = new Polygon()
    hullPolyMargin.addPoints(hullPoly.marginPoints)
    console.log('Margin hulll')
    return hullPolyMargin
  }
}

export default PhysicalShapeBase
