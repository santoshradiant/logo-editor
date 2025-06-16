import SvgHelper from './../utils/svg-helper'
import AMCore from '../amcore'
import AMLayerBase from './amlayerbase'

// Container layer is ment to contain "inside out built" layers
// and make them usable in a outside in layout
// The group layer used to do this but is to much changed
// for logomaker and can't mix them well
function AMContainLayer (settings) {
  const base = AMCore.inherit(this, AMLayerBase, settings)

  const self = this
  const options = {}

  settings = AMCore.extendRecursive(
    self.settings || {},
    {
      type: AMContainLayer.layerType
    },
    false,
    true
  )

  self.childBox = { x: 0, y: 0, width: 1920, height: 1920 }

  self.initialize = function (container, opt) {
    AMCore.extend(options, opt)
    self.layerElement = SvgHelper.createElement('g')
    base.initialize(container, opt)
  }

  self.updatePosition = function () {
    self.traceIn()

    // Make the container the end point for working inside out
    settings.isRoot = true
    self.calculatedWidth = settings.rootWidth = 1920 // containerElement.clientWidth || options.initialWidth
    self.calculatedHeight = settings.rootHeight = 1920 // containerElement.clientHeight || options.initialHeight

    const containerElement = self.layerElement

    let layer = this.containLayer
    if (!layer) {
      const layerSettings = {
        type: 'group',
        tag: 'contain',

        position: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        },
        layers: settings.content
      }
      layer = new AMLayerBase.NewLayer(layerSettings.type, layerSettings)
      layer.parent = self
      layer.initialize(containerElement, options)
      this.containLayer = layer
    }

    try {
      layer.updatePosition()
    } catch (exc) {
      console.log('contain error: ', layer, exc)
      return
    }

    let minLeft = 1000000.0
    let maxRight = -1000000.0
    let minTop = 1000000.0
    let maxBottom = -1000000.0
    const placements = layer.getNestedPlacements().flat()
    for (const placement of placements) {
      let offset = placement.offset
      if (placement.layer) {
        placement.rootOffset = placement.layer.getRootOffset(this)
        offset = {
          x: offset.x + placement.rootOffset.x,
          y: offset.y + placement.rootOffset.y
        }
      }

      // Not working
      // offset.x -= this.calculatedLeft || 0.0
      // offset.y -= this.calculatedTop || 0.0

      for (const shape of placement.shapes) {
        minLeft = Math.min(minLeft, shape.minX * placement.scale.x + offset.x)
        minTop = Math.min(minTop, shape.minY * placement.scale.y + offset.y)
        maxRight = Math.max(maxRight, shape.maxX * placement.scale.x + offset.x)
        maxBottom = Math.max(maxBottom, shape.maxY * placement.scale.y + offset.y)
      }
    }

    if (settings.rotateContent === -90) {
      self.childBox = {
        left: minTop,
        top: minLeft - (maxRight - minLeft),
        width: maxBottom - minTop,
        height: maxRight - minLeft
      }
    } else {
      self.childBox = {
        left: minLeft,
        top: minTop,
        width: maxRight - minLeft,
        height: maxBottom - minTop
      }
    }
    settings.position.aspect = self.childBox.width / self.childBox.height

    base.updatePosition()

    self.traceOut()
  }

  self.updateElementsSizeAndPosition = function (left, top, width, height) {
    width = Math.max(0, width)
    height = Math.max(0, height)

    const xScale = width / self.childBox.width
    const yScale = height / self.childBox.height

    SvgHelper.setAttributeValues(self.layerElement, {
      transform:
        'translate(' +
        (left - self.childBox.left * xScale) +
        ' ' +
        (top - self.childBox.top * yScale) +
        ') ' +
        'scale(' +
        xScale +
        ' ' +
        yScale +
        ') ' +
        (settings.rotateContent === -90 ? 'rotate(-90)' : '')
    })

    base.updateElementsSizeAndPosition(left, top, width, height)
  }
}

AMContainLayer.layerType = 'contain'

export default AMContainLayer
