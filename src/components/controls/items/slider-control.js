import React, { useContext, memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import LogoMakerContext from 'logomaker/context/editor-context'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import get from 'lodash/get'
import set from 'lodash/set'
import debounce from 'lodash/debounce'

const StyledSlider = styled(Slider)`
  margin-top: 4px;
  padding: 10px 0px;
`

const SliderContainer = styled('div')`
  padding-right: ${({ theme }) => theme.spacing(2)};
`

const updateDebounce = debounce((logoMakerContext, templatekey, val) => {
  logoMakerContext.updateValueInTemplate(templatekey, val)
}, 300)
const TextControl = (props) => {
  const logoMakerContext = useContext(LogoMakerContext)
  const logoInstance = logoMakerContext.logoInstance || {}

  const currentValue = get(logoInstance.templateData, props.templateKey)

  const [value, setValue] = useState(currentValue)

  // make sure the change in the instance gets recorded to the slider default.
  useEffect(() => {
    if (logoInstance) {
      setValue(get(logoInstance.templateData, props.templateKey))
    }
  }, [logoInstance, props.templateKey, currentValue])

  return (
    <Grid container sx={{ justifyContent: 'space-between' }}>
      <Grid size={6}>
        <Typography sx={{ marginTop: '4px' }} variant='body1'>
          {props.label}
        </Typography>
      </Grid>
      <Grid size={6}>
        <SliderContainer>
          <StyledSlider
            size='small'
            onChange={(_, value) => {
              // this breaks all the update check in the logoinstance
              // set(logoInstance.templateData, props.templateKey, value)
              // logoInstance.updateLayout()
              // Use this instead
              logoInstance.update(set({}, props.templateKey, value))
              logoMakerContext.logoMaker.updateTemplateData(logoInstance.templateData)

              setValue(value)
              updateDebounce.cancel()
              updateDebounce(logoMakerContext, props.templateKey, value)
            }}
            value={value || props.min || 0}
            step={props.step || 0.01}
            min={props.min}
            max={props.max}
          />
        </SliderContainer>
      </Grid>
    </Grid>
  )
}

TextControl.propTypes = {
  templateKey: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
  step: PropTypes.number,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired
}

export default memo(TextControl)
