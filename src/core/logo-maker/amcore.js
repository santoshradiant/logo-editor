function AMCore() {
  const self = this
  self.nop = function () {}

  self.getBrowser = function () {
    const ua = navigator.userAgent
    let tem
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || []
      return {
        name: 'IE',
        version: tem[1] || ''
      }
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR|Edge\/(\d+)/)
      if (tem != null) {
        return {
          name: 'Opera',
          version: tem[1]
        }
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
    if ((tem = ua.match(/version\/([\d.]+)/i)) != null) {
      M.splice(1, 1, tem[1])
    }
    return {
      name: M[0],
      version: M[1]
    }
  }

  self.checkOlder = function (browser, version) {
    const browserInfo = self.getBrowser()
    if (browser.toLowerCase() === browserInfo.name.toLowerCase()) {
      const checkVersion = version
        .split('.')
        .map((x) => '0'.repeat(5 - x.length) + x.toString())
        .join('.')
      const realVersion = browserInfo.version
        .split('.')
        .map((x) => '0'.repeat(5 - x.length) + x.toString())
        .join('.')
      return realVersion < checkVersion
    }
    return false
  }

  self.checkValue = function (obj, name) {
    if (!Object.hasOwnProperty.call(obj, name)) return false
    if (obj[name] === null) return false
    if (obj[name] === undefined) return false
    if (isNaN(obj[name])) return false
    return true
  }

  self.validateNumbers = function () {
    for (let i = 0; i < arguments.length; i++) {
      if (!window.isFinite(arguments[i])) {
        return false
      }
    }
    return true
  }

  self.intOrDef = function (obj, method, def) {
    if (self.checkValue(obj, method)) {
      const val = parseInt(obj[method])
      return isNaN(val) ? def : val
    } else {
      return def
    }
  }

  self.floatOrDef = function (obj, method, def) {
    if (self.checkValue(obj, method)) {
      const val = parseFloat(obj[method])
      return isNaN(val) ? def : val
    } else {
      return def
    }
  }

  self.getEnvironment = function () {
    if (window.location.href.indexOf('://localhost') !== -1) {
      return 'localhost'
    }
    if (window.location.href.indexOf('.dev.') !== -1) {
      return 'dev'
    }
    if (window.location.href.indexOf('.test.') !== -1) {
      return 'test'
    }
    if (window.location.href.indexOf('.accept.') !== -1) {
      return 'accept'
    }
    return 'production'
  }

  self.childCheck = function (par, el) {
    if (Array.isArray(el)) {
      for (const el2 of el) {
        if (!el2.parentNode) {
          par.appendChild(el2)
        }
      }
    } else {
      if (!el?.parentNode || el.parentNode !== par) {
        if (el instanceof Node) {
          par?.appendChild(el)
        }
      }
    }
  }

  self.removeChildCheck = function (el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  }

  self.removeAllChildren = function (el) {
    let fc
    /* eslint no-cond-assign: "off" */
    while ((fc = el.firstChild)) {
      el.removeChild(fc)
    }
  }

  const deCamelRegEx = new RegExp('([A-Z])', 'g')

  function deCamelFunc(a) {
    return '-' + a.toLowerCase()
  }

  self.hasStyle = function (url) {
    for (let i = 0; i < document.head.children.length; i++) {
      if (document.head.children[i].href === url) {
        return true
      }
    }
    return false
  }

  self.setStyle = function (element, style) {
    self.extend(element.style, style)
    return element
  }

  self.includeStyle = function (url, type) {
    if (!self.hasStyle(url)) {
      const link = document.createElement('LINK')
      link.rel = ' stylesheet'
      link.href = url
      link.type = type || 'text/css'
      document.head.appendChild(link)

      return link
    }
  }

  self.createChild = function (par, tagName, classNames) {
    const el = document.createElement(tagName)
    const styleSplitRegEx = new RegExp('[\\s\\+]+')
    const classList = classNames.split(styleSplitRegEx)
    el.classList.add('amreset')
    for (let j = 0; j < classList.length; j++) {
      el.classList.add(classList[j])
    }
    if (arguments.length > 2) {
      const params = []
      params.push(el)
      params.push.apply(params, Array.prototype.slice.call(arguments, 2))
    }
    if (par) {
      self.childCheck(par, el)
    }

    return el
  }

  self.setAttr = function (el, attr) {
    for (const a in attr) {
      el.setAttribute(a, attr[a])
    }
  }

  self.createChildAttr = function (par, type, attr) {
    for (let i = 1; i < arguments.length - 1; i += 2) {
      self.setAttr(self.createChild(par, arguments[i]), arguments[i + 1])
    }
  }

  self.assignCheck = function (obj, name, val) {
    if (Array.isArray(val)) {
      const destArr = obj[name]
      let changed = val.length !== destArr.length
      if (changed) {
        destArr.length = val.length
      }

      for (let i = 0; i < val.length; i++) {
        if (val[i] !== destArr[i]) {
          changed = true
          destArr[i] = val[i]
        }
      }

      return changed
    } else {
      if (obj[name] !== val) {
        obj[name] = val
        return true
      } else {
        return false
      }
    }
  }

  self.extend = function (a) {
    for (let i = 1; i < arguments.length; i++) {
      const b = arguments[i]
      if (b) {
        for (const opt in b) {
          if (Object.hasOwnProperty.call(b, opt)) {
            a[opt] = b[opt]
          }
        }
      }
    }
    return a
  }

  self.inherit = function (obj, baseType) {
    baseType.apply(obj, Array.prototype.slice.call(arguments, 2))
    return self.extend({}, obj)
  }

  self.extendRecursive = function (a, b, deleteNull, noOverwrite) {
    const assignVal = function (a, opt, val) {
      if (val === null && deleteNull) {
        delete a[opt]
      } else {
        if (val === undefined) {
          return
        }
        if (Array.isArray(val)) {
          if (noOverwrite && Object.hasOwnProperty.call(a, opt)) {
            return
          }

          if (!Object.hasOwnProperty.call(a, opt) || !Array.isArray(a[opt]) || a[opt] === undefined) {
            a[opt] = []
          } else {
            a[opt].length = 0
          }

          for (let i = 0; i < val.length; i++) {
            assignVal(a[opt], i, val[i])
          }
        } else {
          if (typeof val === 'object') {
            if (!Object.hasOwnProperty.call(a, opt) || typeof a[opt] !== 'object') {
              a[opt] = {}
            }
            self.extendRecursive(a[opt], val, deleteNull, noOverwrite)
          } else {
            if (!(noOverwrite && Object.hasOwnProperty.call(a, opt))) {
              a[opt] = val
            }
          }
        }
      }
    }

    if (b) {
      for (const opt in b) {
        if (Object.hasOwnProperty.call(b, opt) && opt[0] !== '_') {
          assignVal(a, opt, b[opt])
        }
      }
    }
    return a
  }

  self.clone = function (a) {
    return JSON.parse(JSON.stringify(a))
  }

  function properKeys(obj) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        properKeys(obj[i])
      }
    } else if (typeof obj === 'object') {
      for (let k in obj) {
        if (Object.hasOwnProperty.call(obj, k)) {
          const val = obj[k]
          if (k[0] <= 'Z') {
            delete obj[k]
            k = k[0].toLowerCase() + k.substr(1)
            obj[k] = val
          }

          properKeys(val)
        }
      }
    }
  }

  self.properNames = function (obj) {
    properKeys(obj)
  }

  self.triggerDOMUpdate = function (element) {
    /* eslint-disable no-unused-expressions */
    element.offsetHeight
    /* eslint-enable no-unused-expressions */
  }

  self.setText = function (el, text) {
    if (text) {
      if (el.innerText !== undefined) {
        el.innerText = text
      } else {
        el.textContent = text
      }
    }
  }

  self.getText = function (el) {
    return el.textContent
  }

  self.show = function (el, doShow) {
    if (doShow === false) {
      self.hide(el)
      return
    }

    if (el.amshow) {
      el.amshow()
    } else if (el.classList) {
      // SVG has no claslist in ie
      el.classList.remove('amhidden')
    } else {
      const old = el.getAttribute('class') || ''
      el.setAttribute('class', old.replace('amhidden', '').trim())
    }
  }

  self.hide = function (el) {
    if (el.amhide) {
      el.amhide()
    } else if (el.classList) {
      // SVG has no claslist in ie
      el.classList.add('amhidden')
    } else {
      let old = el.getAttribute('class') || ''
      if (old.indexOf('amhidden') === -1) {
        // TODO: whole words regex
        old += ' amhidden'
      }
      el.setAttribute('class', old.trim())
    }
  }

  self.onePixelGif = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  // self.updateColors({ back1: '#000000', back2: '#202020', back3: '#404040', front1: 'white', front2: 'red' });
  const localUrlRegEx = new RegExp(
    '(^data\\:|^blob\\:|^file\\:|\\:\\/\\/localhost|vdi\\d{1,2}\\.dream|\\.dev$|\\.dev\\/)'
  )
  // var localUrlRegEx = new RegExp('(^data|^blob|^file|vdi??\\.)\\:');
  self.isLocalUrl = function (url) {
    return localUrlRegEx.test(url)
  }

  const dataUrlRegEx = new RegExp('(^data\\:|^blob\\:|^file\\:)')
  // var localUrlRegEx = new RegExp('(^data|^blob|^file|vdi??\\.)\\:');
  self.isDataUrl = function (url) {
    return dataUrlRegEx.test(url)
  }

  const urlSplitRegEx = new RegExp('^(https?:|)\\/\\/([^\\:\\/\\?#]+)\\:?(\\d*)', 'i')
  self.isCrossOriginURL = function (url) {
    const parts = url.match(urlSplitRegEx)
    if (
      parts &&
      ((parts[1] !== '' && parts[1] !== window.location.protocol) ||
        parts[2] !== window.location.hostname ||
        parts[3] !== window.location.port)
    ) {
      return true
    }

    return false
  }

  self.convertFileToDataURL = function (file, callback, param) {
    const fileToRead = file
    const callBackParam = param
    const fileReader = new window.FileReader()
    fileReader.onload = fileReader.onerror = function (data) {
      callback(fileToRead, data.srcElement ? data.srcElement.result : data.currentTarget.result, callBackParam)
    }
    fileReader.readAsDataURL(fileToRead)
  }

  self.svgNs = 'http://www.w3.org/2000/svg'

  self.hexToBytes = function (hex) {
    if (!hex || !hex.length || hex.length <= 1) {
      return []
    }

    const result = []

    if (hex[0] === '#' || hex[0] === 'x') {
      hex = hex.slice(1)
    }

    for (let i = 0; i < hex.length / 2; i++) {
      result.push(parseInt(hex.substr(i * 2, 2), 16))
    }

    return result
  }

  self.colorToStyle = function (a) {
    if (Array.isArray(a)) {
      if (a.length === 3) {
        return self.colorToHex(a)
        // return 'rgb(' + a.join(',') + ')'
      } else {
        return 'rgba(' + a.join(',') + ')'
      }
    } else {
      if (a !== null && typeof a === 'object' && Object.hasOwnProperty.call(a, 'r')) {
        if (Object.hasOwnProperty.call(a, 'a')) {
          return 'rgba(' + a.r + ',' + a.g + ',' + a.b + ',' + a.a + ')'
        } else {
          return self.colorToHex(a)
          // return 'rgb(' + a.r + ',' + a.g + ',' + a.b + ')'
        }
      } else {
        return a
      }
    }
  }

  self.colorToHex = function (clr) {
    let result = '#'
    for (let i = 0; i < Math.min(4, clr.length); i++) {
      if (clr[i] !== undefined) {
        result += ('0' + clr[i].toString(16)).substr(-2)
      }
    }
    return result
  }

  self.toUrlVars = function (obj) {
    return Object.keys(obj)
      .map(function (key) {
        return (
          encodeURIComponent(key) + '=' + encodeURIComponent(Array.isArray(obj[key]) ? obj[key].join(',') : obj[key])
        )
      })
      .join('&')
  }

  self.getLightness = function (clr) {
    return clr[0] * 0.299 + clr[1] * 0.587 + clr[2] * 0.114
  }

  self.gammaToLinear = function (clr) {
    // Screen space uses non-linear values so we normalize them to a value between 0-1 in linear space for calculations
    return [Math.pow(clr[0] / 255, 1.0 / 2.2), Math.pow(clr[1] / 255, 1.0 / 2.2), Math.pow(clr[2] / 255, 1.0 / 2.2)]
  }

  self.linearToGamma = function (clr) {
    // Screen space uses non-linear values so we normalize them to a value between 0-1 in linear space for calculations
    return [Math.pow(clr[0], 2.2) * 255, Math.pow(clr[1], 2.2) * 255, Math.pow(clr[2], 2.2) * 255]
  }

  self.normalizeColor = function (clr) {
    // Screen space uses non-linear values so we normalize them to a value between 0-1 in linear space for calculations
    return [clr[0] / 255, clr[1] / 255, clr[2] / 255]
  }

  self.getContrast = function (clr1, clr2) {
    // Gets the perceived contrast between two colors calculating the 3D distance between the normalized, weighted and "gamma removed" RGB values
    // Updated 2019-09-30, removed gamma since gamma is perceived the contrast should be on the value with gamma
    // Updated 2020-06-08, more balanced made lighness count for more

    const ca = this.normalizeColor(clr1)
    const cb = this.normalizeColor(clr2)

    const la = this.getLightness(clr1) / 255.0
    const lb = this.getLightness(clr2) / 255.0

    // Calculate delta and apply RGB weights
    const delta = [
      Math.abs(ca[0] - cb[0]), // * 0.299,
      Math.abs(ca[1] - cb[1]), // * 0.587,
      Math.abs(ca[2] - cb[2]) // * 0.114
    ]

    // Calculate distance between colors
    const distance = Math.sqrt(delta[0] * delta[0] * 0.3 + delta[1] * delta[1] * 0.45 + delta[2] * delta[2] * 0.25)

    // Extra Average with lightness because color change does not do as much for contrast change
    const contrastDist = distance * 0.4 + 0.6 * Math.abs(la - lb)

    return Math.min(Math.pow(contrastDist, 1.3), 1.0)
  }

  self.escapeRegExp = function (str) {
    return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1')
  }
  self.replaceAll = function (str, find, replace) {
    return str.replace(new RegExp(self.escapeRegExp(find), 'g'), replace)
  }

  function setCrossBrowserStyle(element, style) {
    for (const key in style) {
      const csskey = key.replace(deCamelRegEx, deCamelFunc)
      element.style[csskey] = style[key]
      element.style['-webkit-' + csskey] = style[key]
    }
  }

  self.setTransform = function (el, transform) {
    setCrossBrowserStyle(el, { transform: transform })
  }

  self.setTransformOrigin = function (el, transform) {
    setCrossBrowserStyle(el, { transformOrigin: transform })
  }

  self.setTransition = function (el, transition) {
    setCrossBrowserStyle(el, { transition: transition })
  }

  self.animate = function (element, style, transition, duration, onFinish, delay) {
    // cancel running animations
    if (element._animationTimeouts) {
      if (element._animationTimeouts.animation) {
        clearTimeout(element._animationTimeouts.animation)
      }
      if (element._animationTimeouts.finish) {
        clearTimeout(element._animationTimeouts.finish)
      }
      delete element._animationTimeouts
    }

    // defaults
    duration = duration === undefined ? 500 : duration
    transition = duration + 'ms ' + (transition || 'ease-in-out')
    delay = duration === 0 ? 0 : delay > 0 ? delay : 50
    const restore = element.style.transition

    // start animation
    element._animationTimeouts = {}
    element._animationTimeouts.animation = setTimeout(
      function (el, style, transition, onFinish, restore) {
        self.setTransition(el, transition)
        for (const key in style) {
          switch (key) {
            case 'transform':
              self.setTransform(el, style[key])
              break
            case 'transition':
              self.setTransition(el, style[key])
              break
            default:
              el.style[key] = style[key]
          }
        }
        // onFinish handler
        el._animationTimeouts.finish = setTimeout(
          function (el, onFinish, restore) {
            delete el._animationTimeouts
            self.setTransition(el, restore) // restore initial transition
            if (onFinish) onFinish(el)
          }.bind(self, el, onFinish, restore),
          duration + 1
        )
      }.bind(self, element, style, transition, onFinish, restore),
      delay
    )
  }

  self.fadeIn = function (element, onFinish, duration, transition, delay) {
    transition = transition || 'ease-in'
    duration = duration === undefined ? 250 : duration
    delay = delay === undefined ? 1 : delay
    element.style.opacity = 0
    self.animate(element, { opacity: 1 }, transition, duration, onFinish, delay)
  }

  self.fadeOut = function (element, onFinish, duration, transition, delay) {
    transition = transition || 'ease-out'
    duration = duration === undefined ? 50 : duration
    delay = delay === undefined ? 1 : delay
    self.animate(element, { opacity: 0 }, transition, duration, onFinish, delay)
  }

  self.blur = function (element, amount) {
    element._filter = element.style.filter
    setCrossBrowserStyle(element, { filter: 'blur(' + (amount || 3) + 'px)' })
  }
  self.unblur = function (element) {
    setCrossBrowserStyle(element, { filter: element._filter })
  }

  self.fixCrossDomain = function (url) {
    if (self.isLocalUrl(url)) {
      return url
    }

    return self.getImageProxyUrl(url, 4096, 4096)
  }

  self.getThumb = function (url, width, height) {
    return self.getImageProxyUrl(url, width, height)
  }

  self.getIndex = function (parent, child) {
    let idx = 0
    for (const i in parent) {
      if (child === parent[i]) {
        return idx
      }
      idx++
    }
    return -1
  }

  self.isMobile = function () {
    return window.innerWidth < 768
  }

  self.binSearch = function (arr, data) {
    let recurseCount = 0
    const maxRecurse = Math.log2(arr.length) + 1
    const bs = (arr, start, stop, data) => {
      if (stop < start) {
        return -1
      }

      if (recurseCount++ > maxRecurse) {
        console.error('binsearch recurse overflow!')
        return -1
      }

      const ix = start + ~~((stop - start) / 2)
      const dataAtIx = arr[ix]
      if (dataAtIx > data) {
        return bs(arr, start, ix - 1, data)
      } else {
        if (dataAtIx === data) {
          return ix
        } else {
          return bs(arr, ix + 1, stop, data)
        }
      }
    }
    return bs(arr, 0, arr.length - 1, data)
  }

  // Inject libraries in the head
  self.loadScript = function (url) {
    if (!Array.prototype.some.call(document.head.querySelectorAll('script'), (x) => x.src === url)) {
      const newScript = document.createElement('script')
      newScript.src = url
      document.head.appendChild(newScript)
    }
  }
}

window.AMCore = AMCore

export default new AMCore()
