import React, { useContext, memo } from 'react'
import PropTypes from 'prop-types'

import Select from '@eig-builder/control-select'
import get from 'lodash/get'
import LogoMakerContext from 'logomaker/context/editor-context'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

const SelectControl = props => {
  const logoMakerContext = useContext(LogoMakerContext)
  return (
    <Grid container sx={{ justifyContent: 'space-between' }}>
      <Grid  size={6}>
        <Typography style={{ marginTop: '14px' }} variant='body1'>
          {props.label}
        </Typography>
      </Grid>
      <Grid  size={6}>
        <Select
          variant='outlined'
          name='select-input'
          options={props.options}
          value={get(logoMakerContext.editorTemplate, props.templateKey)}
          onChange={value => logoMakerContext.updateValueInTemplate(props.templateKey, value)}
        />
      </Grid>
    </Grid>
  )
}

SelectControl.propTypes = {
  templateKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired
}

export default memo(SelectControl)
