import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class PathBase {
  constructor (container) {
    this.path1 = SvgHelper.createElement('path')
    this.path2 = SvgHelper.createElement('path')
    this.svg = SvgHelper.createElement('svg', this.path1, this.path2)

    AMCore.childCheck(container, this.svg)
  }

  update (width, height, shapeData) {}
}

export default PathBase
