import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Polyline {
  constructor (container) {
    this.polyline1 = SvgHelper.createElement('polyline')
    this.polyline2 = SvgHelper.createElement('polyline')
    this.g = SvgHelper.createElement('g', this.polyline1, this.polyline2)

    AMCore.childCheck(container, this.g)
  }

  generatePath (points) {
    let path = ''
    for (let index = 0; index < points.length; index++) {
      path += points[index][0] + ',' + points[index][1] + ' '
    }

    return path
  }

  update (width, height, shapeData) {}
}

export default Polyline
