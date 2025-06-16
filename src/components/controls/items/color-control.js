import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import AMCore from 'core/logo-maker/amcore'

import get from 'lodash/get'

import LogoMakerContext from 'logomaker/context/editor-context'

import { styled } from '@mui/material/styles'

import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Text from '@eig-builder/module-localization'

import { mdDown } from '@eig-builder/core-utils/helpers/mobile-detection-helper'
import { checkBackground } from 'logomaker/helpers/color-helper'
import CheckIcon from '@mui/icons-material/Check'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { ApplyCancel, Ok } from '@eig-builder/module-modals/helpers'
import ModalContext from '@eig-builder/module-modals/context'
import { ColorControlContext } from '../color-control-context'

const Bold = styled(Text)`
  font-weight: bold;
`

const TRANSISION_TIME = '150ms'

const StatusTypes = {
  SHAPE_LOW_CONTRAST: 'shape_low_contrast',
  SHAPE_ELEMENTS_LOW_CONTRAST: 'shape_elements_low_contrast',
  SHAPE_CONFLICT: 'shape_conflict',
  SHAPE_ELEMENTS_CONFLICT: 'shape_elements_conflict',
  SHAPE_BACKGROUND_CONFLICT: 'shape_background_conflict'
}

const statusOptions = {
  1: {
    type: StatusTypes.SHAPE_LOW_CONTRAST,
    allowed: true,
    title: 'Caution: Low contrast',
    tooltip: (
      <>
        <Text message='logomaker.colorWarnings.warning1_1' /> <Bold message='logomaker.colorWarnings.warning1_bold' />{' '}
        <Text message='logomaker.colorWarnings.warning1_2' />
      </>
    )
  },
  2: {
    type: StatusTypes.SHAPE_CONFLICT,
    allowed: true,
    title: 'Caution: Swapping colors',
    tooltip: <Text message='logomaker.colorWarnings.warning2' />
  },
  3: {
    type: StatusTypes.SHAPE_ELEMENTS_CONFLICT,
    allowed: true,
    title: 'Caution: Swapping colors',
    tooltip: <Text message='logomaker.colorWarnings.warning3' />
  },
  4: {
    type: StatusTypes.SHAPE_BACKGROUND_CONFLICT,
    allowed: false,
    title: 'Action not supported',
    tooltip: <Text message='logomaker.colorWarnings.warning4' />
  },
  5: {
    type: StatusTypes.SHAPE_ELEMENTS_LOW_CONTRAST,
    allowed: true,
    title: 'Caution: Low contrast',
    tooltip: (
      <>
        <Text message='logomaker.colorWarnings.warning5_1' /> <Bold message='logomaker.colorWarnings.warning5_bold' />{' '}
        <Text message='logomaker.colorWarnings.warning5_2' />
      </>
    )
  }
}

const Container = styled('div')`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`

const ColorLabel = styled('div')`
  display: flex;
  align-items: center;
  width: 5em;
`

const ColorValues = styled('div')`
  display: inline-flex;

  min-width: calc(24px * 4);
  width: 100%;
  max-width: calc(34px * 4);
`

const ColorWrapper = styled('div')`
  position: relative;
  width: 100%;
  padding-top: 25%;
  margin: ${({ theme }) => `${theme.spacing(2)} 0`};
`

const ColorGroup = styled('div')`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;

  border-radius: ${({ theme }) => `${theme.shape.borderRadius}px`};
  overflow: hidden;
  display: flex;
  align-items: flex-end;

  /* boxshadow around the "whole" colorgroup */
  &:after {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    box-shadow: ${({ theme }) =>
    `inset 0 0 0 1px ${theme.palette.border.main}, inset 0 1px 2px ${theme.palette.border.main}`};
    pointer-events: none;
  }

  /* every colorblock */
  > div {
    height: 100%;
    cursor: pointer;
    display: inline-block;
  }
`

const baseDiv = styled('div')`
  border-top-left-radius: ${props => (props.first ? '4px' : '0')};
  border-bottom-left-radius: ${props => (props.first ? '4px' : '0')};

  border-top-right-radius: ${props => (props.last ? '4px' : '0')};
  border-bottom-right-radius: ${props => (props.last ? '4px' : '0')};

  border-top: ${({ theme }) => `1px solid ${theme.palette.border.main}`};
  border-bottom: ${({ theme }) => `1px solid ${theme.palette.border.main}`};
  border-left: ${({ first, theme }) => (first ? `1px solid ${theme.palette.border.main}` : '0')};
  border-right: ${({ last, theme }) => (last ? `1px solid ${theme.palette.border.main}` : '0')};
`

const ColorBlock = styled(baseDiv)`
  background: ${props => props.color};
  height: 100%;
  width: ${props => (props.totalItems ? '25%' : '0')};
  position: relative;
  cursor: pointer;
  :hover {
    /* padding: 3px; */
    border: ${({ selected, theme }) => (!selected ? 'none' : `3px solid ${theme.palette.primary.main}`)};
    box-shadow: ${({ selected, theme }) => (!selected ? 'none' : `inset 0 0 0 2px ${theme.palette.white.main}`)};
  }
`

