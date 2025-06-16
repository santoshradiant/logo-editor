import React, { memo } from 'react'
import PropTypes from 'prop-types'

// import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

const ControlHeader = ({ title, link }) => {
  return (
    <Grid
      container
      spacing={1}
      sx={{
        paddingTop: 4,
        paddingBottom: 4,
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Grid size={'grow'}>
        <Typography variant='h4'>{title}</Typography>
      </Grid>
      {link && (
        <Grid>
          <Button
            variant='outlined'
            color='primary'
            onClick={link.action}
            dataElementLocation={DataElementLocations.BODY}
            dataElementLabel={`logomaker-editor-header-${title}-button`}
            dataElementId={`logomaker-editor-logo-${title}-button`}
          >
            {link.title}
          </Button>
        </Grid>
      )}
    </Grid>
  )
}

ControlHeader.propTypes = {
  title: PropTypes.node.isRequired,
  link: PropTypes.shape({
    title: PropTypes.node,
    action: PropTypes.func
  })
}

export default memo(ControlHeader)
