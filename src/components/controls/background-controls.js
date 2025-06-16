import React, { useState } from 'react'
import Controls from './index'
// import DecorationLayout from 'core/logo-maker/layouts/decora§tion-layout'
import { useEditorContext } from 'logomaker/context/editor-context'

import Text from '@eig-builder/module-localization'

const BackgroundControls = () => {
  const { editorTemplate, updateValueInTemplate } = useEditorContext()
  // let style = editorTemplate.layout.decoration.style
  // let backgroundParams = DecorationLayout.prototype.variations.style[style].params

  const [previousStyle, setPreviousStyle] = useState('rectangle')
  // let initialBackground = {
  //   borderStyle: 'crossing',
  //   inverse: false,
  //   strokeWidth: 1.7
  // }

  const hasShape = () => editorTemplate.layout.decoration.style !== 'none'
  const shapeHasLine = () => {
    if (
      editorTemplate.background.inverse &&
      (editorTemplate.background.borderStyle === 'none' || editorTemplate.background.borderStyle === 'shadow')
    ) {
      return false
    }
    return true
  }

  const shapeHasMargin = () => {
    if (editorTemplate.background.inverse) {
      if (
        editorTemplate.background.borderStyle === 'none' ||
        editorTemplate.background.borderStyle === 'single' ||
        editorTemplate.background.borderStyle === 'shadow'
      ) {
        return false
      }
    } else if (editorTemplate.background.borderStyle !== 'double') {
      return false
    }
    return true
  }

  const shapeHasRoundness = () => {
    if (editorTemplate.layout.decoration.style.startsWith('circle')) {
      return false
    }
    if (editorTemplate.layout.decoration.style.startsWith('rect')) {
      if (
        editorTemplate.background.borderStyle === 'crossing' ||
        editorTemplate.background.borderStyle === 'topbottom' ||
        editorTemplate.background.borderStyle === 'leftright' ||
        editorTemplate.background.borderStyle === 'bottom' ||
        editorTemplate.background.borderStyle === 'shadow' ||
        editorTemplate.background.borderStyle === 'topleftbottomright' ||
        editorTemplate.background.borderStyle === 'bottomlefttopright'
      ) {
        return false
      }
    }
    return true
  }

  const toggleBackground = () => {
    if (hasShape()) {
      setPreviousStyle(editorTemplate.layout.decoration.style)
      // initialBackground = editorTemplate.background
      updateValueInTemplate('layout.decoration.style', 'none')
    } else {
      updateValueInTemplate('layout.decoration.style', previousStyle)
      // updateValueInTemplate('background', initialBackground)
    }
  }

  // const currentBorderStyle = editorTemplate.background.borderStyle
  const lineWidthLabel = <Text message='logomaker.segments.shape.lineWidth' />
  const strokeDistanceLabel = <Text message='logomaker.segments.shape.strokeDistance' />
  const cornerRadiusLabel = <Text message='logomaker.segments.shape.cornerRadius' />
  const showShapeLabel = <Text message='logomaker.segments.shape.showShape' />
  const filledLabel = <Text message='logomaker.segments.shape.filled' />
  return (
    <Controls.Container>
      <Controls.SwitchControl label={showShapeLabel} onToggle={toggleBackground} value={hasShape()} />
      {hasShape() && <Controls.SwitchControl label={filledLabel} templateKey='background.inverse' />}
      {hasShape() && shapeHasLine() && (
        <Controls.SliderControl label={lineWidthLabel} templateKey='background.strokeWidth' min={0.5} max={10} />
      )}
      {hasShape() && shapeHasMargin() && (
        <Controls.SliderControl
          label={strokeDistanceLabel}
          templateKey='background.strokeDistance'
          min={-1.5}
          max={1.5}
        />
      )}
      {hasShape() && shapeHasRoundness() && (
        <Controls.SliderControl label={cornerRadiusLabel} templateKey='background.borderRadius' min={0.0} max={3.0} />
      )}
    </Controls.Container>
  )
}

export default BackgroundControls
