const svgNamespace = 'http://www.w3.org/2000/svg'
const xlinkNamespace = 'http://www.w3.org/1999/xlink'

class SvgHelper {
  static createElement (type, ...children) {
    const element = document.createElementNS(svgNamespace, type)

    if (type === 'svg') {
      element.setAttribute('xmlns', svgNamespace)
      element.style.overflow = 'visible'
    }

    for (let i = 0; i < children.length; i++) {
      element.appendChild(children[i])
    }

    return element
  }

  static setAttributeValues (element, props) {
    if (!element) {
      return
    }

    if (!element.dataAttributeValues) {
      element.dataAttributeValues = {}
    }

    const setCached = (key, value) => {
      const lastValue = element.dataAttributeValues[key]
      if (!Object.prototype.hasOwnProperty.call(element.dataAttributeValues, key) || lastValue !== value) {
        element.dataAttributeValues[key] = value
        if (value === undefined) {
          element.removeAttribute(key, value)
        } else {
          if (key.startsWith('xlink:')) {
            element.setAttributeNS(xlinkNamespace, key, value)
          } else {
            element.setAttribute(key, value)
          }
        }
      }
    }

    for (const propName of Object.keys(props)) {
      const prop = props[propName]
      // let propReplaced = propName.replace(/([A-Z])/g, '-$1').toLowerCase()
      // if (propReplaced !== propName) {
      //   console.log(propReplaced, ',', propName)
      // }

      setCached(propName, prop)
      // if (propName === 'href' && element.tagName === 'image') {
      //   element.setAttributeNS(xlinkNamespace, prop.toLowerCase(), prop)
      // } else {
      //   setCached(propName.replace(/([A-Z])/g, '-$1').toLowerCase(), prop)
      // }
    }
  }

  static getTransformMatrix (svg, el) {
    let m = el.getScreenCTM()

    // This is a correction for firefox that has a different opinion about the matrix
    if (el.getTransformToElement) {
      m = el.getTransformToElement(svg)
      m.e -= svg.viewBox.baseVal.x
      m.f -= svg.viewBox.baseVal.y
    }
    return m
  }

  // Calculate the bounding box of an element with respect to its parent element
  // https://stackoverflow.com/questions/10623809/get-bounding-box-of-element-accounting-for-its-transform
  // And updeted it because chrome removed a function that was used there
  static transformedBoundingBox (svg, el) {
    const bb = el.getBBox()
    const m = SvgHelper.getTransformMatrix(svg, el)

    if (m) {
      // Create an array of all four points for the original bounding box
      const pts = [svg.createSVGPoint(), svg.createSVGPoint(), svg.createSVGPoint(), svg.createSVGPoint()]

      pts[0].x = bb.x
      pts[0].y = bb.y
      pts[1].x = bb.x + bb.width
      pts[1].y = bb.y
      pts[2].x = bb.x + bb.width
      pts[2].y = bb.y + bb.height
      pts[3].x = bb.x
      pts[3].y = bb.y + bb.height

      // Transform each into the space of the parent,
      // and calculate the min/max points from that.
      let xMin = Infinity
      let xMax = -Infinity
      let yMin = Infinity
      let yMax = -Infinity
      for (const pt of pts) {
        const pt2 = pt.matrixTransform(m)
        xMin = Math.min(xMin, pt2.x)
        xMax = Math.max(xMax, pt2.x)
        yMin = Math.min(yMin, pt2.y)
        yMax = Math.max(yMax, pt2.y)
      }

      // Update the bounding box with the new values
      bb.x = xMin
      bb.width = xMax - xMin
      bb.y = yMin
      bb.height = yMax - yMin
    }
    return bb
  }

  static colorSvg (el, color) {
    if (!el) {
      return
    }
    const scan = (el, inMask) => {
      for (const child of el.children) {
        if (!child) {
          continue
        }

        // if (child.getTotalLength) {
        if (!inMask) {
          const style = window.getComputedStyle(child)
          if (child.getAttribute('stroke') && style.stroke && style.stroke !== 'none') {
            // child.stroke = color
            SvgHelper.setAttributeValues(child, { stroke: color })
          }
          if (child.getAttribute('fill') && style.fill && style.fill !== 'none') {
            SvgHelper.setAttributeValues(child, { fill: color })
            // child.fill = color
          }
        }
        // }
        scan(child, inMask || child.nodeName === 'mask')
      }
    }
    scan(el, false)
  }

  static getLoaderSvg () {
    return `
    <!-- By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL -->
    <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
                <stop stop-color="#fff" stop-opacity="0" offset="0%"/>
                <stop stop-color="#fff" stop-opacity=".631" offset="63.146%"/>
                <stop stop-color="#fff" offset="100%"/>
            </linearGradient>
        </defs>
        <g fill="none" fill-rule="evenodd">
          <circle fill="none" cx="18" cy="18" r="18"></circle>
          <g transform="translate(1 1)">
                <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)" stroke-width="2">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="0.9s"
                        repeatCount="indefinite" />
                </path>
                <circle fill="#fff" cx="36" cy="18" r="1">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="0.9s"
                        repeatCount="indefinite" />
                </circle>
            </g>
        </g>
    </svg>
    `
  }

  static AddLoaders (el, textStr) {
    for (let ix = 0; ix < textStr.length; ix++) {
      const grp = SvgHelper.createElement('g')
      SvgHelper.setAttributeValues(grp, { transform: `scale(1.5) translate(${ix * 30.0 + 2.5},0)` })
      el.appendChild(grp)
      let c = textStr.charCodeAt(ix)
      if ((c > 47 && c < 58) || ((c &= 0xdf) < 91 && c > 63)) {
        grp.innerHTML = SvgHelper.getLoaderSvg()
      }
    }
  }
}

export default SvgHelper
