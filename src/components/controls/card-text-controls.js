import React, { useMemo, memo } from 'react'
import Controls from './index'
import Text from '@eig-builder/module-localization'

import Left from 'logomaker/images/left.png'
import Center from 'logomaker/images/center.png'
import Right from 'logomaker/images/right.png'

const cardNameLabel = <Text message='logomaker.segments.card.name' />
const cardFunctionLabel = <Text message='logomaker.segments.card.function' />
const cardEmailLabel = <Text message='logomaker.segments.card.email' />
const cardPhoneLabel = <Text message='logomaker.segments.card.phone' />
const cardAddress1Label = <Text message='logomaker.segments.card.address1' />
const cardAddress2Label = <Text message='logomaker.segments.card.address2' />
const cardTitleSizeLabel = <Text message='logomaker.segments.card.titleSize' />
const cardTextSizeLabel = <Text message='logomaker.segments.card.size' />
const cardWwwLabel = <Text message='logomaker.segments.card.wwwTitle' />

const images = [Left, Center, Right]

const getLayoutOptions = options =>
  options.map((option, i) => ({
    value: `${option}`.toLowerCase(),
    label: option,
    item: () => <img width='100%' height='100%' src={images[i % 3]} />,
    customComparitor: (current, option) => current && current.includes(option),
    customSetter: (oldValue, newValue) => newValue
  }))

const CardControls = () => {
  const justifyOptions = useMemo(() => {
    return getLayoutOptions(['left', 'center', 'right'])
  }, [])
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
          </React.Fragment>
          <Controls.ItemLayoutcontrol
            templateKey='layout.card.justify'
            label='Text alignment'
            options={justifyOptions}
          />
        </Controls.Conditional>
      </Controls.FieldWrapper>
    </Controls.Container>
  )
}

export default memo(CardControls)
