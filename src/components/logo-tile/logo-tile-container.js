import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@mui/material/Grid2'

const LogoTileContainer = ({ children, ...props }) => (
  <Grid  size={{ xs: 1, sm: 1, md: 4, lg: 4, xl: 3 }} {...props}>
    {children}
  </Grid>
)

LogoTileContainer.propTypes = {
  children: PropTypes.node
}

export default LogoTileContainer
