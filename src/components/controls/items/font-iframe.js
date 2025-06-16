/* eslint-disable no-use-before-define */
// eslint-disable-next-line no-unused-vars
// eslint-disable-line no-unused-vars
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class FontIframe extends React.Component {
  static propTypes = {
    fontObj: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    active: PropTypes.bool,
    className: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = { hovered: false }
  }

  getParameterByName (name, url) {
    name = name.replace(/[[\]]/g, '\\$&')
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  createCSS (fontUrl, fontName) {
    const fontSize = '18px'
    return `@import url('${fontUrl}');
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}');
      src: url('${fontUrl}') format('embedded-opentype'),
           url('${fontUrl}') format('woff'),
           url('${fontUrl}') format('truetype');
  }
    * { margin-left: 5px; margin: 0;box-sizing: border-box;font-family: "${fontName}";line-height: 32px;color: black;font-size: ${fontSize};}body {cursor: pointer;padding: 4px 6px;overflow: hidden;}`
  }

  createIframeSrc (fontUrl, fontName) {
    const family = fontName || this.getParameterByName('family', fontUrl)
    const css = this.createCSS(fontUrl, fontName)
    // const iframe = <iframe />

    return `data:text/html,<!DOCTYPE html><html><head>
    <link href="${fontUrl}" rel="stylesheet">
    <style>${css}</style></head><body>${family}</body></html>`
  }

  render () {
    const { fontObj } = this.props
    const { hovered } = this.state
    const iframeSrc = this.createIframeSrc(fontObj.url, fontObj.name)
    const classes = classNames(`${this.props.className} popover-font`, {
      active: this.props.active
    })

    return (
      <div
        className={classes}
        onClick={this.props.onClick}
        onMouseEnter={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
        disable-close-popover='true'
        style={{
          height: '100%',
          position: 'relative'
        }}
      >
        <div
          onClick={this.props.onClick}
          style={{
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            position: 'absolute'
          }}
        />
        <iframe
          style={{
            height: '100%',
            border: 'none'
          }}
          className={hovered ? 'hovered' : ''}
          src={iframeSrc}
        />
      </div>
    )
  }
}

export default FontIframe
