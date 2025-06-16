import React, { memo, useMemo, useContext } from 'react'
import Controls from './index'
// import Text from '@eig-builder/module-localization'
// import Button from '@mui/material/Button'

import Style1 from 'logomaker/images/card_style_1.svg'
import Style2 from 'logomaker/images/card_style_2.svg'
import Style3 from 'logomaker/images/card_style_3.svg'
import PortraitImage from 'logomaker/images/orientation_portrait.svg'
import LandscapeImage from 'logomaker/images/orientation_landscape.svg'

import LogoMakerContext from 'logomaker/context/editor-context'
// import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import InteractableElement from '@eig-builder/control-interactable-element'

const styleImages = [Style1, Style2, Style3]
const orientationImages = [PortraitImage, LandscapeImage]

const getStyleLayoutOptions = options =>
  options.map((option, i) => ({
    value: `${option}`.toLowerCase(),
    label: option,
    item: () => (
      <InteractableElement>
        <img width='100%' height='100%' style={{ padding: '14px 4px 7px 4px' }} src={styleImages[i % 3]} />
      </InteractableElement>
    ),
    customComparitor: (current, option) => current && current.includes(option),
    customSetter: (oldValue, newValue) => newValue
  }))

const getOrientationLayoutOptions = options =>
  options.map((option, i) => ({
    value: `${option}`.toLowerCase(),
    label: option,
    item: () => (
      <InteractableElement>
        <div style={{ width: '48px', height: '48px' }}>
          <center>
            <img
              style={{
                position: 'absolute',
                transform: 'translate(-50%,-50%)',
                left: '50%',
                top: '50%'
              }}
              src={orientationImages[i % 3]}
            />
          </center>
        </div>
      </InteractableElement>
    ),
    customComparitor: (current, option) => current && current.includes(option),
    customSetter: (oldValue, newValue) => newValue
  }))

const CardControls = () => {
  // const { editorTemplate, updateValueInTemplate } = useEditorContext()
  // const { logoInstance, editorTemplate } = useEditorContext()
  const logoMakerContext = useContext(LogoMakerContext)
  const logoInstance = logoMakerContext.logoInstance
  const editorTemplate = logoMakerContext.editorTemplate
  const cardOptions = useMemo(() => {
    return getStyleLayoutOptions(['card1', 'card2', 'card3'])
  }, [])
  const orientationOptions = useMemo(() => {
    return getOrientationLayoutOptions(['portrait', 'landscape'])
  }, [])

  if (!logoInstance) {
    return
  }

  const symbolAvailable = editorTemplate.layout.symbol.position !== 'none'
  const showSymbol = editorTemplate.layout.card.showSymbol || editorTemplate.layout.card.showSymbol === 'true'
  const toggleSymbol = value => {
    logoMakerContext.updateValueInTemplate('layout.card.showSymbol', value)
    logoMakerContext.triggerVariationsUpdate()
  }

  return (
    <Controls.Container>
      <Controls.FieldWrapper>
        <React.Fragment>
          {/* <Text message='logomaker.segments.card.showSideLabel' />
        <Button
          variant='outlined'
          color='primary'
          onClick={() => logoInstance.showCardLayout(true, true) }
          dataElementLocation={DataElementLocations.LEFT_RAIL}
          dataElementLabel='logo-card--showfront-button'
          dataElementId='logomaker-editor-card-showfront-button'
        >
          <Text message='logomaker.segments.card.showFront' />
        </Button>
        <Button
          variant='outlined'
          color='primary'
          onClick={() => logoInstance.showCardLayout(true, false) }
          dataElementLocation={DataElementLocations.LEFT_RAIL}
          dataElementLabel='logo-card--showback-button'
          dataElementId='logomaker-editor-card-showfront-button'
        >
          <Text message='logomaker.segments.card.showBack' />
        </Button> */}
          <Controls.ItemLayoutcontrol templateKey='layout.card.style' label='Card style' options={cardOptions} />
          <Controls.ItemLayoutcontrol
            templateKey='layout.card.orientation'
            label='Orientation'
            options={orientationOptions}
          />
          {symbolAvailable && <Controls.SwitchControl label='Show symbol' value={showSymbol} onToggle={toggleSymbol} />}
        </React.Fragment>
      </Controls.FieldWrapper>
    </Controls.Container>
  )
}

export default memo(CardControls)
