import React from 'react'
import PropTypes from 'prop-types'
import PreviewRender from 'core/logo-maker/previewmaker/preview-maker'

// Controls for debug UI render parameters
// let currentControls
const renderInspiration = (el, src, srcSettings, foreGroundImage, settings, animate, onLoad, dimensions) => {
  const previewUpdater = () => {
    if (!el.dataPreviewRender) {
      settings.imageSrc = foreGroundImage
      settings.dimensions = dimensions
      el.dataPreviewRender = new PreviewRender(el, src, settings, srcSettings)
      if (onLoad) {
        onLoad()
      }
      if (animate) {
        el.dataPreviewRender.animate(animate)
      }
      el.onclick = x => {
        // if (currentControls) {
        //   currentControls.close()
        //   currentControls.destroy()
        // }
        // currentControls = el.dataPreviewRender.showControls()
        if (animate) {
          el.dataPreviewRender.animate({
            ...animate,
            delay: 0
          })
        }
      }
    } else {
      el.dataPreviewRender.texCount = 0
    }
    el.dataPreviewRender.render()
  }
  if (el && foreGroundImage) {
    previewUpdater()
  }
}

const ImageComposer = ({ className, src, srcSettings, foreGroundImage, settings, animate, onLoad, dimensions }) => {
  return dimensions ? (
    <canvas
      className={className}
      ref={el => renderInspiration(el, src, srcSettings, foreGroundImage, settings, animate, onLoad, dimensions)}
    />
  ) : null
}

ImageComposer.propTypes = {
  animate: PropTypes.string,
  className: PropTypes.string.isRequired,
  dimensions: PropTypes.any,
  foreGroundImage: PropTypes.string.isRequired,
  onLoad: PropTypes.func,
  settings: PropTypes.object.isRequired,
  src: PropTypes.string.isRequired,
  srcSettings: PropTypes.string
}

export default ImageComposer
