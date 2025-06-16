import React from 'react'
import Controls from './index'
import Text from '@eig-builder/module-localization'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

const fontStyleLabel = <Text message='logomaker.segments.name.fontStyle' />
const name1Label = (
  <>
    <Text message='logomaker.segments.name.label' /> 1
  </>
)
const name2Label = (
  <>
    <Text message='logomaker.segments.name.label' /> 2
  </>
)
const fontSizeLabel = <Text message='logomaker.segments.name.fontSize' />
const letterSpacingLabel = <Text message='logomaker.segments.name.letterSpacing' />
const lineHeightLabel = <Text message='logomaker.segments.name.lineHeight' />

const FontControls = () => (
  <Controls.Container>
    <Typography variant='h3'>Brandname</Typography>
    <Controls.FontsControl label={fontStyleLabel} templateKey='brand1' />
    <Controls.FontSelectorControl label={name1Label} target='brand1' />
    <Controls.FontSelectorControl label={name2Label} target='brand2' />
    <Controls.SliderControl label={fontSizeLabel} templateKey='font.brand1.size' min={0.5} max={2} />
    <Controls.SliderControl label={letterSpacingLabel} templateKey='font.brand1.letterSpacing' min={0.9} max={2} />
    <Controls.SliderControl label={lineHeightLabel} templateKey='font.brand1.lineSpacing' min={0.5} max={1.5} />

    <Divider className='my-4' />

    <div className='mb-4'>
      <Typography variant='h3' gutterBottom>
        Slogan
      </Typography>
      <Controls.Conditional templateKey='text.slogan'>
        <React.Fragment>
          <Controls.FontSelectorControl label='Font' target='slogan' />
          <Controls.SliderControl label='Font size' templateKey='font.slogan.size' min={0.5} max={2} />
          <Controls.SliderControl label='Letter spacing' templateKey='font.slogan.letterSpacing' min={0.5} max={2} />
          <Controls.SliderControl label='Line height' templateKey='font.slogan.lineSpacing' min={0.5} max={2} />
        </React.Fragment>
      </Controls.Conditional>
    </div>
  </Controls.Container>
)

export default FontControls
