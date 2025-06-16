import React, { useMemo } from 'react'
import NameControls from './name-controls'
import { EditorContext } from 'logomaker/index'
import LogoMaker from 'core/logo-maker/logo-maker'
import { styled } from '@mui/material/styles'
import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'
import LogoInstance from 'core/logo-maker/logo-instance'
import PropTypes from 'prop-types'
import SloganControls from './slogan-controls'
import SymbolControls from './symbol-controls'
import ColorControls from './color-controls'
import BackgroundControls from './background-controls'

const ControlsContainer = styled('div')`
  height: 100%;
  width: 100%;
  max-width: 360px;
  padding: 16px;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
`

const ControlsWrapper = ({ children }) => {
  const [editorTemplate, setEditorTemplate] = React.useState({
    text: {
      brandName: 'Brand name',
      slogan: 'Slogan'
    },
    color: {
      brand1: 1,
      brand2: 1,
      decoration: 2,
      palette: ['#FFFFFF', '#000000', '#292826', '#f9d342'],
      paletteDark: ['#000000', '#FFFFFF', '#292826', '#f9d342'],
      slogan: 1,
      symbol: 1
    },
    brand1: {
      letterSpacing: 1,
      lineSpacing: 1
    },
    brand2: {
      letterSpacing: 1,
      lineSpacing: 1
    },
    font: {
      brand1: {
        id: 'gf_Abril Fatface_400',
        letterSpacing: 1,
        lineSpacing: 1,
        size: 1
      },
      brand2: {
        id: 'gf_Abril Fatface_400',
        letterSpacing: 1,
        lineSpacing: 1,
        size: 1
      },
      slogan: {
        id: 'gf_Abril Fatface_400',
        letterSpacing: 1,
        lineSpacing: 1,
        size: 1
      },
      decoration: {
        id: 'poppinslight',
        slogan: {
          id: 'poppinslight',
          size: 1,
          lineSpacing: 1,
          letterSpacing: 1
        }
      }
    },
    layout: {
      brand: { alignment: 'vertical' },
      decoration: { style: 'none' },
      slogan: { style: 'center' },
      symbol: {
        position: 'none',
        decoration: 'none'
      }
    },
    symbol: {
      icon: {
        fontId: 'df_HelveticaNeueLTStd-Blk.otf',
        id: 'T',
        initials: 'T',
        spacing: 1,
        type: 'initials'
      },
      size: 1,
      spacing: 1
    },
    background: {}
  })

  const logoInstance = React.useMemo(() => new LogoInstance(editorTemplate), [])

  const logoMaker = useMemo(() => new LogoMaker({ initialWidth: 560, initialHeight: 410 }), [])

  const updateValueInTemplate = React.useCallback((key, value) => {
    const newTemplateDetails = cloneDeep(editorTemplate)
    if (typeof key !== 'string') {
      for (let i = 0; i < key.length; i += 2) {
        set(newTemplateDetails, key[i], key[i + 1])
      }
    } else {
      set(newTemplateDetails, key, value)
    }
    setEditorTemplate(newTemplateDetails)
  }, [])
  return (
    <ControlsContainer>
      <EditorContext.Provider value={{ editorTemplate, logoInstance, logoMaker, updateValueInTemplate }}>
        {children}
      </EditorContext.Provider>
    </ControlsContainer>
  )
}

ControlsWrapper.propTypes = {
  children: PropTypes.element
}

export const Name = () => (
  <ControlsWrapper>
    <NameControls />
  </ControlsWrapper>
)

export const Slogan = () => (
  <ControlsWrapper>
    <SloganControls />
  </ControlsWrapper>
)

export const Symbol = () => (
  <ControlsWrapper>
    <SymbolControls />
  </ControlsWrapper>
)

export const Colors = () => (
  <ControlsWrapper>
    <ColorControls />
  </ControlsWrapper>
)

export const Shape = () => (
  <ControlsWrapper>
    <BackgroundControls />
  </ControlsWrapper>
)

export default {
  title: 'Controls'
}
