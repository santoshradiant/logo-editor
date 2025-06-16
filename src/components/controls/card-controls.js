import React, { memo, useMemo, useContext } from 'react'
import Controls from './index'
import Text from '@eig-builder/module-localization'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

import Left from 'logomaker/images/left.png'
import Center from 'logomaker/images/center.png'
import Right from 'logomaker/images/right.png'

import LogoMakerContext from 'logomaker/context/editor-context'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

const cardNameLabel = <Text message='logomaker.segments.card.name' />
const cardFunctionLabel = <Text message='logomaker.segments.card.function' />
const cardEmailLabel = <Text message='logomaker.segments.card.email' />
const cardPhoneLabel = <Text message='logomaker.segments.card.phone' />
const cardAddress1Label = <Text message='logomaker.segments.card.address1' />
const cardAddress2Label = <Text message='logomaker.segments.card.address2' />
const cardTitleSizeLabel = <Text message='logomaker.segments.card.titleSize' />
const cardTextSizeLabel = <Text message='logomaker.segments.card.size' />
const cardWwwLabel = <Text message='logomaker.segments.card.wwwTitle' />

// const cardLetterSpacingLabel = <Text message='logomaker.segments.card.spacing' />
// const cardLineHeightLabel = <Text message='logomaker.segments.card.lineHeight' />

// These controls need to be split up in
// Card text
//   Text fields
//     +Brand name (for card can be different than logo
//   Title Font Size <-> Text font Size can be 1 slider
//   Name function Size
//   Alignment left/center/right
//   Font selector for card fonts
// Card logo background
//   Color overlay/background: (none,black,lighten,logo decoration)
//   Use image yes/no
//   Image picker
//   Image overlay opacity 0-1 (if overlay <> none)
//   Variation area with example colors and images
// Card Layout front
//   Text color black/white/logo
//   Orientation: landscape portrait
//   Logo color: black/white/color
//   Logo part options
//     -none
//     -brandName,
//     -symbol
//     -brandName + symbol + slogan
//     -full Logo
//   Variation area for layouts
// Card Layout back
//   Same as layout front, but no Text options
//

const images = [Left, Center, Right]

const layoutSettings = {
  left: '-fill',
  center: '-short',
  right: '-fill'
}

const lineOptions = Object.values(layoutSettings)

const getLayoutOptions = options =>
  options.map((option, i) => ({
    value: `${option}`.toLowerCase(),
    label: option,
    item: () => <img width='100%' height='100%' src={images[i % 3]} />,
    customComparitor: (current, option) => current && current.includes(option),
    customSetter: (oldValue, newValue) =>
      lineOptions.some(option => oldValue.includes(option)) ? newValue + layoutSettings[newValue] : newValue
  }))

const CardControls = () => {
  // const { editorTemplate, updateValueInTemplate } = useEditorContext()
  // const { logoInstance, editorTemplate } = useEditorContext()
  const logoMakerContext = useContext(LogoMakerContext)
  const logoInstance = logoMakerContext.logoInstance
  const editorTemplate = logoMakerContext.editorTemplate
  const cardOptions = useMemo(() => {
    return getLayoutOptions(['card1', 'card2', 'card3'])
  }, [])
  const justifyOptions = useMemo(() => {
    return getLayoutOptions(['left', 'center', 'right'])
  }, [])
  const orientationOptions = useMemo(() => {
    return getLayoutOptions(['portrait', 'landscape'])
  }, [])

  const colorModeOptions = useMemo(() => {
    return getLayoutOptions(['white', 'black', 'logo'])
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
        <Controls.TextControl label={cardNameLabel} templateKey='text.name' />
        <br />
        <br />
        <Controls.TextControl label={cardFunctionLabel} templateKey='text.function' />
        <br />
        <br />
        <Controls.TextControl label={cardEmailLabel} templateKey='text.email' />
        <br />
        <br />
        <Controls.TextControl label={cardPhoneLabel} templateKey='text.phone' />
        <br />
        <br />
        <Controls.TextControl label={cardAddress1Label} templateKey='text.address1' />
        <br />
        <br />
        <Controls.TextControl label={cardAddress2Label} templateKey='text.address2' />
        <br />
        <br />
        <Controls.TextControl label={cardWwwLabel} templateKey='text.www' />
        <br />
        <br />

        <Controls.Conditional templateKey='text.email'>
          <React.Fragment>
            <Controls.FieldWrapper>
              <Controls.SliderControl label={cardTitleSizeLabel} templateKey='font.cardTitle.size' min={0.5} max={2} />
            </Controls.FieldWrapper>
            <Controls.FieldWrapper>
              <Controls.SliderControl label={cardTextSizeLabel} templateKey='font.card.size' min={0.5} max={2} />
            </Controls.FieldWrapper>
            {/* <Controls.FieldWrapper>
            <Controls.SliderControl
              label={cardLetterSpacingLabel} templateKey='font.card.letterSpacing' min={0.5}
              max={2}
            />`
          </Controls.FieldWrapper>
          <Controls.FieldWrapper>
            <Controls.SliderControl
              label={cardLineHeightLabel} templateKey='font.card.lineSpacing' min={0.5}
              max={2}
            />
          </Controls.FieldWrapper>
           */}
            <br />
            <Divider />
            <br />
            <Text message='logomaker.segments.card.showSideLabel' />
            <Button
              variant='outlined'
              color='primary'
              onClick={() => logoInstance.showCardLayout(true, true)}
              dataElementLocation={DataElementLocations.LEFT_RAIL}
              dataElementLabel='logo-card--showfront-button'
              dataElementId='logomaker-editor-card-showfront-button'
            >
              <Text message='logomaker.segments.card.showFront' />
            </Button>
            <Button
              variant='outlined'
              color='primary'
              onClick={() => logoInstance.showCardLayout(true, false)}
              dataElementLocation={DataElementLocations.LEFT_RAIL}
              dataElementLabel='logo-card--showback-button'
              dataElementId='logomaker-editor-card-showfront-button'
            >
              <Text message='logomaker.segments.card.showBack' />
            </Button>
            <Controls.ItemLayoutcontrol templateKey='layout.card.style' label='Card style' options={cardOptions} />
            {symbolAvailable && (
              <Controls.SwitchControl label='Show symbol' value={showSymbol} onToggle={toggleSymbol} />
            )}
            <Controls.ItemLayoutcontrol
              templateKey='layout.card.orientation'
              label='Orientation'
              options={orientationOptions}
            />
            <Controls.ItemLayoutcontrol
              templateKey='layout.card.justify'
              label='Text alignment'
              options={justifyOptions}
            />
            <Controls.ItemLayoutcontrol
              templateKey='layout.card.colorMode'
              label='Text color'
              options={colorModeOptions}
            />
          </React.Fragment>
        </Controls.Conditional>
      </Controls.FieldWrapper>
    </Controls.Container>
  )
}

export default memo(CardControls)
