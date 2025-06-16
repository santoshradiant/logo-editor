import AMCore from '../amcore'
// import SvgHelper from './../utils/svg-helper'

const functions = {}

function AMLayerBase (settings) {
  const self = this

  self.containerElement = null
  self.layerElement = null
  self.placements = []
  let options = null
  settings = AMCore.extendRecursive(
    settings || {},
    {
      position: {}
    },
    false,
    true
  )
  Object.defineProperty(settings, '_owner', {
    value: self,
    configurable: true,
    enumerable: false,
    writable: false
  })

  Object.defineProperty(settings, '_pos', {
    value: {},
    configurable: true,
    enumerable: false,
    writable: false
  })

  Object.defineProperty(self, 'settings', {
    configurable: true,
    value: settings,
    writable: false
  })

  self.getElement = function () {
    return null
  }

  self.calculatedLeft = 0.0
  self.calculatedTop = 0.0
  self.calculatedWidth = 1.0
  self.calculatedHeight = 1.0

  // self.hasColor = function () {
  //   return false
  // }

  self.childFunction = offset => {
    if (offset > 0) {
      console.error('error in template succesive childs not supported')
    } else {
      if (offset === 0) {
        return settings._pos
      }
      const parentSettings = settings._parent
      const myIndex = parentSettings.layers.indexOf(settings)
      if (myIndex + offset < 0) {
        console.error('error in template no previous child')
      } else {
        const pos = parentSettings.layers[myIndex + offset]._pos
        // console.log('pos in: ', pos)
        return pos
      }
    }
  }

  const relativeFromRegEx = /child\(([0-9,-]{1,4})\)(\.[\w,\s,(,),\-,+,*,.]{1,224}){0,1}$/gi

  function handleRelativeFrom (propName) {
    const pos = settings.position
    const _pos = settings._pos

    let fromProp = pos[propName + 'From']
    if (fromProp) {
      const parentSettings = settings._parent
      if (parentSettings && parentSettings.layers) {
        const myIndex = parentSettings.layers.indexOf(settings)
        if (myIndex === -1) {
          console.error('error in template no child of group for topFrom')
        } else {
          relativeFromRegEx.lastIndex = 0
          const vars = relativeFromRegEx.exec(fromProp)
          // if (!vars) {
          //  console.error('error in template no valid from found ', fromProp)
          // } else {
          {
            if (vars && !vars[2]) {
              fromProp += '.' + propName
            }
            let func = functions[fromProp] // _pos[propName + 'FromFunc']
            if (!func) {
              const FN = Function
              func = FN('child', 'template', 'return ' + fromProp)
              functions[fromProp] = func // _pos[propName + 'FromFunc'] = func
            }

            // TODO make this function robust
            // const childFunc = (offset) => {
            //   if (offset >= 0) {
            //     console.error('error in template succesive childs not supported')
            //   } else {
            //     if (myIndex + offset < 0) {
            //       console.error('error in template no previous child')
            //     } else {
            //       let pos = parentSettings.layers[myIndex + offset]._pos
            //       // console.log('pos in: ', pos)
            //       return pos
            //     }
            //   }
            // }
            _pos[propName] = func(self.childFunction, options.templateData)
            // console.log('func: ', fromProp)
            // console.log('result: ', _pos[propName])
          }
        }
      }
    }
  }

  function checkParentLeft (leftPx, pw) {
    if (settings._parent && AMCore.checkValue(settings._parent._pos, 'childOffsetLeft')) {
      return leftPx + settings._parent._pos.childOffsetLeft * pw
    }
    return leftPx
  }

  function checkParentTop (topPx, ph) {
    if (settings._parent && AMCore.checkValue(settings._parent._pos, 'childOffsetTop')) {
      return topPx + settings._parent._pos.childOffsetTop * ph
    }
    return topPx
  }

  self.getRootOffset = function () {
    const offset = {
      x: self.calculatedLeft || 0,
      y: self.calculatedTop || 0
    }
    let current = settings._parent
    while (current) {
      offset.x += current._owner.calculatedLeft || 0.0
      offset.y += current._owner.calculatedTop || 0.0
      if (current.isRoot) {
        return offset
      }
      current = current._parent
    }
    return offset
  }

  self.getRootLayer = function () {
    let current = settings._parent
    while (current) {
      if (current.isRoot) {
        return current._owner
      }
      current = current._parent
    }
  }

  self.getParentWidth = function () {
    let current = settings._parent
    while (current) {
      if (current._owner.isRoot) {
        // FIXME: This will never work, isRoot is a property of the settings, not of the layer object
        return current._owner.rootWidth
      }
      if (!current.position.autoWidth) {
        // || settings.position.smartLeft) {
        return current._owner.calculatedWidth
      }
      current = current._parent
    }
    if (settings.isRoot) {
      return settings.rootWidth
    } else {
      return 280
    }
  }

  self.getParentHeight = function () {
    let current = settings._parent
    while (current) {
      if (current._owner.isRoot) {
        // FIXME: This will never work, isRoot is a property of the settings, not of the layer object
        return current._owner.rootHeight
      }
      if (!current.position.autoHeight) {
        return current._owner.calculatedHeight
      }
      current = current._parent
    }
    if (settings.isRoot) {
      return settings.rootHeight
    } else {
      return 210
    }
  }

  self.getWidth = function () {
    return self.calculatedWidth / self.getParentWidth()
  }

  self.getHeight = function () {
    return self.calculatedHeight / self.getParentHeight()
  }

  self.getNestedPlacements = function () {
    const result = []
    if (self.placements.length > 0) {
      if (settings._pos && settings._pos.width > 0 && settings._pos.height > 0) {
        result.push(self.placements)
      }
    }
    if (settings.layers) {
      for (let i = 0; i < settings.layers.length; i++) {
        if (settings.layers[i]._owner) {
          Array.prototype.push.apply(result, settings.layers[i]._owner.getNestedPlacements())
        }
      }
    }
    return result
  }

  self.updateElementsSizeAndPosition = function (left, top, width, height) {
    self.calculatedLeft = left
    self.calculatedTop = top
    self.calculatedWidth = width
    self.calculatedHeight = height
    // if (
    //   self.maskCutOutRect &&
    //   self.parent &&
    //   AMCore.validateNumbers(self.parent.calculatedWidth, self.parent.calculatedHeight)
    // ) {
    //   const dw = width - self.parent.calculatedWidth
    //   const dh = height - self.parent.calculatedHeight
    //   const uncovered = Math.max(Math.abs(dw) / width, Math.abs(dh) / height)
    //   if (uncovered < 0.6) {
    //     SvgHelper.setAttributeValues(self.maskCutOutRect, {
    //       fill: 'rgb(51,51,51)',
    //       x: -2,
    //       y: -2,
    //       width: width + 4,
    //       height: height + 4
    //     })
    //   } else {
    //     SvgHelper.setAttributeValues(self.maskCutOutRect, {
    //       fill: 'rgb(25,25,25)',
    //       x: dw * 0.5 - 12, // self.calculatedLeft,
    //       y: dh * 0.5 - 12, // self.calculatedTop,
    //       width: self.parent.calculatedWidth + 24,
    //       height: self.parent.calculatedHeight + 24
    //     })
    //   }
    // }
    // if (self.shapes.length > 0) {
    //   if (!self.debugPaths || self.debugPaths.length !== self.shapes.length) {
    //     self.debugPaths = []
    //     self.debugPaths.length = self.shapes.length
    //     for (let ix = 0; ix < self.shapes.length; ix++) {
    //       self.debugPaths[ix] = SvgHelper.createElement('path')
    //     }
    //   }
    //   for (let ix = 0; ix < self.shapes.length; ix++) {
    //     const shape = self.shapes[ix]
    //     const offset = self.getRootOffset()
    //     const root = self.getRootLayer()
    //     if (ix === 0) {
    //       console.log('update shape: ', shape)
    //     }

    //     SvgHelper.setAttributeValues(self.debugPaths[ix],
    //       {
    //         transform: `translate(${(shape.offsetX * shape.scaleX + offset.x).toFixed(2)} ${(shape.offsetY * shape.scaleY + offset.y).toFixed(2)}) scale(${shape.scaleX.toFixed(2)} ${shape.scaleY.toFixed(2)})`,
    //         fill: '#8080ff20',
    //         stroke: '#8080ff80',
    //         'stroke-width': 0.1,
    //         d: shape.toPathStr()
    //       }) // 'M 0,10 L 0,10 L 20,10 L 10,20 Z' })
    //     AMCore.childCheck(root.layerElement, self.debugPaths[ix])
    //   }
    // }
  }
  self.traceIn = function () {}
  self.traceLog = function (s) {}
  self.traceOut = function () {}

  /* DEBUG code for tracing the draw calls place star(*) slash(/) after this line to activate
  self.traceIn = function () {
    self.posTrace = {
      type: settings.type,
      tag: settings.tag,
      // posIn: AMCore.clone(settings.position),
      // _posIn: AMCore.clone(settings._pos),
      ellapsed: -window.performance.now(),
      // log: [],
      children: []
    }

    if (settings._parent && settings._parent._owner && settings._parent._owner.posTrace) {
      settings._parent._owner.posTrace.children.push(self.posTrace)
    }
  }

  self.traceLog = function (s) {
    // if (self.posTrace) {
    //   self.posTrace.log.push(s)
    // }
  }

  self.traceOut = function () {
    // self.posTrace.posOut = AMCore.clone(settings.position)
    // self.posTrace._posOut = AMCore.clone(settings._pos)
    self.posTrace.ellapsed += window.performance.now()
    if (!settings._parent) {
      console.log(self.posTrace)
      window.lastTrace = self.posTrace
    }
  }
  /* end of debug code */

  self.updatePosition = function () {
    const lpt = s => {
      self.traceLog(s)
    }

    const pos = settings.position
    const _pos = settings._pos

    if (!self.layerElement) {
      return
    }
    const pw = self.getParentWidth()
    const ph = self.getParentHeight()

    // if (AMCore.checkValue(pos, 'actualWidth')) {
    //   pos.width = pos.actualWidth / pw
    // }

    // if (AMCore.checkValue(pos, 'actualHeight')) {
    //   pos.height = pos.actualHeight / ph
    // }

    // Temporary hack, TODO see if this can be done better
    let forceCenter = false

    // Size stuff
    _pos.width = pos.width
    _pos.height = pos.height
    if (settings.type !== 'group') {
      if (settings.linkedToParent) {
        if (settings.linkedToParent === 'aspect') {
          const parentAspect = settings._parent._pos.width / settings._parent._pos.height
          lpt('aspect size')
          if (pos.aspect > parentAspect) {
            _pos.width = settings._parent._pos.height
            _pos.height = settings._parent._pos.height
          } else {
            _pos.width = settings._parent._pos.width
            _pos.height = settings._parent._pos.width
          }
          forceCenter = true
          // TODO this doesn't work right
          // pos.centerLeft = 0.0
          // pos.centerTop = 0.0
          // pos.left = (settings._parent._pos.width - _pos.width) * 0.5
          // pos.top = (settings._parent._pos.height - _pos.height) * 0.5
        } else if (settings.linkedToParent === 'around') {
          _pos.width = (settings._parent._pos.width / this.getParentWidth()) * settings._parent._owner.getParentWidth()
          _pos.height =
            (settings._parent._pos.height / this.getParentHeight()) * settings._parent._owner.getParentHeight()
        } else {
          _pos.width = settings._parent._pos.width
          _pos.height = settings._parent._pos.height
        }
      } else {
        if (pos.autoWidth) {
          _pos.width = self.getWidth()
          lpt('autowidth: ' + _pos.width)
        }
        if (pos.autoHeight) {
          _pos.height = self.getHeight()
          lpt('autoHeight: ' + _pos.height)
        }
      }
    }

    handleRelativeFrom('width')
    handleRelativeFrom('height')
    if (AMCore.checkValue(pos, 'aspect')) {
      if (!AMCore.checkValue(_pos, 'width')) {
        _pos.width = (_pos.height * pos.aspect * ph) / pw
      } else {
        if (
          (AMCore.checkValue(pos, 'width') || pos.widthFrom) &&
          (AMCore.checkValue(pos, 'height') || pos.heightFrom)
        ) {
          const myAspect = _pos.width / _pos.height
          if (myAspect > pos.aspect) {
            _pos.width = (_pos.height * pos.aspect * ph) / pw
          } else {
            _pos.height = ((_pos.width / pos.aspect) * pw) / ph
          }
        } else {
          _pos.height = ((_pos.width / pos.aspect) * pw) / ph
        }
      }
    }

    let maxScale = 1.0
    // let extraTop = 0.0
    if (AMCore.checkValue(pos, 'maxWidth')) {
      if (_pos.width > pos.maxWidth) {
        maxScale = pos.maxWidth / _pos.width
      }
    }
    if (AMCore.checkValue(pos, 'maxHeight')) {
      if (_pos.height > pos.maxHeight) {
        maxScale = Math.min(maxScale, pos.maxHeight / _pos.height)
      }
    }
    if (maxScale < 1.0 || AMCore.checkValue(pos, 'scale')) {
      const scale = maxScale * pos.scale
      _pos.scale = scale
      // extraTop = _pos.height * (1.0 - scale) * 0.5
      _pos.width = _pos.width ? _pos.width * scale : 0
      _pos.height = _pos.height ? _pos.height * scale : 0
    }

    let widthPx = _pos.width ? _pos.width * pw : 0
    let heightPx = _pos.height ? _pos.height * ph : 0

    // Vertical position
    _pos.top = pos.top
    _pos.bottom = pos.bottom
    handleRelativeFrom('top')
    handleRelativeFrom('bottom')
    if (!AMCore.checkValue(_pos, 'height')) {
      // && !AMCore.checkValue(_pos, 'actualHeight')) {
      if (AMCore.checkValue(_pos, 'left') && AMCore.checkValue(_pos, 'right')) {
        _pos.height = _pos.bottom - _pos.top
        heightPx = _pos.height * ph
      }
    }

    if (pos.useBaseLine && self.textBaseLine) {
      const parentSettings = settings._parent
      const myIndex = parentSettings.layers.indexOf(settings)
      for (let i = myIndex - 1; i >= 0; i--) {
        const lr = parentSettings.layers[i]
        if (lr.type === 'text' && lr._owner.textBaseLine) {
          const hisBaseLine = lr._pos.top + lr._owner.textBaseLine * lr._pos.height
          // console.log('bl', hisBaseLine, self.textBaseLine, self.settings.text, lr.text)
          _pos.top = hisBaseLine - self.textBaseLine * _pos.height
          break
        }
      }
    }

    if (!AMCore.checkValue(_pos, 'top')) {
      if (AMCore.checkValue(_pos, 'bottom')) {
        _pos.top = _pos.bottom - _pos.height
      }
    }

    handleRelativeFrom('smartTop')
    handleRelativeFrom('centerTop')
    let topPx = _pos.top ? _pos.top * ph : 0
    if (AMCore.checkValue(pos, 'smartTop')) {
      _pos.top = pos.smartTop * (1.0 - _pos.height)
      topPx = _pos.top * ph
    }
    if (AMCore.checkValue(pos, 'centerTop')) {
      _pos.top = pos.centerTop - _pos.height * 0.5
      topPx = _pos.top * ph
    }
    if (AMCore.checkValue(_pos, 'top')) {
      _pos.top = topPx / ph
      _pos.bottom = _pos.top + _pos.height
      topPx = checkParentTop(topPx, ph)
    } else {
      _pos.top = 0
      _pos.bottom = _pos.height
    }

    // if (!AMCore.checkValue(pos, 'top') && !AMCore.checkValue(pos, 'bottom') &&
    //     !pos.hasOwnProperty('topFrom') && !pos.hasOwnProperty('bottomFrom') && Math.abs(extraTop) > 0.0001) {
    //   _pos.top += extraTop
    //   topPx = _pos.top * ph
    // }

    // Horizontal position
    _pos.left = pos.left
    _pos.right = pos.right
    handleRelativeFrom('left')
    handleRelativeFrom('right')
    if (!AMCore.checkValue(_pos, 'width')) {
      // && !AMCore.checkValue(_pos, 'actualWidth')) {
      if (AMCore.checkValue(_pos, 'left') && AMCore.checkValue(_pos, 'right')) {
        _pos.width = _pos.right - _pos.left
        widthPx = _pos.width * pw
      }
    }

    if (!AMCore.checkValue(_pos, 'left')) {
      if (AMCore.checkValue(_pos, 'right')) {
        _pos.left = _pos.right - _pos.width
      }
    }
    let leftPx = _pos.left ? _pos.left * pw : 0
    if (AMCore.checkValue(pos, 'smartLeft')) {
      _pos.left = pos.smartLeft * (1.0 - _pos.width)
      leftPx = _pos.left * pw
    }
    if (AMCore.checkValue(pos, 'centerLeft')) {
      _pos.left = pos.centerLeft - _pos.width * 0.5
      leftPx = _pos.left * pw
    }
    if (AMCore.checkValue(_pos, 'left')) {
      _pos.left = leftPx / pw
      _pos.right = _pos.left + _pos.width

      leftPx = checkParentLeft(leftPx, pw)
    } else {
      _pos.left = 0
      _pos.right = _pos.width
    }

    if (self.parent && forceCenter) {
      const dw = self.parent.calculatedWidth - widthPx
      const dh = self.parent.calculatedHeight - heightPx
      leftPx = dw * 0.5
      topPx = dh * 0.5
      _pos.left = leftPx / pw
      _pos.top = leftPx / pw
    }

    // if (settings.tag === 'brand-background') {
    //   console.log('result: ', pw, ph, self.parent, leftPx, topPx, widthPx, heightPx)
    // }

    if (AMCore.validateNumbers(leftPx, topPx, widthPx, heightPx)) {
      self.updateElementsSizeAndPosition(leftPx, topPx, widthPx, heightPx)
    } else {
      // console.log('number error ', self)
    }

    // if (settings.tag === 'brand1') {
    //   console.log('pos. ' + settings.tag + ':', _pos)
    //   console.log('_pos.' + settings.tag + ':', _pos)
    //   console.log('calc ' + settings.tag + ':', self.calculatedWidth, ',', self.calculatedHeight)
    // }
  }

  self.updateOptions = function (opt) {
    AMCore.extend(options, opt)
  }

  self.initialize = function (container, opt) {
    options = opt
    self.containerElement = container
    // self.updatePosition()
    self.layerElement.dataSettings = settings
  }

  self.destroy = function () {
    if (self.layerElement) {
      AMCore.removeChildCheck(self.layerElement)
      delete self.layerElement.dataSettings
      self.layerElement = null
    }
    Object.defineProperty(settings, '_owner', {
      value: null,
      configurable: true
    })
    settings = null
    Object.defineProperty(self, 'settings', {
      configurable: true,
      value: null,
      writable: false
    })
  }

  self.renderPos = {
    left: 0,
    top: 0,
    width: 400,
    height: 300
  }
}

const layerTypes = {}
AMLayerBase.register = function () {
  for (let i = 0; i < arguments.length; i++) {
    const layerClass = arguments[i]
    layerTypes[layerClass.layerType] = layerClass
  }
}

AMLayerBase.NewLayer = function (layerType, layerSettings) {
  try {
    return new layerTypes[layerType](layerSettings)
  } catch (exc) {
    console.error('Error creating layer!', layerType, layerSettings)

    layerType = 'group'
    // If you type ^ this string in the next line eslint destroys
    // it by replacing it with another problem. Classnames should
    // start with capitals, well guess what it's not a classname
    // THATS WHY I TYPED IT IN QUOTES TO BEGIN WITH ITS A KEY FROM A DEFINITION !!!
    return new layerTypes[layerType](layerSettings)
  }
}

export default AMLayerBase
