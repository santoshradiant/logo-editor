import SvgHelper from './../utils/svg-helper'
import AMCore from '../amcore'
import AMLayerBase from './amlayerbase'
// import Carlot from './carlot2.jpg'
import Space from './spaceMountains.jpg'

function AMImageLayer (settings) {
  const base = AMCore.inherit(this, AMLayerBase, settings)

  const self = this
  const options = {}

  settings = AMCore.extendRecursive(
    self.settings || {},
    {
      type: AMImageLayer.layerType,
      layers: []
    },
    false,
    true
  )
  self.childBox = { x: 0, y: 0, width: 1920, height: 1920 }

  self.initialize = function (container, opt) {
    AMCore.extend(options, opt)
    self.layerElement = SvgHelper.createElement('image')
    base.initialize(container, opt)
  }

  self.updatePosition = function () {
    self.traceIn()

    settings.isRoot = true
    self.calculatedWidth = settings.rootWidth = 1920 // containerElement.clientWidth || options.initialWidth
    self.calculatedHeight = settings.rootHeight = 1920 // containerElement.clientHeight || options.initialHeight

    SvgHelper.setAttributeValues(self.layerElement, {
      preserveAspectRatio: 'xMidYMid slice',
      href: Space
    })
    base.updatePosition()

    self.traceOut()
  }

  self.updateElementsSizeAndPosition = function (left, top, width, height) {
    width = Math.max(0, width)
    height = Math.max(0, height)

    SvgHelper.setAttributeValues(self.layerElement, {
      width,
      height
    })

    base.updateElementsSizeAndPosition(left, top, width, height)
  }
}

AMImageLayer.layerType = 'image'

export default AMImageLayer
