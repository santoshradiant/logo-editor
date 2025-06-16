import SvgHelper from './../utils/svg-helper'
import AMCore from '../amcore'
import AMLayerBase from './amlayerbase'
import Ellipse from './shapes/ellipse'
import Polygon from './shapes/polygon'
import PolygonShape from './shapes/polygon-shape'
import Hull from './shapes/hull'
import Debug from './shapes/debug'
import Circle2 from './shapes/circle2'
import MultiPolygon from './shapes/multipolygon'
import Decoration1 from './shapes/decoration-1'
import Decoration2 from './shapes/decoration-2'
import Decoration3 from './shapes/decoration-3'
import Decoration4 from './shapes/decoration-4'
import Decoration5 from './shapes/decoration-5'
import Decoration6 from './shapes/decoration-6'
import Circle from './shapes/circle'
import Rectangle from './shapes/rectangle'
import Rectangle2 from './shapes/rectangle2'
import Card from './shapes/card'
import Line from './shapes/line'
import Rect from './shapes/rect'
import Symbol from './shapes/symbol-shape'

const shapes = {
  ellipse: Ellipse,
  polygon: Polygon,
  hexagon: PolygonShape,
  diamond: PolygonShape,
  pentagon: PolygonShape,
  multipolygon: MultiPolygon,
  decoration1: Decoration1,
  decoration2: Decoration2,
  decoration3: Decoration3,
  decoration4: Decoration4,
  decoration5: Decoration5,
  decoration6: Decoration6,
  circle: Circle,
  circle2: Circle2,
  rect: Rect,
  rectangle: Rectangle,
  rectangle2: Rectangle2,
  symbol: Symbol,
  card: Card,
  line: Line,
  hull: Hull,
  debug: Debug
}
const shapeOptions = {
  hexagon: { cornerCount: 6 },
  diamond: { cornerCount: 4 },
  pentagon: { cornerCount: 5 }
}

function AMShapeLayer (settings) {
  const base = AMCore.inherit(this, AMLayerBase, settings)

  const self = this
  const options = {}

  let shapeSVG = null
  let shapeSVGName = ''

  settings = AMCore.extendRecursive(
    self.settings || {},
    {
      type: AMShapeLayer.layerType,
      shape: {
        name: 'ellipse'
      }
    },
    false,
    true
  )

  self.initialize = function (container, opt) {
    AMCore.extend(options, opt)
    self.layerElement = SvgHelper.createElement('g')
    base.initialize(container, opt)
  }

  self.initShape = function () {
    if (settings.hovertag) {
      self.layerElement.dataLogoHover = {
        tag: settings.hovertag,
        inUse: true
      }
    }
    if (shapeSVGName !== settings.shape.name || !shapeSVG) {
      if (!self.symbolData) {
        self.symbolData = AMCore.clone(settings.shape)
      }
      let ShapeClass = shapes[settings.shape.name]
      if (!ShapeClass) {
        // Fix for forward compatibility with opening non existing shapes in older version
        ShapeClass = Rectangle
      }
      const fixedOptions = shapeOptions[settings.shape.name]
      shapeSVG = new ShapeClass(self.layerElement, self.symbolData, { ...options, ...fixedOptions }, this)
      shapeSVGName = settings.shape.name
    }
  }

  self.updatePosition = function () {
    self.traceIn()

    if (settings.shape.colorFrom) {
      if (settings.shape.colorFrom2) {
        settings.shape.colors = [
          options.getColor(settings.shape.colorFrom),
          options.getColor(settings.shape.colorFrom2)
        ]
      } else {
        settings.shape.colors = [options.getColor(settings.shape.colorFrom)]
      }
      if (self.symbolData) {
        self.symbolData.colors = settings.shape.colors
      }
    }

    if (settings.shape.name === 'symbol') {
      self.symbolData = options.getSymbolData(settings.shape)
      if (self.symbolData.size) {
        settings.position.scale = self.symbolData.size
      }
    }

    if (settings.shape.isBackground) {
      self.symbolData = options.getBackgroundData(settings.shape)
    }

    self.initShape()

    if (shapeSVG && shapeSVG.hasAspect) {
      self.settings.position.aspect = shapeSVG.hasAspect
    }

    base.updatePosition()

    self.traceOut()
  }

  self.updateElementsSizeAndPosition = function (left, top, width, height) {
    width = Math.max(0, width)
    height = Math.max(0, height)
    if (shapeSVG && self.symbolData) {
      shapeSVG.update(width, height, self.symbolData)
    }

    SvgHelper.setAttributeValues(self.layerElement, {
      transform: 'translate(' + left + ' ' + top + ')'
    })

    base.updateElementsSizeAndPosition(left, top, width, height)
  }
}

AMShapeLayer.layerType = 'shape'

export default AMShapeLayer
