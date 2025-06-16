import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'
// import { DataElementLocations, DataElementTypes } from '@eig-builder/core-utils/helpers/tagging-helper'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid2'

import get from 'lodash/get'
import LogoMakerContext from 'logomaker/context/editor-context'

const StyledLabel = styled(Typography)`
  margin-top: 10px;
`

function hasLowerCase (str) {
  return /[a-z]/.test(str)
}

const CapitalizeSwitchControl = props => {
  const logoMakerContext = useContext(LogoMakerContext)
  const currentBrandName = get(logoMakerContext.editorTemplate, props.templateKey)
  const isCapitalized = currentBrandName && currentBrandName === currentBrandName.toUpperCase()

  const [savedBrandName, saveCurrentBrandName] = useState(currentBrandName)

  return (
    <Grid container sx={{justifyContent:'space-between'}}>
      <Grid size='grow'>
        <StyledLabel variant='body1'>{props.label}</StyledLabel>
      </Grid>
      <Grid size='auto'>
        <Switch
          edge='end'
          checked={isCapitalized}
          onChange={(_, value) => {
            saveCurrentBrandName(currentBrandName)
            const brandName = value
              ? currentBrandName.toUpperCase()
              : hasLowerCase(savedBrandName)
              ? savedBrandName
              : savedBrandName.toLowerCase()
            logoMakerContext.updateValueInTemplate(props.templateKey, brandName)
          }}
        />
      </Grid>
    </Grid>
  )
}

CapitalizeSwitchControl.propTypes = {
  templateKey: PropTypes.string.isRequired,
  label: PropTypes.object.isRequired
}

export default CapitalizeSwitchControl
