import React, { useContext, memo } from 'react'
import LogoMakerContext from 'logomaker/context/editor-context'
import get from 'lodash/get'
import Controls from './index'
import Text from '@eig-builder/module-localization'
import { TextWrapper, MultilineSwitchWrapper } from './views'
import { logoIsReadonlyBrandLock } from '../../modules/application-config/features'

const brandNameLabel = <Text message='logomaker.segments.name.brandName' />
const capitalizeLabel = <Text message='logomaker.segments.name.capitalize' />
const fontSizeLabel = <Text message='logomaker.segments.name.fontSize' />
const letterSpacingLabel = <Text message='logomaker.segments.name.letterSpacing' />
const lineHeightLabel = <Text message='logomaker.segments.name.lineHeight' />
const duoColorPositionLabel = <Text message='logomaker.segments.name.duoColorPosition' />

const NameControls = () => {
  const logoMakerContext = useContext(LogoMakerContext)
  const brandName = get(logoMakerContext, 'editorTemplate.text.brandName')
  const multiLine = get(logoMakerContext, 'editorTemplate.layout.brand.alignment') === 'vertical'

  const noCapitalsInFont = () => {
    const brand1 = get(logoMakerContext, 'editorTemplate.font.brand1.category')
    const brand2 = get(logoMakerContext, 'editorTemplate.font.brand2.category')

    const disabled = ['handwritten']

    return !disabled.includes(brand1) || (brand2 && !disabled.includes(brand2))
  }

  return (
    <Controls.Container>
      <TextWrapper>
        <Controls.TextControlWithUndo
          label={brandNameLabel}
          locked={logoIsReadonlyBrandLock(logoMakerContext.selectedLogo, logoMakerContext.sku)}
          templateKey='text.brandName'
          max={{
            value: 40,
            helperText: 30
          }}
        />
      </TextWrapper>
      {// brandName has 2 words or more
      brandName && brandName.trim().split(' ').length > 1 && (
        <Controls.FieldWrapper>
          <MultilineSwitchWrapper>
            <Controls.SwitchControl
              label='Multiline'
              value={multiLine}
              onToggle={value => {
                if (!value) {
                  logoMakerContext.updateValueInTemplate([
                    'layout.brand.alignment',
                    'horizontal',
                    'font.brand1.lineSpacing',
                    1.0,
                    'font.brand1.letterSpacing',
                    1.0
                  ])
                } else {
                  logoMakerContext.updateValueInTemplate([
                    'layout.brand.alignment',
                    'vertical',
                    'font.brand1.lineSpacing',
                    1.0,
                    'font.brand1.letterSpacing',
                    1.0
                  ])
                }
              }}
            />
          </MultilineSwitchWrapper>
        </Controls.FieldWrapper>
      )}
      <Controls.Conditional condition={noCapitalsInFont()}>
        <Controls.FieldWrapper>
          <Controls.CapitalizeSwitchControl label={capitalizeLabel} templateKey='text.brandName' />
        </Controls.FieldWrapper>
      </Controls.Conditional>
      <Controls.FieldWrapper>
        <Controls.SliderControl
          label={duoColorPositionLabel}
          templateKey='font.brand1.duoColorPosition'
          min={0.0}
          max={1.0}
        />
      </Controls.FieldWrapper>
      <Controls.FieldWrapper>
        <Controls.SliderControl label={fontSizeLabel} templateKey='font.brand1.size' min={0.5} max={2} />
      </Controls.FieldWrapper>
      <Controls.FieldWrapper>
        <Controls.SliderControl label={letterSpacingLabel} templateKey='font.brand1.letterSpacing' min={0.5} max={2} />
      </Controls.FieldWrapper>
      <Controls.FieldWrapper>
        <Controls.SliderControl label={lineHeightLabel} templateKey='font.brand1.lineSpacing' min={0.5} max={1.5} />
      </Controls.FieldWrapper>
    </Controls.Container>
  )
}

export default memo(NameControls)
