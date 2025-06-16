import AMCore from '../../amcore'
import SvgHelper from '../../utils/svg-helper'
import PhysicalShapeBase from './physical-shape-base'

let uniqueId = 0
const defaultSymbol = {
  isLoaded: true,
  innerSvgStr: SvgHelper.getLoaderSvg(),
  symbolData: { type: 'default' },
  getBox: () => ({
    x: 0,
    y: 0,
    width: 38,
    height: 38
  })
}

class Symbol extends PhysicalShapeBase {
  constructor (container, data, options, layer) {
    super(container, data, options, layer)
    this.initialized = false
    this.options = options
    this.container = container
    this.layer = layer
    this.hasAspect = 1.0
  }

  initialize = data => {
    this.initialized = true
    this.iconContainer = this.iconContainer || SvgHelper.createElement('g')
    this.rect = this.rect || SvgHelper.createElement('rect')

    data.decoration = data.decoration || 'none'

    if (data && (data.decoration === 'inverse' || data.decoration === 'inverseRounded')) {
      this.rectMask = this.rectMask || SvgHelper.createElement('rect')
      this.mask = this.mask || SvgHelper.createElement('mask')
      SvgHelper.setAttributeValues(this.mask, { id: 'shape-hole-' + uniqueId })
      SvgHelper.setAttributeValues(this.rect, { mask: 'url(#shape-hole-' + uniqueId++ + ')' })
    }
    this.g = this.g || SvgHelper.createElement('g')
    AMCore.childCheck(this.container, this.g)
  }

  addShapeFromBox (placement, box, scale) {
    placement.addShapeFromBox(box, scale)
  }

  update = (width, height, data) => {
    let symbol = data.symbol

    if (!symbol || !symbol.isLoaded) {
      symbol = defaultSymbol
      // return
    }

    const placement = this.updatePlacement()

    this.box = symbol.getBox()
    if (!this.box) {
      this.box = defaultSymbol.getBox()
    }

    if (symbol.symbolData.type === 'initials' && data.decoration === 'none') {
      data.decoration = 'inverseRounded'
      this.initialized = false
    }

    if (!this.initialized) {
      this.initialize(data)
    }

    if (data.decoration && data.decoration !== 'none') {
      this.hasAspect = 1.0
    } else {
      this.hasAspect = this.box.width / this.box.height
    }

    if (!width || !height) {
      this.addShapeFromBox(placement, this.box)
      return
    }

    // const svgStr = data.symbol.innerSvgStr || data.symbol.svgStr
    const svgStr = symbol.innerSvgStr || symbol.svgStr

    if (this.lastSvgStr !== svgStr) {
      this.lastSvgStr = svgStr
      this.iconContainer.innerHTML = svgStr
      if (!this.iconContainer.firstElementChild) {
        this.addShapeFromBox(placement, this.box)
        return
      }
      this.iconContainer.innerHTML = this.iconContainer.firstElementChild.innerHTML
      //   this.iconContainer.firstElementChild.removeAttribute('viewBox')
      //   this.iconContainer.firstElementChild.removeAttribute('width')
      //   this.iconContainer.firstElementChild.removeAttribute('height')
      //   this.iconContainer.firstElementChild.removeAttribute('x')
      //   this.iconContainer.firstElementChild.removeAttribute('y')
    }

    let scale = Math.min(height / this.box.height, width / this.box.width)
    if (data.decoration && data.decoration !== 'none') {
      scale /= 1.8
    }

    if (data.spacing) {
      scale /= data.spacing
    }

    const iconWidth = this.box.width * scale
    const iconHeight = this.box.height * scale

    const diffrenceWidth = (width - iconWidth) / 2
    const diffrenceHeight = (height - iconHeight) / 2

    const offsetX = this.box.x * scale
    const offsetY = this.box.y * scale

    const x = diffrenceWidth - offsetX
    const y = diffrenceHeight - offsetY
    const size = Math.max(width, height)

    const symbolBox = {
      x: (width - size) / 2,
      y: (height - size) / 2,
      width: size,
      height: size
    }

    if (data.decoration === 'inverse' || data.decoration === 'inverseRounded') {
      this.hasAspect = 1.0
      SvgHelper.colorSvg(this.iconContainer, '#000')
      SvgHelper.setAttributeValues(this.iconContainer, { fill: '#000', stroke: 'none' })

      // const size = Math.max(iconWidth, iconHeight) * 1.2 //  + 10
      SvgHelper.setAttributeValues(this.rect, {
        fill: AMCore.colorToStyle(data.colors[0]),
        stroke: AMCore.colorToStyle(data.colors[0]),
        // 'vector-effect': 'non-scaling-stroke',
        'stroke-width': 3,
        ...symbolBox
        // x: (width - size) / 2,
        // y: (height - size) / 2,
        // width: size,
        // height: size
      })

      this.addShapeFromBox(placement, symbolBox, scale)

      if (data.decoration === 'inverse') {
        SvgHelper.setAttributeValues(this.rectMask, {
          fill: 'white', // <-- textname so it does not get altered when saved
          ...symbolBox
          // x: (width - size) / 2,
          // y: (height - size) / 2,
          // width: size,
          // height: size
        })
      } else if (data.decoration === 'inverseRounded') {
        SvgHelper.setAttributeValues(this.rectMask, {
          fill: 'white',
          rx: 0.15 * size,
          ry: 0.15 * size,
          ...symbolBox
        })
      }
      AMCore.childCheck(this.mask, this.rectMask)
      AMCore.childCheck(this.mask, this.iconContainer)
      AMCore.childCheck(this.g, this.mask)
      AMCore.childCheck(this.g, this.rect)
    } else {
      AMCore.removeChildCheck(this.rectMask)
      AMCore.removeChildCheck(this.mask)

      AMCore.childCheck(this.g, this.iconContainer)

      SvgHelper.colorSvg(this.iconContainer, AMCore.colorToStyle(data.colors[0]))
      SvgHelper.setAttributeValues(this.iconContainer, { fill: AMCore.colorToStyle(data.colors[0]), stroke: 'none' })

      if (data.decoration !== 'none') {
        this.addShapeFromBox(placement, symbolBox, scale)
        SvgHelper.setAttributeValues(this.rect, {
          fill: 'none',
          stroke: AMCore.colorToStyle(data.colors[0]),
          // 'vector-effect': 'non-scaling-stroke',
          'stroke-width': 3,
          rx: data.decoration === 'rounded' ? 0.15 * size : undefined,
          ry: data.decoration === 'rounded' ? 0.15 * size : undefined,
          ...symbolBox
        })
        AMCore.childCheck(this.g, this.rect)
      } else {
        AMCore.removeChildCheck(this.rect)
        placement.addShape(data.symbol.shape)
      }
    }

    if (placement) {
      // const myRootOffset = this.layer.getRootOffset()
      placement.layer = this.layer
      placement.offset.x = 0 // myRootOffset.x // + x
      placement.offset.y = 0 // myRootOffset.y // + y

      placement.scale.x = scale
      placement.scale.y = scale
    }
    SvgHelper.setAttributeValues(this.iconContainer, {
      x: 0,
      y: 0,
      transform: `translate(${x}, ${y}) scale(${scale})`
    })
  }
}

export default Symbol
