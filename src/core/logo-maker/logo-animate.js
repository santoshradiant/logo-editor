let unique = 1

class LogoAnimate {
  constructor (el) {
    let allPaths = []
    const maskPaths = []

    const scan = (el, inMask, inDefs) => {
      if (!el) {
        return
      }
      for (const child of el.children) {
        if (!child) {
          continue
        }
        if (child.getTotalLength) {
          const pathInfo = {
            path: child,
            styleName: ''
          }
          if (inMask) {
            maskPaths.push(pathInfo)
          } else {
            if (!inDefs) {
              allPaths.push(pathInfo)
            }
          }
        } else {
          if (child.nodeName === 'use') {
            const refValue = child.attributes['xlink:href'].nodeValue
            let elRef
            if (refValue.startsWith('#')) {
              elRef = document.getElementById(refValue.substring(1))
            } else {
              elRef = document.querySelector(refValue)
            }
            if (elRef && elRef.getTotalLength) {
              const pathInfo = {
                path: child,
                styleName: ''
              }
              child.getTotalLength = elRef.getTotalLength.bind(elRef)
              allPaths.push(pathInfo)
            }
          }
        }
        scan(child, inMask || child.nodeName === 'mask', inDefs || child.nodeName === 'defs')
      }
    }

    scan(el, false, false)
    allPaths = [...allPaths, ...maskPaths]

    let styleStr = ''
    let ix = 0
    let interDelay = 0.0
    const interDelayInc = 0.08
    const animateTime = 1
    let totalAnimateTime = 0
    // let inMask = false

    for (const pathInfo of allPaths) {
      const path = pathInfo.path
      const style = window.getComputedStyle(path)
      let pLen = 0
      try {
        pLen = path?.getTotalLength?.()
      } catch (error) {
        pLen = 0
      }
      const len = pLen + 3
      const strokeColor = style.stroke
      const strokeWidth = style.strokeWidth
      const fillColor = style.fill
      const startStrokeColor = strokeColor === 'none' ? fillColor : strokeColor

      const styleName = (pathInfo.styleName = 'path-animation-' + unique++ + '-' + ix++)
      const myDelay = interDelay
      interDelay += (interDelayInc * len) / 800

      // Do masks after rest
      // if (maskPaths.length && pathInfo === maskPaths[0]) {
      //   interDelay += 1.0
      //   // inMask = true
      // }

      const myAnimateTime = animateTime // Math.max(animateTime * len / 500, animateTime * 2.0)
      totalAnimateTime = Math.max(totalAnimateTime, myDelay + myAnimateTime)
      styleStr += `
      .${styleName} {
        stroke-dasharray: ${len};
        stroke-dashoffset: ${len};
        stroke-width: 3;
        stroke: ${strokeColor};
        fill: ${fillColor === 'none' ? 'none' : 'rgba(0, 0, 0, 0)'};
        animation: dash-${styleName} ${myAnimateTime}s linear forwards;
        animation-delay: ${myDelay}s;
      }

      @keyframes dash-${styleName} {
        33% {
          stroke: ${startStrokeColor};
        }
        66% {
          fill: ${fillColor === 'none' ? 'none' : 'rgba(0, 0, 0, 0)'};
          stroke-width: 1.5;
        }
        100% {
          fill: ${fillColor};
          stroke-width: ${strokeColor === 'none' ? 0 : strokeWidth};
          stroke-dashoffset: 0;
        }
      }`
      path.classList.add(styleName)
    }

    const style = document.createElement('style')
    style.innerHTML = styleStr
    el.appendChild(style)
    for (const pathInfo of allPaths) {
      pathInfo.path.classList.add(pathInfo.styleName)
    }

    let timeout
    this.remove = () => {
      style.remove()
      for (const pathInfo of allPaths) {
        pathInfo.path.classList.remove(pathInfo.styleName)
      }
      delete el.dataLogoAnimate
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
    }
    timeout = setTimeout(this.remove, 1000 * totalAnimateTime + 350)
    el.dataLogoAnimate = this
  }
}

export default LogoAnimate
