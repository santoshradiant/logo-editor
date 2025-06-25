import React, { memo, useMemo } from 'react'
import Controls from './index'
import Text from '@eig-builder/module-localization'

import get from 'lodash/get'
import { useEditorContext } from 'logomaker/context/editor-context'
import Divider from '@mui/material/Divider'

import Left from 'logomaker/images/left.png'
import Center from 'logomaker/images/center.png'
import Right from 'logomaker/images/right.png'

import InteractableElement from '@eig-builder/control-interactable-element'
import Typography from '@mui/material/Typography'

const sloganTextLabel = <Text message='logomaker.segments.slogan.name' />
const sloganFontSizeLabel = <Text message='logomaker.segments.slogan.size' />
const sloganLineCountLabel = <Text message='logomaker.segments.slogan.lineCount' />
const sloganLetterSpacingLabel = <Text message='logomaker.segments.slogan.spacing' />
const sloganLineHeightLabel = <Text message='logomaker.segments.slogan.lineHeight' />

const images = [Left, Center, Right]

const layoutSettings = {
  left: '-fill',
  center: '-fill',
  right: '-fill'
}

const lineOptions = Object.values(layoutSettings)

const getLayoutOptions = options =>
  options.map((option, i) => ({
    value: `${option}`.toLowerCase(),
    label: option,
    item: props => (
      <InteractableElement {...props}>
        <img width='100%' height='100%' style={{ padding: '12px 2px' }} src={images[i]} />
      </InteractableElement>
    ),
    customComparitor: (current, option) => current.includes(option),
    customSetter: (oldValue, newValue) =>
      lineOptions.some(option => oldValue.includes(option)) ? newValue + layoutSettings[newValue] : newValue
  }))

const SloganControls = () => {
  const { logoInstance, editorTemplate, updateValueInTemplate } = useEditorContext()
  let sloganWidth = 0.5
  try {
    if (logoInstance) {
      sloganWidth = logoInstance.getSloganWidth()
    }
  } catch (ex) {
    // console.trace(ex)
  }

  const sloganLineTemplateKey = 'layout.slogan.style'
  const currentShowLine = get(editorTemplate, sloganLineTemplateKey)

  const showLine = `${currentShowLine}`.includes('-short') || `${currentShowLine}`.includes('-fill')

  const toggleLine = () => {
    if (!showLine) {
      updateValueInTemplate(sloganLineTemplateKey, currentShowLine + layoutSettings[currentShowLine])
    } else {
      let value = currentShowLine
      lineOptions.forEach(option => {
        value = value.replace(option, '')
      })
      updateValueInTemplate(sloganLineTemplateKey, value)
    }
  }

  const sloganOptions = useMemo(() => {
    return getLayoutOptions(['Left', 'Center', 'Right'])
  }, [])

  return (
    <Controls.Container>
      <Controls.FieldWrapper>
        <Controls.TextControlWithUndo max={{ value: 40, helperText: 30 }} label={sloganTextLabel} templateKey='text.slogan' />
      </Controls.FieldWrapper>
      <Controls.Conditional templateKey='text.slogan'>
        <React.Fragment>
          <Controls.FieldWrapper>
            <Controls.SliderControl
              label={sloganLineCountLabel}
              templateKey='layout.slogan.lineCount'
              min={1}
              max={3}
              step={1}
            />
          </Controls.FieldWrapper>
          <Controls.FieldWrapper>
            <Controls.SliderControl label={sloganFontSizeLabel} templateKey='font.slogan.size' min={0.5} max={2} />
          </Controls.FieldWrapper>
          <Controls.FieldWrapper>
            <Controls.SliderControl
              label={sloganLetterSpacingLabel}
              templateKey='font.slogan.letterSpacing'
              min={0.5}
              max={2}
            />
          </Controls.FieldWrapper>
          <Controls.FieldWrapper>
            <Controls.SliderControl
              label={sloganLineHeightLabel}
              templateKey='font.slogan.lineSpacing'
              min={0.5}
              max={2}
            />
          </Controls.FieldWrapper>
          <Divider />
          {sloganWidth < 0.99 && (
            <Controls.ItemLayoutcontrol
              templateKey='layout.slogan.style'
              label='Alignment'
              options={sloganOptions}
              enabled={sloganWidth === 1.0 ? 'false' : 'false'}
            />
          )}
          {sloganWidth < 0.99 ? (
            <Controls.FieldWrapper>
              <Controls.SwitchControl label='Show line' value={showLine} onToggle={toggleLine} enabled='false' />
            </Controls.FieldWrapper>
          ) : (
            <Typography className='pt-3'>
              <Text message='logomaker.segments.alignment.disabled' />
            </Typography>
          )}
        </React.Fragment>
      </Controls.Conditional>
    </Controls.Container>
  )
}

export default memo(SloganControls)
