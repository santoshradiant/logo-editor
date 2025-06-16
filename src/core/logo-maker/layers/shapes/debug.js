import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Polygon from '../../vector-math/polygon'
import Shape from '../../vector-math/shape'
import PhysicalShapeBase from './physical-shape-base'

class Debug extends PhysicalShapeBase {
  constructor (container, data, options, layer) {
    super(container, data, options, layer)

    this.debugPaths = []
    this.g = SvgHelper.createElement('g')
    AMCore.childCheck(container, this.g)
  }

  update (width, height, data) {
    if (!width || !height) {
      return
    }

    // let symbolHull
    let symbolPlacement
    const placements = this.layer.settings._parent._owner.getNestedPlacements().flat()
    // window.placementsRendered = []
    if (placements.length > 0) {
      const myRootOffset = this.layer.getRootOffset()

      const hulls = []
      for (let ix = 0; ix < placements.length; ix++) {
        const placement = placements[ix]
        if (placement.scale.x > 0.001 && placement.scale.y > 0.001) {
          const hull = new Polygon()
          let offset = placement.offset
          if (placement.layer) {
            placement.rootOffset = placement.layer.getRootOffset()
            offset = {
              x: offset.x + placement.rootOffset.x,
              y: offset.y + placement.rootOffset.y
            }
          }
          // window.placementsRendered.push(JSON.stringify({ offset, scale: placement.scale }))
          const placementHull = placement.getHull()
          if (placementHull && placementHull.basePoints && placementHull.basePoints.length > 2) {
            hull.addPointsWithOffsetAndScale(placementHull.basePoints, offset, placement.scale)
            hulls.push(hull)
          }

          if (placement.layer && placement.layer.settings.tag === 'symbol') {
            // symbolHull = hull
            symbolPlacement = new Shape()
            if (placement.shapes) {
              for (let ix = 0; ix < placement.shapes.length; ix++) {
                if (placement.shapes[ix] && placement.shapes[ix].polygons) {
                  for (let jx = 0; jx < placement.shapes[ix].polygons.length; jx++) {
                    symbolPlacement.addPointsWithOffsetAndScale(
                      placement.shapes[ix].polygons[jx].basePoints,
                      offset,
                      placement.scale
                    )
                  }
                }
              }
            }
          }
        }
      }

      if (!this.debugPaths || this.debugPaths.length !== hulls.length) {
        AMCore.removeAllChildren(this.g)
        this.debugPaths = []
        this.debugPaths.length = hulls.length
        for (let ix = 0; ix < hulls.length; ix++) {
          this.debugPaths[ix] = SvgHelper.createElement('path')
        }
        this.hullPath = SvgHelper.createElement('path')
        this.hullCircle = SvgHelper.createElement('circle')
        // this.hullSymbol = SvgHelper.createElement('path')
        // this.hullSymbolShape = SvgHelper.createElement('path')
      }

      for (let ix = 0; ix < hulls.length; ix++) {
        const hull = hulls[ix]
        SvgHelper.setAttributeValues(this.debugPaths[ix], {
          // transform: `translate(${(placement.offsetX * placement.scaleX + offset.x).toFixed(2)} ${(placement.offsetY * placement.scaleY + offset.y).toFixed(2)}) scale(${placement.scaleX.toFixed(2)} ${placement.scaleY.toFixed(2)})`,
          // transform: `translate(${(placement.offset.x - myRootOffset.x).toFixed(2)} ${(hulls.offset.y - hulls.y).toFixed(2)}) scale(${placement.scale.x.toFixed(2)} ${placement.scale.y.toFixed(2)})`,
          transform: `translate(${-myRootOffset.x.toFixed(2)} ${-myRootOffset.y.toFixed(2)})`,
          fill: '#8080ff40',
          stroke: '#f0f000a0',
          'stroke-width': 3,
          // d: placement.shapes[0].toHullPathStr() // placement.shapes[0].toPathStr()
          d: hull.toPathStr() // placement.shapes[0].toPathStr()
          // d: hull.hullClosePathStr
        }) // 'M 0,10 L 0,10 L 20,10 L 10,20 Z' })
        AMCore.childCheck(this.g, this.debugPaths[ix])
      }

      const hullCollector = new Polygon()
      for (let ix = 0; ix < hulls.length; ix++) {
        const hull = hulls[ix]
        hullCollector.addPoints(hull.basePoints)
      }
      const hullMaker = new Polygon()
      // hullMaker.addPointsWithOffsetAndScale(hullMaker.getHull(), { x: hullMaker.maxX + hullMaker.minX, y: hullMaker.maxY + hullMaker.minY }, { x: -1.0, y: -1.0 })
      // hullCollector.sortOnAngle()
      hullMaker.addPoints(hullCollector.getHull())
      // hullMaker.addPointsWithOffsetAndScale(hullCollector.getHull().reverse(), { x: hullMaker.maxX + hullMaker.minX, y: 0 }, { x: -1.0, y: 1.0 })
      // hullMaker.sortOnAngle()
      try {
        const hullPoly = new Polygon()
        hullPoly.addPoints(hullMaker.getHull())
        hullPoly.buildMargin(15, 10.5)

        // eslint-disable-next-line
        const hullPolyDebugPathStr = hullPoly.toPathStr2() + hullPoly.toPathStr()
        hullPoly.buildMargin(35, 5.5)
        const hullPolyMargin = new Polygon()
        hullPolyMargin.addPoints(hullPoly.marginPoints)

        if (this.hullCircle) {
          const hullCircle = hullPolyMargin.getCircleAround(true)

          SvgHelper.setAttributeValues(this.hullCircle, {
            // fill: AMCore.colorToStyle(data.colors[0]),
            fill: '#00000020',
            stroke: '#00000040',
            'stroke-width': '0.5',
            transform: `translate(${-myRootOffset.x.toFixed(2)} ${-myRootOffset.y.toFixed(2)})`,
            cx: hullCircle.cx,
            cy: hullCircle.cy,
            r: hullCircle.r
          })

          AMCore.childCheck(this.g, this.hullCircle)
        }

        SvgHelper.setAttributeValues(this.hullPath, {
          transform: `translate(${-myRootOffset.x.toFixed(2)} ${-myRootOffset.y.toFixed(2)})`,
          // fill: AMCore.colorToStyle(data.colors[0]),
          fill: '#8080ff10',
          stroke: '#8080F040',
          'stroke-width': 1.0,
          // d: hullPolyMargin.debugPathStr + hullMaker.toPathStr() + 'Z' + hullPolyDebugPathStr + 'Z' + hullPolyMargin.toPathStr() // hullPolyMargin.getSmoothPoints(data.borderRadius * 35, true)
          // d: hullPolyMargin.getSmoothPoints(data.borderRadius * 35, true)
          d: hullCollector.toPathStr(hullCollector.getHull())
        }) // 'M 0,10 L 0,10 L 20,10 L 10,20 Z' })
        AMCore.childCheck(this.g, this.hullPath)

        // if (symbolHull && this.hullSymbol) {
        //   const offsetScale = hullPolyMargin.getArroundOffsetScale(symbolHull)

        //   symbolPlacement.fuckeslint = 3
        //   SvgHelper.setAttributeValues(this.hullSymbol, {
        //     transform: `translate(${(offsetScale.pos.x - myRootOffset.x).toFixed(2)} ${(offsetScale.pos.y - myRootOffset.y).toFixed(2)}) scale(${offsetScale.scale.toFixed(2)})`,
        //     fill: AMCore.colorToStyle(data.colors[0]), // '#80ff8040',
        //     // stroke: '#00800080',
        //     // 'stroke-width': 0.5,
        //     d: symbolHull.toPathStr()
        //   })

        //   // this.hullSymbolShape
        //   SvgHelper.setAttributeValues(this.hullSymbolShape, {
        //     transform: `translate(${(offsetScale.pos.x - myRootOffset.x).toFixed(2)} ${(offsetScale.pos.y - myRootOffset.y).toFixed(2)}) scale(${offsetScale.scale.toFixed(2)})`,
        //     // transform: `translate(${((offsetScale.pos.x - myRootOffset.x) + (symbolPlacement.rootOffset.x + symbolPlacement.offset.x) * 1.503 * symbolPlacement.scale.x).toFixed(2)} ` +
        //     //                      `${((offsetScale.pos.y - myRootOffset.y) + (symbolPlacement.rootOffset.y + symbolPlacement.offset.y) * 1.503 * symbolPlacement.scale.y).toFixed(2)}) scale(${(offsetScale.scale * symbolPlacement.scale.x).toFixed(2)})`,
        //     // transform: `translate(${(-0).toFixed(2)} ` +
        //     //                      `${(-0).toFixed(2)}) scale(${(offsetScale.scale * symbolPlacement.scale.x).toFixed(2)})`,
        //     fill: '#00000015',
        //     // fill: '#80ff8070',
        //     // stroke: '#00000015',
        //     'stroke-width': 0.2,
        //     d: symbolPlacement.toPathStr()
        //   })

        //   AMCore.childCheck(this.g, this.hullSymbol)
        //   AMCore.childCheck(this.g, this.hullSymbolShape)
        // }
      } catch (fdd) {
        console.log(fdd)
      }
    }
    // const margin = Math.max(width, height) * 0.33
  }
}

export default Debug
