import React, { memo, useMemo, useContext } from 'react'
import Controls from './index'
import InteractableElement from '@eig-builder/control-interactable-element'
import LogoMakerContext from 'logomaker/context/editor-context'
import AMCore from 'core/logo-maker/amcore'

import Left from 'logomaker/images/left.png'
import Center from 'logomaker/images/center.png'
import Right from 'logomaker/images/right.png'

const images = [Left, Center, Right, Right]

const getLayoutOptions = (logoInstance, options) => {
  return options.map((option, i) => {
    return {
      value: option.toLowerCase(),
      label: option,
      item: () => (
        <InteractableElement>
          <div
            width='100%'
            height='100%'
            style={
              logoInstance && option === 'logo'
                ? {
                    background: AMCore.colorToStyle(logoInstance.getSloganBackground()),
                    color: AMCore.colorToStyle(logoInstance.getSloganColor())
                  }
                : {}
            }
            class={'card-text-' + option}
          >
            {option}
          </div>
        </InteractableElement>
      ),
      customComparitor: (current, option) => current && current.includes(option),
      customSetter: (oldValue, newValue) => newValue
    }
  })
}

const getLogoModeOptions = options =>
  options.map((option, i) => ({
    value: `${option}`.toLowerCase(),
    label: option,
    item: () => <img width='100%' height='100%' src={images[i % 4]} />,
    customComparitor: (current, option) => current && current.includes(option),
    customSetter: (oldValue, newValue) => newValue
  }))

const CardControls = () => {
  const logoModeOptions = useMemo(() => {
    return getLogoModeOptions(['full', 'content', 'brandName', 'symbol'])
  }, [])
  // const { editorTemplate, updateValueInTemplate } = useEditorContext()
  // const { logoInstance, editorTemplate } = useEditorContext()
  const logoMakerContext = useContext(LogoMakerContext)
  const logoInstance = logoMakerContext.logoInstance
  const colorModeOptions = useMemo(() => {
    return getLayoutOptions(logoInstance, ['white', 'black', 'logo'])
  }, [])

  if (!logoInstance) {
    return
  }

  return (
    <Controls.Container>
      <Controls.FieldWrapper>
        <React.Fragment>
          <Controls.ItemLayoutcontrol
            templateKey='layout.card.colorMode'
            label='Text color'
            options={colorModeOptions}
          />
          <Controls.ItemLayoutcontrol
            templateKey='layout.card.logoMode'
            label='Text alignment'
            options={logoModeOptions}
          />

        </React.Fragment>
      </Controls.FieldWrapper>
    </Controls.Container>
  )
}

export default memo(CardControls)
