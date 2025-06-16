import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'

class Decoration6 {
  constructor (container, data, options) {
    this.container = container
    this.options = options

    this.fontInstanceL = options.getFontInstance(options.templateData.font.decoration, '}')
    this.fontInstanceR = options.getFontInstance(options.templateData.font.decoration, '}')
    this.leftPath = SvgHelper.createElement('path')
    this.rightPath = SvgHelper.createElement('path')
    AMCore.childCheck(this.container, this.leftPath)
    AMCore.childCheck(this.container, this.rightPath)
  }

  update (width, height, data) {
    if (!this.fontInstance.isLoaded) {
      return
    }

    const leftPathInfo = this.fontInstanceL.getPathInfo()[0].path
    const rightPathInfo = this.fontInstanceR.getPathInfo()[0].path
    const leftPathBox = leftPathInfo.getBoundingBox()
    const rightPathBox = rightPathInfo.getBoundingBox()

    const scale = (height / (leftPathBox.y2 - leftPathBox.y1)) * 1.025

    SvgHelper.setAttributeValues(this.leftPath, {
      d: leftPathInfo.toPathData(),
      fill: data.colors[0],
      transform:
        'translate(' +
        (-leftPathBox.x2 * scale - width * 0.0125 * 1.5).toFixed(3) +
        ' ' +
        (-leftPathBox.y1 * scale - height * 0.0125 * 1.5).toFixed(3) +
        ') scale(' +
        scale +
        ')',
      width: 100,
      height: height
    })

    SvgHelper.setAttributeValues(this.rightPath, {
      d: rightPathInfo.toPathData(),
      fill: data.colors[0],
      transform:
        'translate(' +
        (width * (1 + 0.0125 * 1.5) - rightPathBox.x1 * scale).toFixed(3) +
        ' ' +
        (-rightPathBox.y1 * scale - height * 0.0125 * 1.5).toFixed(3) +
        ') scale(' +
        scale +
        ')',
      width: 100,
      height: height
    })
  }
}

export default Decoration6