const SelectedColorBlock = styled(baseDiv)`
  transition: left ease-in-out ${TRANSISION_TIME};
  width: ${props => (props.totalItems ? '25%' : '0')};
  height: 100%;
  position: absolute;
  top: 0;
  will-change: left;
  left: ${props => (props.totalItems ? `${25 * props.colorIndex}%` : '0')};
  box-shadow: ${({ theme }) =>
    `0 0 0 2px ${theme.palette.primary.main}, inset 0 0 0 2px ${theme.palette.white.main}, 0 3px 6px ${theme.palette.border.main}`};

  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  font-size: 18px;
`

const iconSize = mdDown() ? 16 : 18

const switchIndex = index =>
  ({
    0: 2,
    1: 3,
    2: 0,
    3: 1
  }[index])

const ColorControl = props => {
  const isMobile = useIsMobile()
  const logoMakerContext = useContext(LogoMakerContext)
  const { dispatch } = useContext(ModalContext)
  const { displayedWarnings, setDisplayedWarnings } = useContext(ColorControlContext)
  const selectedColor = switchIndex(get(logoMakerContext.editorTemplate, props.templateKey))
  const colors = get(logoMakerContext.editorTemplate, 'color.palette')
  const [status, setStatus] = useState()
  const setInTemplate = value => {
    logoMakerContext.updateValueInTemplate(props.templateKey, value)
  }

  const getStatusCode = (templateKey, index) => {
    return get(
      logoMakerContext.editorTemplate,
      `color.restrictions.${templateKey.replace('color.', '')}.${index}.reason`
    )
  }

  const [firstTimeSelected, setFirstTimeSelection] = useState(false)
  const totalItems = props.options.length

  const getIconColor = index => {
    const rgbColors = colors[index] || {}
    const rgbObject = {
      r: rgbColors[0],
      g: rgbColors[1],
      b: rgbColors[2]
    }
    const lightBackground = checkBackground(rgbObject)

    if (lightBackground) {
      return 'rgb(0, 0, 0, .9)'
    }
    return 'rgb(255, 255, 255)'
  }

  const colorGroup = (
    <ColorGroup>
      {props.options.map((option, i) => {
        const index = option.value
        const selected = index === selectedColor
        const statusCode = statusOptions[getStatusCode(props.templateKey, index)]
        const isAllowedToApply = statusCode?.allowed ?? true

        if (selected && !firstTimeSelected) {
          setFirstTimeSelection(true)
        }

        const applyColor = () => setInTemplate(index)

        const onClick = () => {
          // save color --> selectedColor changes --> 'icon selected color' changes as well because of re-render
          if (isMobile && switchIndex(selectedColor) !== index && statusCode) {
            if (!isAllowedToApply) {
              Ok({
                title: statusCode.title,
                content: statusCode.tooltip,
                ok: () => {}
              })(dispatch)
            } else if (displayedWarnings.includes(statusCode.type)) {
              applyColor()
            } else {
              ApplyCancel({
                title: statusCode.title,
                content: statusCode.tooltip,
                apply: applyColor
              })(dispatch)
              setDisplayedWarnings(previous => [...previous, statusCode.type])
            }
          } else {
            isAllowedToApply && applyColor()
          }
        }

        return (
          <ColorBlock
            first={i === 0}
            last={totalItems === i + 1}
            key={`${props.templateKey}_${index}`}
            color={AMCore.colorToHex(colors[index])}
            selected={colors[selectedColor]}
            onClick={onClick}
            totalItems={totalItems}
            onMouseEnter={() => setStatus(statusCode)}
            onMouseLeave={() => {
              if (status === statusCode) {
                setStatus(null)
              }
            }}
          />
        )
      })}
    </ColorGroup>
  )

  return (
    <Container>
      <ColorLabel>
        <Typography variant='body1'>{props.label}</Typography>
      </ColorLabel>
      <ColorValues>
        <ColorWrapper>
          {status ? (
            <Tooltip
              disableTriggerFocus
              sx={{  fontSize: '14px' }}
              title={status.tooltip}
              placement='right'
            >
              {colorGroup}
            </Tooltip>
          ) : (
            colorGroup
          )}
          <SelectedColorBlock
            colorIndex={selectedColor}
            first={selectedColor === 0}
            last={selectedColor === totalItems - 1}
            totalItems={totalItems}
          >
            <CheckIcon size={iconSize} htmlColor={getIconColor(switchIndex(selectedColor))} />
          </SelectedColorBlock>
        </ColorWrapper>
      </ColorValues>
    </Container>
  )
}

ColorControl.propTypes = {
  templateKey: PropTypes.string.isRequired,
  label: PropTypes.any.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.object.isRequired
    })
  ).isRequired
}

export default ColorControl
