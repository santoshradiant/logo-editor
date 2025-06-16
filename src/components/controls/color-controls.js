/* eslint-disable no-use-before-define */
import React, { useState, useContext, lazy, Suspense } from 'react'
import { styled } from '@mui/material/styles'

import ControlContainer from './items/control-container'

import Grid from '@mui/material/Grid2'

import Controls from './index'
import Text from '@eig-builder/module-localization'

import LogoMakerContext from 'logomaker/context/editor-context'
import AMCore from 'core/logo-maker/amcore'
import get from 'lodash/get'

import ColorsPopover from './colors-popover'
import ColorTheme from 'logomaker/config/color-theme.json'

import 'logomaker/lang'
import useToggle from 'hooks/useToggle'
import { Box, Skeleton } from '@mui/material'
const ColorPicker = lazy(() => import('@eig-builder/control-color-picker/container'))

export const brand1Label = (
  <>
    <Text message='logomaker.segments.name.label' /> 1
  </>
)
export const brand2Label = (
  <>
    <Text message='logomaker.segments.name.label' /> 2
  </>
)
export const sloganLabel = <Text message='logomaker.segments.slogan.label' />
export const backgroundLabel = <Text message='logomaker.segments.shape.label' />
export const symbolLabel = <Text message='logomaker.segments.symbol.label' />
const themeLabel = <Text message='logomaker.theme' />

const StyledColorsWrapper = styled('div')`
  padding: ${(props) => props.theme.spacing(2, 0)};
`

const ColorBlockContainer = styled('div')`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 8px 0;
  width: 100%;
  margin-top: ${(props) => props.theme.spacing(2)};

  > div {
    max-width: calc(25% - 0.5em);
    min-width: 34px;

    > * {
      margin: 0;
    }
  }
`

export const colorOptions = [
  {
    label: <>{themeLabel} 3</>,
    value: 2
  },
  {
    label: <>{themeLabel} 4</>,
    value: 3
  },
  {
    label: <>{themeLabel} 1</>,
    value: 0
  },
  {
    label: <>{themeLabel} 2</>,
    value: 1
  }
]

const getCurrentColorForPicker = (context) => (templateColorIndex) => {
  const palette = get(context.editorTemplate, 'color.palette')

  return AMCore.colorToHex(palette[templateColorIndex])
}

const updateColor = (context) => (color, templateColorIndex) => {
  context.updateValueInTemplate('color.palette.' + templateColorIndex, [color.rgb.r, color.rgb.g, color.rgb.b])
}

const ColorControls = () => {
  const logoMakerContext = useContext(LogoMakerContext)
  const [pickerId, setPickerId] = useState(null)
  const [colorBlockPos, setColorblockPos] = useState(null)
  const [openColorPopover, toggleColorPopover] = useToggle(false)

  const getColorPickers = (numberOfPickers) => {
    const colors = []
    for (let i = 0; i < numberOfPickers; i++) {
      colors.push(
        <ColorPicker
          key={`colorpicker-number-${i}`}
          templateColorIndex={i}
          color={getCurrentColorForPicker(logoMakerContext)(i)}
          showColorPicker={setPicker}
          openPicker={pickerId === i}
          colorBlockPos={colorBlockPos}
          updateColorOnApply={updateColor(logoMakerContext)}
          showButtons
          applyButtonAction={handleColorPickerClose}
          cancelButtonAction={setPicker}
          applyButtonLabel={<Text message='logomaker.colors.apply' />}
          cancelButtonLabel={<Text message='logomaker.colors.cancel' />}
        />
      )
    }

    return changeOrder(colors) // colors first, white and black at the end
  }

  const changeOrder = (array) => {
    return ([array[0], array[1], array[2], array[3]] = [array[2], array[3], array[0], array[1]])
  }

  // remember which color we are clicking on
  // so we can show only one ColorPicker
  const setPicker = (e, id) => {
    if (e) {
      setColorblockPos(e.currentTarget)
    } else {
      setColorblockPos(null)
    }
    setPickerId(id)
  }

  const handleColorPickerClose = (e, id) => {
    setPicker(e, id)
    logoMakerContext.triggerVariationsUpdate()
  }

  const setPaletteInTemplate = (category, palette) => {
    const paletteArray = palette.map(AMCore.hexToBytes)
    // REFACTOR -- will be overwritten by color.palette
    logoMakerContext.updateValueInTemplate('color.colorCategory', category)
    logoMakerContext.updateValueInTemplate('color.palette', paletteArray)
  }

  return (
    <ControlContainer>
      <ColorsPopover
        amount={6}
        open={openColorPopover}
        onClick={setPaletteInTemplate}
        colorTheme={ColorTheme}
        handleClose={() => toggleColorPopover(false)}
      >
        <Controls.ControlHeader
          title={<Text message='logomaker.theme' />}
          link={{
            title: <Text message='logomaker.segments.color.header.action' />,
            action: () => toggleColorPopover()
          }}
        />
      </ColorsPopover>
      {/* <Controls.InversionControl /> */}
      <Grid
        container
        sx={{
          marginTop: 1,
          marginBottom: 1
        }}
      >
        <ColorBlockContainer>{getColorPickers(4)}</ColorBlockContainer>
      </Grid>
      <Controls.ControlHeader title={<Text message='logomaker.segments.color.header.title' />} />
      <StyledColorsWrapper>
        <Controls.ColorControlContextProvider>
          <Controls.ColorControl label={brand1Label} templateKey='color.brand1' options={colorOptions} />
          <Controls.ColorControl label={brand2Label} templateKey='color.brand2' options={colorOptions} />
          <Controls.ColorControl label={sloganLabel} templateKey='color.slogan' options={colorOptions} />
          <Controls.ColorControl label={symbolLabel} templateKey='color.symbol' options={colorOptions} />
          <Controls.ColorControl label={backgroundLabel} templateKey='color.decoration' options={colorOptions} />
        </Controls.ColorControlContextProvider>
      </StyledColorsWrapper>
    </ControlContainer>
  )
}

export default ColorControls
