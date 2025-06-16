import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import PhysicalShapeBase from './physical-shape-base'

class Circle2 extends PhysicalShapeBase {
  constructor (container, data, options, layer) {
    super(container, data, options, layer)

    this.g = SvgHelper.createElement('g')
    this.hullCircle = SvgHelper.createElement('circle')
    this.hullCircleStroke = SvgHelper.createElement('circle')

    AMCore.childCheck(container, this.g)
    AMCore.childCheck(this.g, this.hullCircle)
  }

  update (width, height, data) {
    if (!width || !height) {
      return
    }

    const myRootOffset = this.layer.getRootOffset()
    const hullPolygon = this.getHull()
    if (hullPolygon && hullPolygon.basePoints.length > 2) {
      let hullCircle
      try {
        hullCircle = hullPolygon.getCircleAround(true)
      } catch (exc) {
        console.error('Error calculating circle', exc)
      }
      if (!hullCircle) {
        return
      }

      const marginUnit = Math.sqrt(width * width + height * height) / 6
      const strokeWidth = ((data.strokeWidth || 1.0) * marginUnit) / 15
      const strokeDistance = data.strokeDistance || 1.0
      const borderColor =
        strokeDistance * marginUnit < strokeWidth * 0.5
          ? AMCore.colorToStyle(data.colors[1])
          : AMCore.colorToStyle(data.colors[0])
      const doubleBorder = data.borderStyle === 'double'
      const margin = ((doubleBorder || data.inverse) && strokeDistance ? marginUnit * strokeDistance : 0) + strokeWidth
      const margin1 = marginUnit + (margin < 0 ? -margin : 0)
      const margin2 = marginUnit + (margin > 0 ? margin * 0.5 : 0)

      if (doubleBorder || data.inverse) {
        SvgHelper.setAttributeValues(this.hullCircle, {
          fill: data.inverse ? AMCore.colorToStyle(data.colors[0]) : 'none',
          stroke: data.inverse ? 'none' : AMCore.colorToStyle(data.colors[0]),
          'stroke-width': strokeWidth,
          transform: `translate(${-myRootOffset.x.toFixed(2)} ${-myRootOffset.y.toFixed(2)})`,
          cx: hullCircle.cx,
          cy: hullCircle.cy,
          r: hullCircle.r + margin1
        })
      }

      if (doubleBorder || !data.inverse) {
        SvgHelper.setAttributeValues(this.hullCircleStroke, {
          fill: 'none',
          stroke: borderColor,
          'stroke-width': strokeWidth,
          transform: `translate(${-myRootOffset.x.toFixed(2)} ${-myRootOffset.y.toFixed(2)})`,
          cx: hullCircle.cx,
          cy: hullCircle.cy,
          r: hullCircle.r + margin2
        })
        AMCore.childCheck(this.g, this.hullCircleStroke)
      } else {
        AMCore.removeChildCheck(this.hullCircleStroke)
      }
    }
  }
}

export default Circle2
