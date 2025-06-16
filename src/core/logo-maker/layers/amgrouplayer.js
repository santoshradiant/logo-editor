import AMCore from '../amcore'
import SvgHelper from './../utils/svg-helper'
import AMLayerBase from './amlayerbase'
import AMTextLayer from './amtextlayer'
import AMShapeLayer from './amshapelayer'
import AMContainLayer from './amcontainlayer'
import AMImageLayer from './amimagelayer'

const outerPadding = 16 // FIXME: Padding should be taken into account for the headers, i hardcoded this value from the editor
const margin = 28
const hoverMargin = 8
let instanceId = 0

function AMGroupLayer (settings) {
  const base = AMCore.inherit(this, AMLayerBase, settings)

  const self = this
  self.instanceId = ++instanceId

  const options = {}
  let containerElement = null

  settings = AMCore.extendRecursive(
    self.settings,
    {
      type: AMGroupLayer.layerType,
      layers: []
    },
    false,
    true
  )
  self.updatePosition = function () {
    self.traceIn()

    if (settings.isRoot) {
      self.calculatedWidth = settings.rootWidth = 1920 // containerElement.clientWidth || options.initialWidth
      self.calculatedHeight = settings.rootHeight = 1920 // containerElement.clientHeight || options.initialHeight
    }

    const containerElement = self.layerElement
    for (let i = 0; i < settings.layers.length; i++) {
      const layerSettings = settings.layers[i]
      let layer = layerSettings._owner
      if (!layer) {
        Object.defineProperty(layerSettings, '_parent', {
          value: settings,
          configurable: true
        })

        layer = new AMLayerBase.NewLayer(layerSettings.type, layerSettings)
        layer.parent = self
        layer.initialize(containerElement, options)
        containerElement.appendChild(settings.layers[i]._owner.layerElement)
      }
    }

    // for (let i = 0; i < settings.layers.length; i++) {
    //   // AMCore.childCheck(self.layerElement, settings.layers[i]._owner.layerElement)
    //   if (settings.layers[i]._owner.layerElement.parentElement !== self.layerElement) {
    //     self.layerElement.appendChild(settings.layers[i]._owner.layerElement)
    //   }
    // }

    // if (settings.position.autoWidth || settings.position.autoHeight) {
    const pos = settings.position

    if (settings.position.autoWidth || settings.position.autoHeight || settings.isRoot) {
      let minLeft = 1000.0
      let maxRight = -1000.0
      let minTop = 1000.0
      let maxBottom = -1000.0
      let hasChilren = false
      for (let i = 0; i < settings.layers.length; i++) {
        const layer = settings.layers[i]
        // TODO: better way to skip unrendered slogan
        if (!layer.linkedToParent) {
          layer._owner.updatePosition()
          if (layer._pos.width > 0 && layer._pos.height > 0) {
            hasChilren = true
            if (!layer.position.smartLeft) {
              minLeft = Math.min(minLeft, layer._pos.left)
              maxRight = Math.max(maxRight, layer._pos.right)
            } else {
              minLeft = Math.min(minLeft, -layer._pos.width / 2)
              maxRight = Math.max(maxRight, layer._pos.width / 2)
            }
            minTop = Math.min(minTop, layer._pos.top)
            maxBottom = Math.max(maxBottom, layer._pos.bottom)
          }
        }
      }

      if (hasChilren) {
        if (settings.position.autoWidth) {
          pos.width = Math.max(0, maxRight - minLeft)
        }
        if (settings.position.autoHeight) {
          pos.height = Math.max(0, maxBottom - minTop)
        }

        base.updatePosition()

        if (settings.position.autoWidth) {
          settings._pos.childOffsetLeft = -minLeft
        }
        if (settings.position.autoHeight) {
          settings._pos.childOffsetTop = -minTop
        }

        for (let i = 0; i < settings.layers.length; i++) {
          const layer = settings.layers[i]
          if (layer.linkedToParent) {
            layer._owner.updatePosition()
          }
        }

        const pw = self.getParentWidth()
        const ph = self.getParentHeight()
        self.box = {
          x: minLeft * pw,
          y: minTop * ph,
          width: pw * Math.max(0, maxRight - minLeft),
          height: ph * Math.max(0, maxBottom - minTop)
        }
      }
    } else {
      for (let i = 0; i < settings.layers.length; i++) {
        const layer = settings.layers[i]
        layer._owner.updatePosition()
      }
      base.updatePosition()
    }

    self.traceOut()
  }

  self.addDef = function (nodeName, id, attributes) {
    if (!self.defs) {
      self.defs = {
        element: SvgHelper.createElement('defs'),
        cache: {}
      }
      if (self.svg.childElementCount) {
        self.svg.insertBefore(self.defs.element, self.svg.firstElementChild)
      } else {
        self.svg.appendChild(self.defs.element)
      }
    }

    if (self.defs.cache[id]) {
      self.defs.cache[id].remove()
    }

    self.defs.cache[id] = SvgHelper.createElement(nodeName)
    self.defs.element.appendChild(self.defs.cache[id])
    SvgHelper.setAttributeValues(self.defs.cache[id], { id, ...attributes })

    return self.defs.cache[id]
  }

  self.removeDef = function (idOrElement) {
    const id = idOrElement && idOrElement.id ? idOrElement.id : idOrElement
    if (self.defs.cache[id]) {
      self.defs.cache[id].remove()
      delete self.defs.cache[id]
    }
  }

  self.handleSvgClick = function (ev) {
    let clickedOn = ev.target
    while (clickedOn && !clickedOn.dataLogoHover) {
      clickedOn = clickedOn.parentElement
    }
    if (clickedOn) {
      if (options.onclick) {
        options.onclick(clickedOn.dataLogoHover.tag, ev)
      }
    }
  }

  self.createTagHovers = function () {
    let hoverElements = self.hoverElements
    if (!hoverElements) {
      self.hoverElements = hoverElements = {}
    }

    for (const key in hoverElements) {
      hoverElements[key].el.dataLogoHover.inUse = false
      hoverElements[key].el.remove()
    }

    // containerElement
    const scanSvg = el => {
      for (const child of el.children) {
        if (child.dataLogoHover) {
          const key = child.dataLogoHover.tag
          let hoverElement = hoverElements[key]
          if (!hoverElement) {
            hoverElement = document.createElement('div')
            hoverElement.classList.add('svg-hover-area')
            hoverElement.dataLogoHover = child.dataLogoHover
            hoverElement.onclick = self.handleSvgClick
            hoverElements[key] = { el: hoverElement, layer: child }
          } else {
            hoverElement = hoverElement.el
          }

          const box = JSON.parse(JSON.stringify(child.getBoundingClientRect()))
          const parentBox = containerElement.getBoundingClientRect
            ? containerElement.getBoundingClientRect()
            : containerElement.host.getBoundingClientRect()
          box.left -= parentBox.left
          box.top -= parentBox.top

          hoverElement.style.position = 'absolute'
          const w = parentBox.width + outerPadding * 2
          const h = parentBox.height + outerPadding * 2
          hoverElement.style.left = ((100 * (box.left + outerPadding - hoverMargin)) / w).toFixed(2) + '%'
          hoverElement.style.top = ((100 * (box.top + outerPadding - hoverMargin)) / h).toFixed(2) + '%'
          hoverElement.style.width = ((100 * (box.width + hoverMargin * 2)) / w).toFixed(2) + '%'
          hoverElement.style.height = ((100 * (box.height + hoverMargin * 2)) / h).toFixed(2) + '%'
          hoverElement.dataLogoHover.arreaSq = box.width * box.height
          hoverElement.dataLogoHover.inUse = hoverElement.dataLogoHover.arreaSq > 2
        }
        scanSvg(child)
      }
    }
    scanSvg(self.svg)

    // If we are using shadowroot clear our old hovers from the div
    if (containerElement.host && containerElement.host.parentElement) {
      const oldHovers = containerElement.host.parentElement.querySelectorAll('.svg-hover-area')
      oldHovers.forEach(element => {
        let found = false
        for (const hoverEl of Object.values(hoverElements)) {
          if (hoverEl.el === element) {
            found = true
            break
          }
        }
        if (!found) {
          element.remove()
        }
      })
    }
    const cleanUp = []
    for (const hoverElement of Object.values(hoverElements).sort(
      (a, b) => b.el.dataLogoHover.arreaSq - a.el.dataLogoHover.arreaSq
    )) {
      if (hoverElement.el.dataLogoHover.inUse) {
        if (containerElement.host && containerElement.host.parentElement) {
          containerElement.host.parentElement.appendChild(hoverElement.el)
        } else {
          containerElement.appendChild(hoverElement.el)
        }
      } else {
        cleanUp.push(hoverElement.el.dataLogoHover.tag)
      }
    }

    for (const key of cleanUp) {
      delete hoverElements[key]
    }
  }

  self.updateOptions = function (opt) {
    AMCore.extend(options, opt)
    base.updateOptions(opt)
    for (let i = 0; i < settings.layers.length; i++) {
      const layerSettings = settings.layers[i]
      const layer = layerSettings._owner
      if (layer) {
        layer.updateOptions(opt)
      }
    }
  }

  self.leaveZoom = function () {
    const box = self.viewBox
    if (box && box.width && box.height) {
      SvgHelper.setAttributeValues(self.svg, {
        viewBox:
          (box.x - margin).toFixed(2) +
          ' ' +
          (box.y - margin).toFixed(2) +
          ' ' +
          (box.width + margin * 2).toFixed(2) +
          ' ' +
          (box.height + margin * 2).toFixed(2)
        // transform: 'scale(' + scale + ')' It does autoscale by viewbox
      })
    }
  }
  self.enterZoom = function () {
    const box = self.zoomBox || self.viewBox
    if (box && box.width && box.height) {
      SvgHelper.setAttributeValues(self.svg, {
        viewBox:
          (box.x - margin).toFixed(2) +
          ' ' +
          (box.y - margin).toFixed(2) +
          ' ' +
          (box.width + margin * 2).toFixed(2) +
          ' ' +
          (box.height + margin * 2).toFixed(2)
        // transform: 'scale(' + scale + ')' It does autoscale by viewbox
      })
    }
  }

  self.initialize = function (container, opt) {
    AMCore.extend(options, opt)
    containerElement = container

    // If we are in the DOM that is not SVG switch to SVG
    // Could change self to see if we don't have a parent
    if (!container.namespaceURI || container.namespaceURI.indexOf('svg') === -1) {
      container = self.svg = SvgHelper.createElement('svg')
      SvgHelper.setAttributeValues(self.svg, { 'xmlns:xlink': 'http://www.w3.org/1999/xlink' })
      self.svg.addEventListener('click', self.handleSvgClick)

      options.addDef = self.addDef
      options.removeDef = self.removeDef

      self.svg.style.width = '100%'
      self.svg.style.height = '100%'

      const parentElement = containerElement?.host?.parentElement
      if (parentElement) {
        parentElement.onmouseenter = self.enterZoom
        parentElement.onmouseleave = self.leaveZoom
      }

      AMCore.childCheck(containerElement, container)
      settings.isRoot = true

      self.calculatedWidth = settings.rootWidth = containerElement.clientWidth || options.initialWidth
      self.calculatedHeight = settings.rootHeight = containerElement.clientHeight || options.initialHeight
    }

    self.layerElement = SvgHelper.createElement('g')
    if (settings.hovertag) {
      self.layerElement.dataLogoHover = {
        tag: settings.hovertag,
        inUse: true
      }
    }
    AMCore.childCheck(container, self.layerElement)
    base.initialize(container, opt)
  }

  self.findTaggedLayer = function (name, type) {
    const searchInLayer = layer => {
      const settings = layer.settings
      if (settings.tag === name) {
        if (type === undefined || settings.type === type) {
          return layer
        }
      }
      if (settings.type === 'group') {
        for (let ix = 0; ix < settings.layers.length; ix++) {
          const result = searchInLayer(settings.layers[ix]._owner)
          if (result) {
            return result
          }
        }
      }
    }
    return searchInLayer(self)
  }

  // self.setTransformForTag = function (box, tagName) {
  //   const layer = self.findTaggedLayer(tagName)
  //   if (layer) {
  //     const box2 = layer.layerElement.getBBox()
  //     let parent = layer
  //     while (parent) {
  //       box2.x += parent.calculatedLeft
  //       box2.y += parent.calculatedTop
  //       parent = parent.parent
  //     }
  //     const scale = Math.min(box.width / box2.width, box.height / box2.height)
  //     if (self.containerElement?.firstElementChild) {
  //       self.containerElement.firstElementChild.style.transition = 'tranform 500ms'
  //       self.containerElement.firstElementChild.style.transform =
  //         'translate(' + (-box2.x * scale - (box.width - box2.width) / scale).toFixed(3) + 'px, ' +
  //                        (-box2.y * scale).toFixed(3) + 'px) ' +
  //             'scale(' + (scale).toFixed(3) + ')'
  //     }
  //   }
  // }

  self.updateBoxFromTag = function (box, tagName) {
    const layer = self.findTaggedLayer(tagName)
    if (layer) {
      const box2 = layer.layerElement.getBBox()
      let parent = layer
      while (parent) {
        box2.x += parent.calculatedLeft
        box2.y += parent.calculatedTop
        parent = parent.parent
      }

      // console.log(tagName, layer, box, box2, m)
      return box2
    } else {
      return box
    }
  }

  self.updateElementsSizeAndPosition = function (left, top, width, height) {
    base.updateElementsSizeAndPosition(left, top, width, height)
    if (isFinite(left) && isFinite(top)) {
      // if (settings._pos.childOffsetLeft) {
      //   left += settings._pos.childOffsetLeft
      // }

      // if (settings._pos.childOffseTop) {
      //   top += settings._pos.childOffsetTop
      // }

      SvgHelper.setAttributeValues(self.layerElement, {
        transform: 'translate(' + left + ' ' + top + ')'
      })
      SvgHelper.setAttributeValues(self.debugRect, { x: left, y: top, width, height })
    }

    if (settings.isRoot && self.box && self.lastPass) {
      try {
        // const start = performance.now()
        // Make sure it's in the DOM somewhere so we can measure
        let oldParent
        if (!self.containerElement.closest('body')) {
          oldParent = self.containerElement.parentElement || self.containerElement.parentNode
          document.body.appendChild(self.containerElement)
        }
        const tagToZoom = options.zoomTo
        if (tagToZoom) {
          if (self.containerElement?.firstElementChild) {
            self.containerElement.firstElementChild.style.transform = ''
          }
        }

        const box = (self.viewBox = self.layerElement.getBBox())
        if (tagToZoom) {
          self.zoomBox = this.updateBoxFromTag(box, tagToZoom)
        }

        self.leaveZoom()

        if (oldParent) {
          oldParent.appendChild(self.containerElement)
        }
        // const stop = performance.now()
        // console.log('getBBox: ',
        //   self.instanceId,
        //   (stop - start).toFixed(2),
        //   self.box,
        //   self.layerElement.getBBox())
      } catch (e) {
        console.error('Error measuring element: ', e)
      }

      self.createTagHovers()
    }
  }

  self.destroy = function () {
    if (!settings) {
      return
    }

    for (let i = 0; i < settings.layers.length; i++) {
      settings.layers[i]._owner.destroy()
    }
    settings = null
    base.destroy()
  }
}

AMGroupLayer.layerType = 'group'
AMLayerBase.register(AMTextLayer, AMShapeLayer, AMGroupLayer, AMContainLayer, AMImageLayer)

export default AMGroupLayer
