import React, { memo } from 'react'
import PropTypes from 'prop-types'
import Text from '@eig-builder/module-localization'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

const ControlsTitle = ({ children }) => (
  <Grid
    container
    direction='row'
    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    className='pl-4 pr-3 py-2'
  >
    <Typography variant='h6'>
      <Text message='logomaker.controlsTitle' />
    </Typography>
    {children}
  </Grid>
)

ControlsTitle.propTypes = {
  children: PropTypes.node.isRequired
}

export default memo(ControlsTitle)
