import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Polygon from '../../vector-math/polygon'

// import Shape from '../../vector-math/shape'
import PhysicalShapeBase from './physical-shape-base'

class Hull extends PhysicalShapeBase {
  constructor (container, data, options, layer) {
    super(container, data, options, layer)

    this.g = SvgHelper.createElement('g')
    this.hullPath = SvgHelper.createElement('path')
    this.hullPathStroke = SvgHelper.createElement('path')

    AMCore.childCheck(container, this.g)
    AMCore.childCheck(this.g, this.hullPath)
    AMCore.childCheck(this.g, this.hullPathStroke)
  }

  update (width, height, data) {
    if (!width || !height) {
      return
    }

    const myRootOffset = this.layer.getRootOffset()
    const strokeDistance = data.strokeDistance
    const doubleBorder = data.borderStyle === 'double'
    const borderColor =
      strokeDistance < 0 && data.inverse ? AMCore.colorToStyle(data.colors[1]) : AMCore.colorToStyle(data.colors[0])
    const margin = (doubleBorder || data.inverse) && strokeDistance ? 20 * (strokeDistance || 1.0) : 0
    const margin1 = margin < 0 ? -margin : 0
    const margin2 = margin // margin > 0 ? margin : 0

    const currentHull = this.getHull()
    if (currentHull && currentHull.hasPoints()) {
      const hullPolygon = this.getMarginHull(currentHull, 35 + margin1)

      if (hullPolygon) {
        const shape1 = hullPolygon.toPathStr() // getSmoothPoints(data.borderRadius * 35 || 35)
        let shape2 = shape1
        if (doubleBorder || !data.inverse) {
          let poly = new Polygon()
          poly.addPoints(hullPolygon.basePoints)
          poly.buildMargin(margin2)
          const newHullPoints = poly.marginPoints
          poly = new Polygon()
          poly.addPoints(newHullPoints)
          shape2 = poly.getSmoothPoints(data.borderRadius * 45 || 45)
        }

        if (doubleBorder || data.inverse) {
          SvgHelper.setAttributeValues(this.hullPath, {
            fill: data.inverse ? AMCore.colorToStyle(data.colors[0]) : 'none',
            stroke: data.inverse ? 'none' : AMCore.colorToStyle(data.colors[0]),
            'stroke-width': data.strokeWidth,
            transform: `translate(${-myRootOffset.x.toFixed(2)} ${-myRootOffset.y.toFixed(2)})`,
            d: shape1
          })
        }

        if (doubleBorder || !data.inverse) {
          SvgHelper.setAttributeValues(this.hullPathStroke, {
            fill: 'none',
            stroke: borderColor,
            'stroke-width': data.strokeWidth,
            transform: `translate(${-myRootOffset.x.toFixed(2)} ${-myRootOffset.y.toFixed(2)})`,
            d: shape2
          })
        }
      }
    }
  }
}

export default Hull
