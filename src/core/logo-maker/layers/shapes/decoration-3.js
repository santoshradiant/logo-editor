import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import Polyline from './polyline'

class Decoration3 extends Polyline {
  update (width, height, shapeData) {
    if (!width || !height) {
      return
    }

    const points1 = []
    const points2 = []
    const offset = 15

    points1.push([offset, -offset])
    points1.push([-offset, -offset])
    points1.push([-offset, offset])
    points2.push([width - offset, height + offset])
    points2.push([width + offset, height + offset])
    points2.push([width + offset, height - offset])

    SvgHelper.setAttributeValues(this.polyline1, {
      stroke: AMCore.colorToStyle(shapeData.colors[0]),
      // 'vector-effect': 'non-scaling-stroke',
      'stroke-width': 3,
      fill: 'none',
      points: this.generatePath(points1),
      x: 0,
      y: 0
    })

    SvgHelper.setAttributeValues(this.polyline2, {
      stroke: AMCore.colorToStyle(shapeData.colors[0]),
      // 'vector-effect': 'non-scaling-stroke',
      'stroke-width': 3,
      fill: 'none',
      points: this.generatePath(points2),
      x: 0,
      y: 0
    })
  }
}

export default Decoration3
