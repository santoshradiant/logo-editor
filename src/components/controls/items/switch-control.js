import React, { useContext, memo } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import get from 'lodash/get'
import LogoMakerContext from 'logomaker/context/editor-context'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

import isNil from 'lodash/isNil'

const StyledLabel = styled(Typography)`
  margin-top: 10px;
`

const SwitchControl = (props) => {
  const logoMakerContext = useContext(LogoMakerContext)
  return (
    <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Grid  size={'grow'}>
        <StyledLabel variant='body1'>{props.label}</StyledLabel>
      </Grid>
      <Grid  size={'auto'}>
        <Switch
          // edge='end'
          dataElementId='logomaker.symbol-show'
          dataElementLabel='logo-symbol-show'
          onChange={(_, value) => {
            if (props.onToggle) {
              props.onToggle(value)
            } else {
              logoMakerContext.updateValueInTemplate(props.templateKey, value)
            }
          }}
          color={props.color}
          checked={!isNil(props.value) ? props.value : !!get(logoMakerContext.editorTemplate, props.templateKey)}
        />
      </Grid>
    </Grid>
  )
}

SwitchControl.propTypes = {
  templateKey: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
  color: PropTypes.string,

  // optional
  onToggle: PropTypes.func,
  value: PropTypes.any
}

SwitchControl.defaultProps = {
  color: 'primary'
}

export default memo(SwitchControl)
